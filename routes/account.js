console.log("account.js");

var express = require('express');
var router = express.Router();

const path = require('path');

var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;

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
			var isAdmin = req.session.user.admin;
			var HTML = "";

			if(isAdmin) {
				HTML = `
					<a href="/appointment/viewall">View appointments</a>
					<a href="/service/">Manage services</a>
					<a href="/service/create">Create service</a>
				`;
			} else {
				HTML = `
					<a href="/appointment/viewall">My appointments</a>
					<a href="/appointment/schedule">Schedule appointment</a>
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
			check('email', 'Invalid e-mail address').isEmail(),
			check('password', 'Password was empty').notEmpty(),
		],
		function(req, res) {
			const errors = validationResult(req);
			if(!errors.isEmpty()) {
				return res.status(422).json({ msg: 'Invalid input' });
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

							return res.status(200).json({ msg: 'Logged in!'});
						} else {
							return res.status(400).json({ msg: 'Account does not exist or password is incorrect'});
						}
					});
				} else {
					return res.status(400).json({ msg: 'Account does not exist or password is incorrect'});
				}
			});
		}
	)
;

router.route('/logout').all(auth.isLoggedIn, function(req, res) {
	req.session.destroy();
	return res.redirect('login');
});

router.route('/create').
	get(
		[
			auth.isNotLoggedIn
		],
		function(req, res) {
			return res.render("account-create", {});
		}
	).
	post(
		[
			auth.isNotLoggedIn,
			check('email').isEmail(),
			check(['password', 'name', 'phone', 'age']).notEmpty(),
		], function(req, res) {
			const errors = validationResult(req);
			if(!errors.isEmpty()) {
				return res.status(422).json({ msg: 'Invalid input' });
			}

			var query = {
				'email': req.body.email,
				'password': req.body.password,
				'name': req.body.name,
				'phone': req.body.phone,
				'age': req.body.age,
			}

			var newAccount = new AccountModel(query);
			newAccount.save(function(err, result) {
				if(err) {
					if(err.code === 11000) {
						res.status(400).json({ msg: 'Account already exists!'});
					} else {
						res.status(400).json({ msg: 'Bad request'});
					}
				} else {
					console.log(`account created: ${result.email}`);
					res.status(200).json({ msg: 'Account created!'});
				}
			});
		}
	)
// TODO: complete
router.route('/deleteaccount').
	post(
		[
			check('email', 'Invalid e-mail address').isEmail(),
			check('password', 'Password was empty').notEmpty(),
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