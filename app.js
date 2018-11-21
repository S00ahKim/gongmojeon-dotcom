var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//var sassMiddleware = require('node-sass-middleware');
var session = require('express-session');
var methodOverride = require('method-override');
var flash = require('connect-flash');
var mongoose   = require('mongoose');
var passport = require('passport');
var passportSocketIo = require('passport.socketio');
var index = require('./routes/index');
var users = require('./routes/users');
var comp_infos = require('./routes/comp_infos');

var passportConfig = require('./lib/passport-config');

module.exports = (app, io) => {

  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'pug');
  if (app.get('env') === 'development') {
    app.locals.pretty = true;
  }

  // local append: moment lib, queryString lib
  app.locals.moment = require('moment');
  app.locals.querystring = require('querystring');

  // mongodb connect
  mongoose.Promise = global.Promise; // ES6 Native Promise를 mongoose에서 사용한다.

  // TODO: atlas에 연결하기. 1118: local db 이용
  const connStr = 'mongodb://localhost/comp_info_db';
  mongoose.connect(connStr, {useMongoClient: true });
  mongoose.connection.on('error', console.error);

  // Favicon set
  app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());

  // overriding: _method로 method를 변경 가능 (put/delete)
  app.use(methodOverride('_method', {methods: ['POST', 'GET']}));

  // sass, scss: no use
  // app.use(sassMiddleware({
  //   src: path.join(__dirname, 'public'),
  //   dest: path.join(__dirname, 'public'),
  //   indentedSyntax: false, // true = .sass and false = .scss
  //   debug: true,
  //   sourceMap: true
  // }));

  // session
  const sessionStore = new session.MemoryStore();
  const sessionId = 'gongmozeondotcom.sid';
  const sessionSecret =  'longsessionsecretofcompinfo344141'
  
  app.use(session({
    name: sessionId,
    resave: true,
    saveUninitialized: true,
    store: sessionStore,
    secret: sessionSecret
  }));

  // flash msg
  app.use(flash()); 

  // Public dir service as static status
  app.use(express.static(path.join(__dirname, 'public')));

  // Passport Initiate
  app.use(passport.initialize());
  app.use(passport.session());
  passportConfig(passport);

  // pug의 local에 현재 사용자 정보와 flash 메시지를 전달
  app.use(function(req, res, next) {
    res.locals.currentUser = req.user;  // passport는 req.user로 user정보 전달
    res.locals.flashMessages = req.flash();
    next();
  });

  

  // Route
  app.use('/', index);
  app.use('/users', users);
  app.use('/comp_infos', comp_infos);
  require('./routes/auth')(app, passport);

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // error handler
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });

  return app;
}