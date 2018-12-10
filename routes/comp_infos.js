const express = require('express');
const Comp_info = require('../models/comp_info');
const User = require('../models/user'); 
const Comment = require('../models/comment');
const catchErrors = require('../lib/async-error');

const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');

module.exports = io => {
  const router = express.Router();
  
  function needAuth(req, res, next) {
    if (req.isAuthenticated()) {
      next();
    } else {
      req.flash('danger', '먼저 로그인 해주세요.');
      res.redirect('/signin');
    }
  }

  /* GET comp_info listing. */
  router.get('/', catchErrors(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    var query = {};
    const term = req.query.term;
    if (term) {
      query = {$or: [
        {title: {'$regex': term, '$options': 'i'}},
        {content: {'$regex': term, '$options': 'i'}},
        {tags: {'$regex': term, '$options': 'i'}}
      ]};
    }
    const comp_infos = await Comp_info.paginate(query, {
      sort: {createdAt: -1}, 
      populate: 'author', 
      page: page, limit: limit
    });
    res.render('comp_infos/index', {comp_infos: comp_infos, term: term, query: req.query});
  }));

  router.get('/new', needAuth, (req, res, next) => {
    res.render('comp_infos/new', {comp_info: {}});
  });

  router.get('/:id/edit', needAuth, catchErrors(async (req, res, next) => {
    const comp_info = await Comp_info.findById(req.params.id);
    res.render('comp_infos/edit', {comp_info: comp_info});
  }));

  router.get('/:id/editbyadmin', needAuth, catchErrors(async (req, res, next) => {
    const comp_info = await Comp_info.findById(req.params.id);
    res.render('comp_infos/editbyadmin', {comp_info: comp_info});
  }));

  //- 신고처리
  router.get('/off', needAuth, catchErrors(async (req, res, next) => {
    const comp_info = await Comp_info.find({off:1});
    res.render('comp_infos/off', {comp_info: comp_info});
  }));

  //- 승인대기글
  router.get('/waiting', needAuth, catchErrors(async (req, res, next) => {
    const comp_info = await Comp_info.find({ulif:"wait"});
    res.render('comp_infos/waiting', {comp_info: comp_info});
  }));


  //- 여기서 아이디: 글 고유 아이디, 즐겨찾기 추가할 때 씀
  router.get('/:id/favorite', needAuth, catchErrors(async (req, res, next) => {
    const comp_info = await Comp_info.findById(req.params.id);
    const user = await User.findById(req.user.id);
    user.favorite.push(comp_info._id);
    user.save(function(err) {
      req.flash('success', '즐겨찾기에 추가되었습니다.');
      res.redirect('back');
    });
  }));

  router.get('/:id', catchErrors(async (req, res, next) => {
    const comp_info = await Comp_info.findById(req.params.id).populate('author');
    const comments = await Comment.find({comp_info: comp_info.id}).populate('author');
    comp_info.numReads++;    // TODO: 동일한 사람이 본 경우에 Read가 증가하지 않도록???

    await comp_info.save();
    res.render('comp_infos/show', {comp_info: comp_info, comments: comments});
    res.render('index', {comp_info: comp_info, comments: comments});
  }));


  router.put('/:id/edit', catchErrors(async (req, res, next) => {
    console.log("들어옴")
    const comp_info = await Comp_info.findById(req.params.id);

    if (!comp_info) {
      req.flash('danger', '존재하지 않는 글입니다.');
      return res.redirect('back');
    }

    comp_info.title = req.body.title;
    comp_info.author = req.user._id;
    comp_info.content = req.body.content;
    comp_info.topic = req.body.topic;
    comp_info.location = req.body.location;
    comp_info.location_map = req.body.location_map;
    comp_info.lat = req.body.lat;
    comp_info.lng = req.body.lng;
    comp_info.start = req.body.start;
    comp_info.end = req.body.end;
    comp_info.applicant = req.body.applicant;
    comp_info.host = req.body.host;
    comp_info.manager = req.body.manager;
    comp_info.contact = req.body.contact;
    comp_info.ref = req.body.ref;
    comp_info.tags = req.body.tags.split(" ").map(e => e.trim());
    comp_info.ulif = req.body.ulif;
    console.log("옴")

    await comp_info.save();
    console.log("세이브")
    req.flash('success', '수정되었습니다.');
    res.redirect('/comp_infos');
  }));

  router.put('/:id/editbyadmin', catchErrors(async (req, res, next) => {
    const comp_info = await Comp_info.findById(req.params.id);

    if (!comp_info) {
      req.flash('danger', '존재하지 않는 글입니다.');
      return res.redirect('back');
    }
    comp_info.topic = req.body.topic;
    comp_info.applicant = req.body.applicant;
    comp_info.ulif = req.body.ulif;

    await comp_info.save();
    req.flash('success', '수정되었습니다.');
    res.redirect('/comp_infos');
  }));

  router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
    await Comp_info.findOneAndRemove({_id: req.params.id});
    req.flash('success', '삭제되었습니다.');
    res.redirect('/comp_infos');
  }));


  const mimetypes = {
    "image/jpeg": "jpg",
    "image/gif": "gif",
    "image/png": "png"
  };
  const upload = multer({
    dest: 'tmp', 
    fileFilter: (req, file, cb) => {
      var ext = mimetypes[file.mimetype];
      if (!ext) {
        return cb(new Error('이미지 파일만 올릴 수 있습니다.'), false);
      }
      cb(null, true);
    }
  }); // TODO: tmp라는 폴더를 미리 만들고 해야 함.

  router.post('/', needAuth, 
        upload.single('img'), // img라는 필드를 req.file로 저장함.
        catchErrors(async (req, res, next) => {
    var comp_info = new Comp_info({
      title: req.body.title,
      author: req.user._id,
      content: req.body.content,
      topic: req.body.topic,
      location: req.body.location,
      location_map: req.body.location_map,
      lat: req.body.lat,
      lng: req.body.lng,
      start: req.body.start,
      end: req.body.end,
      applicant: req.body.applicant,
      host: req.body.host,
      manager: req.body.manager,
      contact: req.body.contact,
      ref: req.body.ref,
      ulif: req.body.ulif,
      tags: req.body.tags.split(" ").map(e => e.trim()),
    });
    if (req.file) {
      const dest = path.join(__dirname, '../public/images/uploads/');  // 옮길 디렉토리
      console.log("File ->", req.file); // multer의 output이 어떤 형태인지 보자.
      const filename = comp_info.id + "/" + req.file.originalname;
      await fs.move(req.file.path, dest + filename);
      comp_info.img = "/images/uploads/" + filename;
    }
    await comp_info.save();
    req.flash('success', '등록되었습니다.');
    res.redirect('/comp_infos');
  }));

  router.post('/:id/comments', needAuth, catchErrors(async (req, res, next) => {
    const user = req.user;
    const comp_info = await Comp_info.findById(req.params.id);

    if (!comp_info) {
      req.flash('danger', '존재하지 않는 글입니다.');
      return res.redirect('back');
    }

    var comment = new Comment({
      author: user._id,
      comp_info: comp_info._id,
      content: req.body.content
    });
    await comment.save();
    comp_info.numComments++;
    await comp_info.save();

    const url = `/comp_infos/${comp_info._id}#${comment._id}`;
    io.to(comp_info.author.toString())
      .emit('commentted', {url: url, comp_info: comp_info});
    console.log('SOCKET EMIT', comp_info.author.toString(), 'commentted', {url: url, comp_info: comp_info})
    req.flash('success', '댓글이 등록되었습니다.');
    res.redirect(`/comp_infos/${req.params.id}`);
  }));

  return router;
};
