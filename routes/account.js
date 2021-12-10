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
			var user = req.session.user.email;
			console.log(`${user} visited /`);
			// res.status(200).send("Reached /!");
			res.render('account', {});
		} else {
			res.redirect('/account/login');
		}
	}
);

router.route('/login').
	get(
		function(req, res) {
			// already logged in?
			if(typeof(req.session.user) != "undefined") {
				console.log(`Already logged in as ${req.session.user.email}`);
				res.redirect('/account');
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
				console.log(`Already logged in as ${req.session.user.email}`);
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
							req.session.user = record;

							return res.redirect('/account');
						} else {
							return res.send("Incorrect password");
						}
					});
				} else {
					return res.send(`Account not found: ${email} and ${password}`);
				}
			});
		}
	)
;

router.route('/logout').all(function(req, res) {
	req.session.destroy();
	return res.redirect('login');
});

router.route('/createaccount').
	get(
		function(req, res) {
			// already logged in?
			if(typeof(req.session.user) != "undefined") {
				console.log(`Already logged in as ${req.session.user.email}`);
				return res.send("Logout first");
			}
			return res.render("createaccount", {});
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
				console.log(`Already logged in as ${req.session.user.email}`);
				return res.send("Logout first");
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
					console.log(`account created: ${email}`);
					res.redirect('/login');
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
				console.log(`Already logged in as ${req.session.user.email}`);
				return res.render('scheduleappointment', {});
			} 
			// return res.sendFile(path.join(__dirname, '../views/login.html'));
			return res.redirect('/account/login');
		}
	).
	post(
		[
			check('datetime').exists().isISO8601(),
			check('service', 'Invalid service ID').exists()
		],
		function(req, res) {
			const errors = validationResult(req);
			if(!errors.isEmpty()) {
				return res.status(422).json({ errors: errors.array() });
			}

			// make sure we're logged in
			if(typeof(req.session.user) == "undefined") {
				return res.redirect('/account/login');
			}

			// Get session
			var email = req.session.user.email;

			// Get body info
			var service = new mongoose.Types.ObjectId(req.body.service);
			var datetime = req.body.datetime;

			AccountModel.count({email},
				function(err, count) {
					console.log(`count: ${count}`);
					if(count == 1) {
						var newAppointment = new AppointmentModel({email, service, datetime});
						newAppointment.save(function(err, result) {
							if(err) {
								console.log(err);
								return res.send("ERROR");
							} else {
								console.log(`appointment made for user ${email}`);
								return res.redirect('/account');
							}
						});
					}
				}
			)
		}
	)
;

module.exports = router;