var express = require('express');
var router = express.Router();
var validator = require('validator')
/* GET home page. */
router.get('/', function(req, res, next) {
	var user = require('../json_data/user_data.json');
	if (typeof req.app.get('session').user !== 'undefined')
	{
		//Takes the user to the landing page.
		if (req.app.get('session').user.email == user[0].email)
		{
			res.render('home', {
				title: 'Home',
				home: true,
				main: true,
				loggedIn: true,
				user: req.app.get('session').user,
			});
		}
	}
	else
	{
		var message = req.app.get('session').message;
		res.render('index', { 
  			title: 'Home',
  			messageSet: true,
  			message: message,
  			home: true,
  		});
  		delete req.app.get('session').message;
	}
});

router.get('/login', function(req, res, next) {
	if (typeof req.app.get('session').message !== 'undefined')
	{
		var message = req.app.get('session').message;
		res.render('login', {
			title: 'Login',
			messageSet: true,
			message: message,
		});
		delete req.app.get('session').message;
	}
	else
	{
		res.render('login', { 
			title: 'Login',
			messageSet: false,
		});	
	}
});

router.post('/login', function(req, res, next) {
	var user = require('../json_data/user_data.json');
	//Using user 0 as an example login case
	if (req.body.email == user[0].email && req.body.password == user[0].password)
	{
		//User is logged in
		console.log("Successfully logged in!");
		req.app.get('session').user = user[0];
		res.redirect('/');
	}
});

router.get('/logout', function(req, res, next) {
	delete req.app.get('session').user;
	req.app.get('session').message = "You have been logged out successfully!";
	res.redirect('/');
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

router.post('/register', function(req, res, next) {
	var isValidated = validator.isEmail(req.body.email) && validator.isDate(req.body.dob) && (req.body.password == req.body.confirm_password);
	var name = validator.escape(req.body.name);

	if (isValidated && name.length > 0)
	{
		req.app.get('session').message = "You have been registered successfully!";
		res.redirect('/login');
	}
});
module.exports = router;
