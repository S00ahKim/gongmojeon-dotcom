const express = require('express');
const Comp_info = require('../../models/comp_info'); 
const Comment = require('../../models/comment'); 
const LikeLog = require('../../models/like-log'); 
const catchErrors = require('../../lib/async-error');

const router = express.Router();

router.use(catchErrors(async (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    next({status: 401, msg: 'Unauthorized'});
  }
}));

router.use('/comp_infos', require('./comp_infos'));

//-Like for comp_info
router.post('/comp_infos/:id/like', catchErrors(async (req, res, next) => {
  const comp_info = await Comp_info.findById(req.params.id);
  if (!comp_info) {
    return next({status: 404, msg: '존재하지 않는 글입니다.'});
  }
  var likeLog = await LikeLog.findOne({author: req.user._id, comp_info: comp_info._id});
  if (!likeLog) {
    comp_info.numLikes++;
    await Promise.all([
      comp_info.save(),
      LikeLog.create({author: req.user._id, comp_info: comp_info._id})
    ]);
  }
  return res.json(comp_info);
}));

// Like for comment
router.post('/comments/:id/like', catchErrors(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  comment.numLikes++;
  await comment.save();
  return res.json(comment);
}));

router.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    status: err.status,
    msg: err.msg || err
  });
});

module.exports = router;
