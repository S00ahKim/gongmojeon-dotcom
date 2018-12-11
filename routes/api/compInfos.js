const express = require('express');
const CompInfo = require('../../models/compInfo');
const catchErrors = require('../../lib/async-error');

const router = express.Router();

// Index
router.get('/', catchErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const compInfos = await CompInfo.paginate({}, {
    sort: {createdAt: -1}, 
    populate: 'author',
    page: page, limit: limit
  });
  res.json({compInfos: compInfos.docs, page: compInfos.page, pages: compInfos.pages});   
}));

// Read
router.get('/:id', catchErrors(async (req, res, next) => {
  const compInfo = await CompInfo.findById(req.params.id).populate('author');
  res.json(compInfo);
}));

// Create
router.post('', catchErrors(async (req, res, next) => {
  var compInfo = new CompInfo({
    title: req.body.title,
    author: req.user._id,
    content: req.body.content,
    tags: req.body.tags.map(e => e.trim()),
  });
  await compInfo.save();
  res.json(compInfo)
}));

// Put
router.put('/:id', catchErrors(async (req, res, next) => {
  const compInfo = await CompInfo.findById(req.params.id);
  if (!compInfo) {
    return next({status: 404, msg: '존재하지 않는 글입니다.'});
  }
  if (compInfo.author && compInfo.author._id != req.user._id) {
    return next({status: 403, msg: '수정할 수 없습니다.'});
  }
  compInfo.title = req.body.title;
  compInfo.content = req.body.content;
  compInfo.tags = req.body.tags;
  await compInfo.save();
  res.json(compInfo);
}));

// Delete
router.delete('/:id', catchErrors(async (req, res, next) => {
  const compInfo = await CompInfo.findById(req.params.id);
  if (!compInfo) {
    return next({status: 404, msg: '존재하지 않는 글입니다.'});
  }
  if (compInfo.author && compInfo.author._id != req.user._id) {
    return next({status: 403, msg: '수정할 수 없습니다.'});
  }
  await CompInfo.findOneAndRemove({_id: req.params.id});
  res.json({msg: '삭제되었습니다.'});
}));


module.exports = router;