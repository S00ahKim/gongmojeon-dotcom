const express = require('express');
const Comp_info = require('../../models/comp_info');
const catchErrors = require('../../lib/async-error');

const router = express.Router();

// Index
router.get('/', catchErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const comp_infos = await Comp_info.paginate({}, {
    sort: {createdAt: -1}, 
    populate: 'author',
    page: page, limit: limit
  });
  res.json({comp_infos: comp_infos.docs, page: comp_infos.page, pages: comp_infos.pages});   
}));

// Read
router.get('/:id', catchErrors(async (req, res, next) => {
  const comp_info = await Comp_info.findById(req.params.id).populate('author');
  res.json(comp_info);
}));

// Create
router.post('', catchErrors(async (req, res, next) => {
  var comp_info = new Comp_info({
    title: req.body.title,
    author: req.user._id,
    content: req.body.content,
    tags: req.body.tags.map(e => e.trim()),
  });
  await comp_info.save();
  res.json(comp_info)
}));

// Put
router.put('/:id', catchErrors(async (req, res, next) => {
  const comp_info = await Comp_info.findById(req.params.id);
  if (!comp_info) {
    return next({status: 404, msg: '존재하지 않는 글입니다.'});
  }
  if (comp_info.author && comp_info.author._id != req.user._id) {
    return next({status: 403, msg: '수정할 수 없습니다.'});
  }
  comp_info.title = req.body.title;
  comp_info.content = req.body.content;
  comp_info.tags = req.body.tags;
  await comp_info.save();
  res.json(comp_info);
}));

// Delete
router.delete('/:id', catchErrors(async (req, res, next) => {
  const comp_info = await Comp_info.findById(req.params.id);
  if (!comp_info) {
    return next({status: 404, msg: '존재하지 않는 글입니다.'});
  }
  if (comp_info.author && comp_info.author._id != req.user._id) {
    return next({status: 403, msg: '수정할 수 없습니다.'});
  }
  await Comp_info.findOneAndRemove({_id: req.params.id});
  res.json({msg: '삭제되었습니다.'});
}));


module.exports = router;