var express = require('express');
var router = express.Router();
var validator = require('validator');
var bcrypt = require('bcrypt');
var Sequelize = require('sequelize');
var sequelize = new Sequelize('tracklabs', 'root', 'root');

var User = sequelize.define('User', {
	name: Sequelize.STRING,
	email: {
		type: Sequelize.STRING,
		validate: {
			isEmail: true,
		}, 
		unique: true,
	},
	password: Sequelize.STRING,
	dob: Sequelize.DATE,
});

var Place = sequelize.define('Place', {
	name: Sequelize.STRING,
	address: Sequelize.STRING,
	latitude: Sequelize.STRING,
	longitude: Sequelize.STRING,
	place_id: Sequelize.STRING,
});

User.hasMany(Place);

sequelize.sync();
/* GET home page. */
router.get('/', function(req, res, next) {
	var user = require('../json_data/user_data.json');
	if (typeof req.app.get('session').user !== 'undefined')
	{
		//Takes the user to the landing page.
		User.find( { where: { email : user.email }}).then(function() {
			res.render('home', {
				title: 'Home',
				home: true,
				main: true,
				loggedIn: true,
				user: req.app.get('session').user,
			});
		});
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
			error: req.app.get('session').error,
		});
		delete req.app.get('session').message;
		delete req.app.get('session').error;
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
	User.find({where : { email: req.body.email }}).then(function(user) {
		if (!user)
		{
			req.app.get('session').message = "Your credentials are incorrect!";
			req.app.get('session').error = true;
			res.redirect('/login');
		}
		if (bcrypt.compareSync(req.body.password, user.password))
		{
			console.log("Successfully logged in!");
			req.app.get('session').user = user;
		}
		res.redirect('/');
	});
});

router.get('/logout', function(req, res, next) {
	delete req.app.get('session').user;
	req.app.get('session').message = "You have been logged out successfully!";
	res.redirect('/');
});

router.post('/place/add', function(req, res, next) {
	if (typeof req.body.place !== "undefined") {
		Place.find({
			where: {
				place_id: req.body.place.place_id,
				UserId: req.app.get('session').user.id,
			}
		})
		.then(function(place) {
			if (!place) {
				Place.create({
					name: req.body.place.name,
					address: req.body.place.address,
					latitude: req.body.place.lat,
					longitude: req.body.place.long,
					place_id: req.body.place.place_id,
					UserId: req.app.get('session').user.id,
				});
				res.status(200);
				res.send("Place added");
			}
			else
			{
				res.status(400);
				res.json({ 
					place_exists: true
				});
			}
		});
		
	}
});

router.get('/place', function(req, res, next) {
	Place.findAll({ where : { UserId : req.app.get('session').user.id }})
	.then(function(places) {
		res.json({ places: places });
	});
});

router.get('/find/:place_id', function(req, res, next) {
	res.render('locator', {
		title: 'Show Location',
		home: true,
		main: false,
		place_id: req.params.place_id,
	});
});
router.get('/places', function(req, res, next) {
	var user = require('../json_data/user_data.json');
	if (typeof req.app.get('session').user !== 'undefined')
	{
		res.render('places', {
			title: 'My Places',
			places: true,
			loggedIn: true,
			user: req.app.get('session').user,
			main: true,
		});
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

router.get('/register', function(req, res, next) {
	res.render('register', {
		title: 'Register',
		message: req.app.get('session').message,
	});
	delete req.app.get('session').message;
});

router.post('/register', function(req, res, next) {
	var emailCheck = validator.isEmail(req.body.email);
	var dateCheck = validator.isDate(req.body.dob);
	var passwordCheck = (req.body.password == req.body.confirm_password);
	var findcheck = false;
	User.find({where : {email : req.body.email }})
	.then(function(user) {
		//If no user is found, then validation complete
		if (!user)
			findcheck = true;
	});
	var isValidated = emailCheck && dateCheck &&  passwordCheck && findcheck;
	var name = validator.escape(req.body.name);

	if (isValidated && name.length > 0)
	{
		User.create({
			name: name,
			password: bcrypt.hashSync(req.body.password, 10),
			email: req.body.email,
			dob: req.body.dob,
		})
		.then(function(){
			res.redirect('/login');
		})
	}
	else
	{
		var errors = "You have the following errors:\n";
		if (!emailCheck)
			errors += "Email is invalid\n";
		if (!dateCheck)
			errors += "Date is invalid\n";
		if (!passwordCheck)
			errors += "Passwords do not match\n";
		if (!findcheck)
			errors += "User account already exists!\n";
		req.app.get('session').message = errors;
		res.redirect('/register');
	}
});

module.exports = router;
