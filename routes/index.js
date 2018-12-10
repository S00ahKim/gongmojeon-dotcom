var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/notice', function(req, res, next){
  res.render('notice');
})

router.get('/img', function(req, res, next){
  res.render('img');
})

router.get('/developer', function(req, res, next){
  res.render('developer');
})

module.exports = router;
