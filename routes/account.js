console.log("account.js");

var express = require('express');
var router = express.Router();

const path = require('path');

var mongoose = require('mongoose');

// Load user input validator
const { check, validationResult } = require('express-validator');

// Load Models
var AccountModel = require('../models/account-model');
var AppointmentModel = require('../models/appointment-model');

router.route('/').
	get(function(req, res) {
		if(typeof(req.session.user) != "undefined") {
			var user = req.session.user;
			console.log(`${user} visited /`);
			// res.status(200).send("Reached /!");
			res.render('account', {});
		} else {
			res.render('login', {});
		}
	}
);

router.route('/login').
	get(
		function(req, res) {
			// already logged in?
			if(typeof(req.session.user) != "undefined") {
				console.log(`Already logged in as ${req.session.user}`);
				res.render('account', {});
			} 
			// return res.sendFile(path.join(__dirname, '../views/login.html'));
			res.render('login', {});
		}
	).
	post(
		[
			check('email', 'Invalid e-mail address').exists().isEmail(),
			check('password', 'Password was empty').exists(),
		],
		function(req, res) {
			const errors = validationResult(req);
			if(!errors.isEmpty()) {
				return res.status(422).json({ errors: errors.array() });
			}

			// already logged in?
			if(typeof(req.session.user) != "undefined") {
				console.log(`Already logged in as ${req.session.user}`);
				return res.send("Already logged in");
			} 

			// console.log(req.body);
			var email = req.body.email;
			var password = req.body.password;
			
			// Query database for account with this email
			AccountModel.findOne({email}, function(err, record) {
				if(err) res.send(err);
				else if(record) {
					record.comparePassword(password, function(err, isMatch) {
						if(err) res.send(err);
						if(isMatch) {
							//cookie
							req.session.user = email;
							req.session.id = record._id;

							res.render('account', {});
						} else {
							res.send("Incorrect password");
						}
					});
				} else {
					res.send("Account not found: " + email);
				}
			});
		}
	)
;

router.route('/logout').all(function(req, res) {
	req.session.destroy();
	res.render('login', {});
});

router.route('/createaccount').
	get(
		function(req, res) {
			res.redirect("/creataccount");
		}
	).
	post(
		[
			check('email', 'Invalid e-mail address').exists().isEmail(),
			check('password', 'Password was empty').exists()
		], function(req, res) {
			const errors = validationResult(req);
			if(!errors.isEmpty()) {
				return res.status(422).json({ errors: errors.array() });
			}

			// already logged in?
			if(typeof(req.session.user) != "undefined") {
				console.log(`Already logged in as ${req.session.user}`);
				res.send("Logout first");
			}

			var email = req.body.email;
			var password = req.body.password;

			// Query database for how many accounts with this email exist
			AccountModel.count({email: email}, function(err, count) {
				if(err) res.send(err);
				else if(count > 0) {
					console.log("Duplicate email: " + email);
					res.status(401).send("E-mail already in use: " + email);
				} else {
					var newAccount = new AccountModel({email, password});
					newAccount.save();
					res.send("all good!");
				}
			})
		}
	)
// TODO: complete
router.route('/deleteaccount').
	post(
		[
			check('email', 'Invalid e-mail address').exists().isEmail(),
			check('password', 'Password was empty').exists(),
		], function(req, res) {
			// var email = req.body.email;
			// var password = req.body.password;

			// // Query database for how many accounts with this email exist
			// AccountModel.count({email}, function(err, count) {
			// 	if(err) res.send(err);
			// 	else if(count > 0) {
			// 		console.log("Duplicate email: " + email);
			// 		res.send("duplicate email");
			// 	} else {
			// 		var newAccount = new AccountModel({email, password});
			// 		newAccount.save();
			// 		res.send("all good!");
			// 	}
			// })
		}
	)
;

router.route('/scheduleappointment').
	get(
		function(req, res) {
			// already logged in?
			if(typeof(req.session.user) != "undefined") {
				console.log(`Already logged in as ${req.session.user}`);
				res.render('scheduleappointment', {});
			} 
			// return res.sendFile(path.join(__dirname, '../views/login.html'));
			res.render('login', {});
		}
	).
	post(
		[
			check('date').exists().isDate()
		],
		function(req, res) {
			const errors = validationResult(req);
			if(!errors.isEmpty()) {
				return res.status(422).json({ errors: errors.array() });
			}

			// make sure we're logged in
			if(typeof(req.session.user) != "undefined") {
				res.render('login', {});
			}

			var email = req.session.user;
			var date = req.body.date;

			AccountModel.count({email}, function(err, count) {
			
					var newAppointment = new AppointmentModel({email, date});
					newAppointment.save();
					res.send("appointment made!");
				}
			)
		}
	)
;

module.exports = router;