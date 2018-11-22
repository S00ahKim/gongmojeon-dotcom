module.exports = (app, passport) => {
  app.get('/signin', (req, res, next) => {
    res.render('signin');
  });

  app.post('/signin', passport.authenticate('local-signin', {
    successRedirect: '/comp_infos', // redirect to the secure profile section
    failureRedirect: '/signin', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  //- 카카오 로그인
  app.get('/auth/kakao',
    passport.authenticate('kakao-login')
  );

  app.get('/auth/kakao/callback',
    passport.authenticate('kakao-login', {
      failureRedirect: '/',
      failureFlash: true
    }), (req, res, next) => {
      req.flash('success', '반갑습니다!');
      res.redirect('/comp_infos');
    }
  );

  //- 페이스북 로그인
  app.get('/auth/facebook',
    passport.authenticate('facebook', { scope: 'email' })
  ); //-누구인지 찾음.

  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      failureRedirect: '/signin',
      failureFlash: true // allow flash messages
    }), (req, res, next) => {
      req.flash('success', '반갑습니다!');
      res.redirect('/comp_infos');
    }
  );

  app.get('/signout', (req, res) => {
    req.logout(); //-auto-logout
    req.flash('success', '로그아웃되었습니다.');
    res.redirect('/');
  });
};
