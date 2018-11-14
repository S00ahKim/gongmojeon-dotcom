const express = require('express');
const Comp_info = require('../models/comp_info');
const User = require('../models/user'); 
const Comment = require('../models/comment'); 
const catchErrors = require('../lib/async-error'); 
const router = express.Router();


function needAuth(req, res, next) {
    if (req.session.user) {
      next();
    } else {
      req.flash('danger', 'Please signin first.');
      res.redirect('/signin');
    }
}

/* GET comp_infos listing. */
router.get('/', catchErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  var query = {};
  const term = req.query.term;
  if (term) {
    query = {$or: [
      {title: {'$regex': term, '$options': 'i'}},
      {content: {'$regex': term, '$options': 'i'}}
    ]};
  }
  const comp_infos = await Comp_info.paginate(query, {
    sort: {createdAt: -1}, 
    populate: 'author', 
    page: page, limit: limit
  });
  res.render('comp_infos/index', {comp_infos: comp_infos, query: req.query});
}));

router.get('/new', needAuth, (req, res, next) => {
  res.render('comp_infos/new', {comp_info: {}});
});

router.get('/:id/edit', needAuth, catchErrors(async (req, res, next) => {
  const comp_info = await Comp_info.findById(req.params.id);
  res.render('comp_infos/edit', {comp_info: comp_info});
}));

router.get('/:id', catchErrors(async (req, res, next) => {
  const comp_info = await Comp_info.findById(req.params.id).populate('author');
  const comments = await Comment.find({comp_info: comp_info.id}).populate('author');
  comp_info.numReads++;    // TODO: 동일한 사람이 본 경우에 Read가 증가하지 않도록???
  await comp_info.save();
  res.render('comp_infos/show', {comp_info: comp_info, comments: comments});
}));

router.put('/:id', catchErrors(async (req, res, next) => {
  const comp_info = await Comp_info.findById(req.params.id);

  if (!comp_info) {
    req.flash('danger', '존재하지 않는 글입니다.');
    return res.redirect('back');
  }
  comp_info.title = req.body.title;
  comp_info.content = req.body.content;
  comp_info.tags = req.body.tags.split(" ").map(e => e.trim());

  await comp_info.save();
  req.flash('success', '성공적으로 저장되었습니다.');
  res.redirect('/comp_infos');
}));

router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
  await Comp_info.findOneAndRemove({_id: req.params.id});
  req.flash('success', '성공적으로 삭제되었습니다.');
  res.redirect('/comp_infos');
}));

router.post('/', needAuth, catchErrors(async (req, res, next) => {
  const user = req.session.user;
  var comp_info = new Comp_info({
    title: req.body.title,
    author: user._id,
    content: req.body.content,
    tags: req.body.tags.split(" ").map(e => e.trim()),
  });
  await comp_info.save();
  req.flash('success', '성공적으로 등록되었습니다.');
  res.redirect('/comp_infos');
}));

router.post('/:id/comments', needAuth, catchErrors(async (req, res, next) => {
  const user = req.session.user;
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

  req.flash('success', '댓글이 성공적으로 등록되었습니다.');
  res.redirect(`/comp_infos/${req.params.id}`);
}));



module.exports = router;
