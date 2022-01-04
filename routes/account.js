console.log("account.js");

var express = require('express');
var router = express.Router();

const path = require('path');

var mongoose = require('mongoose');

// Load user input validator
const { check, validationResult } = require('express-validator');

// Load authentication middleware
const auth = require('../auth');

// Load Models
var AccountModel = require('../models/account-model');
var AppointmentModel = require('../models/appointment-model');

router.route('/').
	get(
		[
			auth.isLoggedIn
		],
		function(req, res) {
			var user = req.session.user.email;
			var HTML = "";

			if(req.session.user.admin) {
				HTML = `
					<a href="/appointment/viewall">View appointments</a><br>
					<a href="/service/">Manage services</a><br>
				`;
			} else {
				HTML = `
					<a href="/appointment/viewall">View appointments</a><br>
					<a href="/appointment/schedule">Schedule appointment</a><br>
				`;
			}
			res.render('account', { temp: HTML });
		}
);

router.route('/login').
	get(
		[
			auth.isNotLoggedIn
		],
		function(req, res) {
			res.render('login', {});
		}
	).
	post(
		[
			auth.isNotLoggedIn,
			check('email', 'Invalid e-mail address').exists().isEmail(),
			check('password', 'Password was empty').exists(),
		],
		function(req, res) {
			const errors = validationResult(req);
			if(!errors.isEmpty()) {
				return res.status(422).json({ errors: errors.array() });
			}

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

router.route('/logout').all(auth.isLoggedIn, function(req, res) {
	req.session.destroy();
	return res.redirect('login');
});

router.route('/createaccount').
	get(
		[
			auth.isNotLoggedIn
		],
		function(req, res) {
			return res.render("createaccount", {});
		}
	).
	post(
		[
			auth.isNotLoggedIn,
			check('email', 'Invalid e-mail address').exists().isEmail(),
			check('password', 'Password was empty').exists()
		], function(req, res) {
			const errors = validationResult(req);
			if(!errors.isEmpty()) {
				return res.status(422).json({ errors: errors.array() });
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
					res.redirect('/account/login');
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



module.exports = router;