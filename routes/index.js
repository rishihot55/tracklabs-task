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

router.post('/login', function(req, res, next) {
	var user = require('../json_data/user_data.json');
	if (req.body.email == user[0].email && req.body.password == user[0].password)
	{
		//User is logged in
		console.log("Successfully logged in!");
		res.redirect('/');
	}
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
