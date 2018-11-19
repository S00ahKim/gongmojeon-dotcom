var express = require('express');
var User = require('../models/user');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/signin', function(req, res, next) {
  res.render('signin');
});

// login using Session
router.post('/signin', function(req, res, next) {
  User.findOne({email: req.body.email}, function(err, user) {
    if (err) {
      res.render('error', {message: "Error", error: err});
    } else if (!user || user.password !== req.body.password) {
      req.flash('danger', '이용할 수 없는 사용자 혹은 비밀번호입니다.');
      res.redirect('back');
    } else {
      req.session.user = user;
      req.flash('success', '반갑습니다!');
      res.redirect('/');
    }
  });
});

router.get('/signout', function(req, res, next) {
  delete req.session.user;
  req.flash('success', '로그아웃되었습니다.');
  res.redirect('/');
});


module.exports = router;
