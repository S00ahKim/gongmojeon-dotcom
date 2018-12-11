const express = require('express');
const CompInfo = require('../models/compInfo');
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

  /* GET compInfo listing. */
  router.get('/', catchErrors(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    var query = {ulif:{$ne:"wait"}};
    const term = req.query.term;
    if (term) {
      query = {$or: [
        {title: {'$regex': term, '$options': 'i'}},
        {content: {'$regex': term, '$options': 'i'}},
        {tags: {'$regex': term, '$options': 'i'}}
      ]};
    }
    const compInfos = await CompInfo.paginate(query, {
      sort: {createdAt: -1}, 
      populate: 'author', 
      page: page, limit: limit
    });
    res.render('compInfos/index', {compInfos: compInfos, term: term, query: req.query});
  }));

  router.get('/new', needAuth, (req, res, next) => {
    res.render('compInfos/new', {compInfo: {}});
  });

  router.get('/:id/edit', needAuth, catchErrors(async (req, res, next) => {
    const compInfo = await CompInfo.findById(req.params.id);
    res.render('compInfos/edit', {compInfo: compInfo});
  }));

  router.get('/:id/editbyadmin', needAuth, catchErrors(async (req, res, next) => {
    const compInfo = await CompInfo.findById(req.params.id);
    res.render('compInfos/editbyadmin', {compInfo: compInfo});
  }));

  router.get('/:id/upload', needAuth, catchErrors(async (req, res, next) => {
    const compInfos = await CompInfo.findById(req.params.id);
    res.render('compInfos/upload', {compInfos: compInfos});
  }));

  //- 신고된 글 확인
  router.get('/off', needAuth, catchErrors(async (req, res, next) => {
    const compInfos = await CompInfo.find({off:{$gt:0}});
    res.render('compInfos/off', {compInfos: compInfos});
  }));

  //- 승인대기글 확인
  router.get('/waiting', needAuth, catchErrors(async (req, res, next) => {
    const compInfos = await CompInfo.find({ulif:"wait"});
    res.render('compInfos/waiting', {compInfos: compInfos});
  }));

  // 신고 횟수 추가
  router.post('/:id/off', catchErrors(async (req, res, next) => {
    console.log("신고횟수추가");
    const compInfo = await CompInfo.findById(req.params.id);
    if (!compInfo) {
      return next({status: 404, msg: '존재하지 않는 글입니다.'});
    }
    compInfo.off++;
    await compInfo.save(function(err){
      req.flash('success', '신고가 접수되었습니다.');
      res.redirect('back');
    });
  }));

  //- 즐겨찾기 추가
  router.post('/:id/favorite', catchErrors(async (req, res, next) => {
    console.log("즐찾추가");
    const compInfo = await CompInfo.findById(req.params.id);
    const user = await User.findById(req.user.id);
    user.favorite = req.params.id;
    await user.save(function(err) {
      req.flash('success', '즐겨찾기에 추가되었습니다.');
      res.redirect('back');
    });
  }));

  router.get('/:id', catchErrors(async (req, res, next) => {
    const compInfo = await CompInfo.findById(req.params.id).populate('author');
    const comments = await Comment.find({compInfo: compInfo.id}).populate('author');
    compInfo.numReads++;    // TODO: 동일한 사람이 본 경우에 Read가 증가하지 않도록???

    await compInfo.save();
    res.render('compInfos/show', {compInfo: compInfo, comments: comments});
    res.render('index', {compInfo: compInfo, comments: comments});
  }));


  router.put('/:id/edit', catchErrors(async (req, res, next) => { 
    console.log("들어옴")
    const compInfo = await CompInfo.findById(req.params.id);

    if (!compInfo) {
      req.flash('danger', '존재하지 않는 글입니다.');
      return res.redirect('back');
    }

    compInfo.title = req.body.title;
    compInfo.author = req.user._id;
    compInfo.content = req.body.content;
    compInfo.topic = req.body.topic;
    compInfo.location = req.body.location;
    compInfo.location_map = req.body.location_map;
    compInfo.lat = req.body.lat;
    compInfo.lng = req.body.lng;
    compInfo.start = req.body.start;
    compInfo.end = req.body.end;
    compInfo.applicant = req.body.applicant;
    compInfo.host = req.body.host;
    compInfo.manager = req.body.manager;
    compInfo.contact = req.body.contact;
    compInfo.ref = req.body.ref;
    compInfo.tags = req.body.tags.split(" ").map(e => e.trim());
    compInfo.ulif = req.body.ulif;
    console.log("옴")

    await compInfo.save();
    console.log("세이브")
    req.flash('success', '수정되었습니다.');
    res.redirect('/compInfos');
  }));

  router.put('/:id/editbyadmin', catchErrors(async (req, res, next) => {
    const compInfo = await CompInfo.findById(req.params.id);

    if (!compInfo) {
      req.flash('danger', '존재하지 않는 글입니다.');
      return res.redirect('back');
    }
    compInfo.topic = req.body.topic;
    compInfo.applicant = req.body.applicant;
    compInfo.ulif = req.body.ulif;

    await compInfo.save();
    req.flash('success', '수정되었습니다.');
    res.redirect('/compInfos');
  }));

  router.put('/:id/upload', catchErrors(async (req, res, next) => {
    const compInfos = await CompInfo.findById(req.params.id);

    if (!compInfos) {
      req.flash('danger', '존재하지 않는 글입니다.');
      return res.redirect('back');
    }
    
    compInfos.ulif = req.body.ulif;

    await compInfos.save();
    req.flash('success', '승인되었습니다.');
    res.redirect('/compInfos/waiting');
  }));

  router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
    await CompInfo.findOneAndRemove({_id: req.params.id});
    req.flash('success', '삭제되었습니다.');
    res.redirect('/compInfos');
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
    var compInfo = new CompInfo({
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
      const filename = compInfo.id + "/" + req.file.originalname;
      await fs.move(req.file.path, dest + filename);
      compInfo.img = "/images/uploads/" + filename;
    }
    await compInfo.save();
    req.flash('success', '등록되었습니다.');
    res.redirect('/compInfos');
  }));

  router.post('/:id/comments', needAuth, catchErrors(async (req, res, next) => {
    const user = req.user;
    const compInfo = await CompInfo.findById(req.params.id);

    if (!compInfo) {
      req.flash('danger', '존재하지 않는 글입니다.');
      return res.redirect('back');
    }

    var comment = new Comment({
      author: user._id,
      compInfo: compInfo._id,
      content: req.body.content
    });
    await comment.save();
    compInfo.numComments++;
    await compInfo.save();

    const url = `/compInfos/${compInfo._id}#${comment._id}`;
    io.to(compInfo.author.toString())
      .emit('commentted', {url: url, compInfo: compInfo});
    console.log('SOCKET EMIT', compInfo.author.toString(), 'commentted', {url: url, compInfo: compInfo})
    req.flash('success', '댓글이 등록되었습니다.');
    res.redirect(`/compInfos/${req.params.id}`);
  }));

  return router;
};
