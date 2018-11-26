const express = require('express');
const User = require('../models/user');
const Comp_info = require('../models/comp_info');
const router = express.Router();
const catchErrors = require('../lib/async-error');

function needAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash('danger', '먼저 로그인 해주세요.');
    res.redirect('/signin');
  }
}

// TODO: 1118: 입력되어야 하는 정보 추가할 것 (comp_infos 에도 마찬가지)
function validateForm(form, options) {
  var name = form.name || "";
  var email = form.email || "";
  name = name.trim();
  email = email.trim();

  if (!name) {
    return '이름이 입력되어야 합니다.';
  }

  if (!email) {
    return '이메일이 입력되어야 합니다.';
  }

  if (!form.password && options.needPassword) {
    return '비밀번호가 입력되어야 합니다.';
  }

  if (form.password !== form.password_confirmation) {
    return '비밀번호가 맞지 않습니다.';
  }

  if (form.password.length < 6) {
    return '비밀번호는 최소 6글자 이상이어야 합니다.';
  }

  return null;
}

/* GET users listing. */
router.get('/', needAuth, catchErrors(async (req, res, next) => {
  const users = await User.find({});
  res.render('users/index', {users: users});
}));

router.get('/new', (req, res, next) => {
  res.render('users/new', {messages: req.flash()});
});

router.get('/:id/edit', needAuth, catchErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  res.render('users/edit', {user: user});
}));

router.put('/:id', needAuth, catchErrors(async (req, res, next) => {
  const err = validateForm(req.body);
  if (err) {
    req.flash('danger', err);
    return res.redirect('back');
  }

  const user = await User.findById({_id: req.params.id});
  if (!user) {
    req.flash('danger', '존재하지 않는 사용자입니다.');
    return res.redirect('back');
  }

  if (!await user.validatePassword(req.body.current_password)) {
    req.flash('danger', '유효하지 않은 비밀번호입니다.');
    return res.redirect('back');
  }

  user.name = req.body.name;
  user.email = req.body.email;
  if (req.body.password) {
    user.password = await user.generateHash(req.body.password);
  }
  await user.save();
  req.flash('success', '수정되었습니다.');
  res.redirect('/users');
}));

router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
  const user = await User.findOneAndRemove({_id: req.params.id});
  req.flash('success', '삭제되었습니다.');
  res.redirect('/users');
}));

router.get('/:id', catchErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  res.render('users/show', {user: user});
}));

router.post('/', catchErrors(async (req, res, next) => {
  var err = validateForm(req.body, {needPassword: true});
  if (err) {
    req.flash('danger', err);
    return res.redirect('back');
  }
  var user = await User.findOne({email: req.body.email});
  console.log('USER???', user);
  if (user) {
    req.flash('danger', '이미 존재하는 이메일 주소입니다.');
    return res.redirect('back');
  }
  user = new User({
    name: req.body.name,
    email: req.body.email,
  });
  user.password = await user.generateHash(req.body.password);
  await user.save();
  req.flash('success', '완료되었습니다. 로그인 해주세요.');
  res.redirect('/');
}));

module.exports = router;
