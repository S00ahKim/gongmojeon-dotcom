var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sassMiddleware = require('node-sass-middleware');
var session = require('express-session');
var methodOverride = require('method-override');
var flash = require('connect-flash');
var mongoose   = require('mongoose');
var passport = require('passport');

var index = require('./routes/index');
var users = require('./routes/users');
var comp_infos = require('./routes/comp_infos');

var passportConfig = require('./lib/passport-config');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// local append: moment lib, queryString lib
app.locals.moment = require('moment');
app.locals.querystring = require('querystring');

// mongodb connect
mongoose.Promise = global.Promise;

// DB name -- 1117: mLab 아닌 Atlas로 접속.
const connStr = 'mongodb://admin26:adminpw26@cluster0-shard-00-00-s36ax.mongodb.net:27017,cluster0-shard-00-01-s36ax.mongodb.net:27017,cluster0-shard-00-02-s36ax.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true'; 
mongoose.connect(connStr, {useMongoClient: true });
mongoose.connection.on('error', console.error);

// favicon set
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// method overriding
app.use(methodOverride('_method', {methods: ['POST', 'GET']}));

// Session
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: 'long-long-long-secret-string-1313513tefgwdsvbjkvasd'
}));

// Flash
app.use(flash());

// SASS, SCSS
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));

// Public dir service as static status
app.use(express.static(path.join(__dirname, 'public')));

// Passport initiate
app.use(passport.initialize());
app.use(passport.session());
passportConfig(passport);

// pug_local : user info + flash msg 전달
app.use(function(req, res, next) {
  res.locals.currentUser = req.session.user; // passport는 req.user로 user정보 전달
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

module.exports = app;
