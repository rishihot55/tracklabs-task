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
	//Using user 0 as an example login case
	User.find({where : { email: req.body.email }}).then(function(user) {
		if (bcrypt.compareSync(req.body.password, user.password))
		{
			console.log("Successfully logged in!");
			req.app.get('session').user = user;
			res.redirect('/');
		}
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

router.get('/places', function(req, res, next) {
	var user = require('../json_data/user_data.json');
	if (typeof req.app.get('session').user !== 'undefined')
	{
		res.render('places', {
			title: 'My Places',
			places: true,
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
	});
});

router.post('/register', function(req, res, next) {
	var isValidated = validator.isEmail(req.body.email) && validator.isDate(req.body.dob) && (req.body.password == req.body.confirm_password);
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
});
module.exports = router;
