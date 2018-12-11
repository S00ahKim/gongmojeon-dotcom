const express = require('express');
const CompInfo = require('../../models/compInfo'); 
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

router.use('/compInfos', require('./compInfos'));

//-Like for compInfo
router.post('/compInfos/:id/like', catchErrors(async (req, res, next) => {
  const compInfo = await CompInfo.findById(req.params.id);
  if (!compInfo) {
    return next({status: 404, msg: '존재하지 않는 글입니다.'});
  }
  var likeLog = await LikeLog.findOne({author: req.user._id, compInfo: compInfo._id});
  if (!likeLog) {
    compInfo.numLikes++;
    await Promise.all([
      compInfo.save(),
      LikeLog.create({author: req.user._id, compInfo: compInfo._id})
    ]);
  }
  return res.json(compInfo);
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
