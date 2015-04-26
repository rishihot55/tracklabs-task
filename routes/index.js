var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { 
  	title: 'Home',
  	home: true,
  	main: true,
  });
});

router.get('/login', function(req, res, next) {
	res.render('login', { 
		title: 'Login',
	});	
});

router.get('/places', function(req, res, next) {
	res.render('places', {
		title: 'My Places',
		places: true,
		main: true,
	});
});

router.get('/register', function(req, res, next) {
	res.render('register', {
		title: 'Register',
	});
});
module.exports = router;
