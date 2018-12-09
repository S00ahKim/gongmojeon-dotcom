const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
var KakaoStrategy = require('passport-kakao').Strategy;
const User = require('../models/user');


//- done은 callback.
module.exports = function (passport) {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, done);
  });

  passport.use('local-signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  }, async (req, email, password, done) => {
    try {
      const user = await User.findOne({ email: email });
      if (user && await user.validatePassword(password)) {
        return done(null, user, req.flash('success', '반갑습니다!'));
      }
      return done(null, false, req.flash('danger', '유효하지 않은 이메일 또는 비밀번호입니다.'));
    } catch (err) {
      done(err);
    }
  }));

  //TODO: 사용자 관리 추가해야함.
  passport.use('kakao-login', new KakaoStrategy({
    clientID: '7235e7c57191d55774b383b2856384b2',
    clientSecret: 'jBMgTcF89UenC2hfRwOCIiIqrbKtyx6x',
    callbackURL: 'https://afternoon-lowlands-50952.herokuapp.com/auth/kakao/callback'
  }, async (token, refreshToken, profile, done) => {
    try {
      var email = profile._json.kaccount_email;
      console.log(email);
      var picture = profile._json.properties.profile_image;
      var name = profile.displayName;
      var user = await User.findOne({ 'kakaotalk.id': profile.id });
      if (!user) {
        if (email) {
          user = await User.findOne({ email: email });
        }
        if (!user) {
          user = new User({ name: name });
          user.email = email ? email : `__unknown-${user._id}@no-email.com`;
        }
        user.kakaotalk.id = profile.id;
        user.kakaotalk.photo = picture;
      }
      user.kakaotalk.token = profile.token;
      await user.save();
      return done(null, user);
    } catch (err) {
      don(err);
    }
  }));

  passport.use(new FacebookStrategy({
    clientID: '217833632441312',
    clientSecret: '10e0f66486032b7cb25caa87d7abef3b',
    callbackURL: 'https://afternoon-lowlands-50952.herokuapp.com/auth/facebook/callback',  //TODO: url 수정해야 함. id, secret은 수정. +카카오톡
    profileFields: ['email', 'name', 'picture']
  }, async (token, refreshToken, profile, done) => {
    console.log('Facebook', profile); // profile 정보로 뭐가 넘어오나 보자.
    try {
      var email = (profile.emails && profile.emails[0]) ? profile.emails[0].value : '';
      var picture = (profile.photos && profile.photos[0]) ? profile.photos[0].value : '';
      var name = (profile.displayName) ? profile.displayName :
        [profile.name.givenName, profile.name.middleName, profile.name.familyName]
          .filter(e => e).join(' ');
      console.log(email, picture, name, profile.name);
      // 같은 facebook id를 가진 사용자가 있나?
      var user = await User.findOne({ 'facebook.id': profile.id });
      if (!user) {
        // 없다면, 혹시 같은 email이라도 가진 사용자가 있나?
        if (email) {
          user = await User.findOne({ email: email });
        }
        if (!user) {
          // 그것도 없다면 새로 만들어야지.
          user = new User({ name: name });
          user.email = email ? email : `__unknown-${user._id}@no-email.com`;
        }
        // facebook id가 없는 사용자는 해당 id를 등록
        user.facebook.id = profile.id;
        user.facebook.photo = picture;
      }
      user.facebook.token = profile.token;
      await user.save();
      return done(null, user);
    } catch (err) {
      done(err);
    }
  }));
};
