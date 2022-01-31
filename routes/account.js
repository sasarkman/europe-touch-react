console.log("account.js");

// Module for credentials loading
require('dotenv').config();

var express = require('express');
var router = express.Router();

const fetch = require('node-fetch');

const path = require('path');

var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;

// Load user input validator
const { check, param, validationResult } = require('express-validator');

// Load authentication middleware
const auth = require('../auth');
const tokenGen = require('crypto');

// Load Models
var AccountModel = require('../models/account-model');
var AppointmentModel = require('../models/appointment-model');
var TokenModel = require('../models/token-model');

// Emailer
const nodemailer = require('nodemailer');
const emailer = nodemailer.createTransport({
	service: process.env.EMAIL_SERVICE,
	auth: {
		user: process.env.EMAIL_ADDR,
		pass: process.env.EMAIL_PASS
	}
});

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
					<a href="/appointment/viewAll">View appointments</a>
					<a href="/service/">Manage services</a>
					<a href="/service/create">Create service</a>
				`;
			} else {
				HTML = `
					<a href="/appointment/viewAll">My appointments</a>
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
				return res.status(422).json({ msg: 'Account does not exist or password is incorrect' });
			}

			var email = req.body.email;
			var password = req.body.password;
			
			// Query database for account with this email
			AccountModel.findOne({email}, function(err, record) {
				if(err || !record) return res.status(400).json({ msg: 'Account does not exist or password is incorrect'});
				else {
					record.comparePassword(password, function(err, isMatch) {
						if(err) res.status(400).json({ msg: 'Server error'});
						if(isMatch) {
							// Is account confirmed?
							if(!record.confirmed) {
								return res.status(400).json({ msg: 'Please confirm your account by following the e-mail sent to your inbox'});
							}

							//cookie
							req.session.user = record;

							return res.status(200).json({ msg: 'Logged in!'});
						} else {
							return res.status(400).json({ msg: 'Account does not exist or password is incorrect'});
						}
					});
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
						console.log(err);
						res.status(400).json({ msg: 'Bad request.'});
					}
				} else {
					const mailOptions = {
						from: process.env.EMAIL_FROM,
						to: result.email,
						subject: 'Account confirmation',
						text: `
							Hello ${result.name},
							Please follow this link to activate your account: http://localhost:3000/account/confirm/${result._id}
						`
					};
				
					emailer.sendMail(mailOptions, function (error, info) {
						if (error) {
							console.log(error);
						} else {
							console.log(`Email sent to ${result.email}: ${info.response}`);
						}
					});

					res.status(200).json({ msg: `Account created! Please confirm your account by following the link sent to: ${req.body.email}.`});
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

router.route('/confirm/:token?').
	get(
		[
			auth.isNotLoggedIn,
			param('token').custom(value => {
				return ObjectId.isValid(value);
			})
		],
		function(req, res) {
			const errors = validationResult(req);
			if(!errors.isEmpty()) {
				return res.status(422).json({ msg: errors.array() });
			}

			const url = req.headers.host;
			const token = req.params.token;
			var html = '<div class="alert alert-class" role="alert" id="alert">html</div>';

			console.log(url);

			var responseCode = '';
			fetch(`http://${url}/account/confirm/${token}`, { method: 'POST'}).then(response => {
				responseCode = response.status;
				return response;
			}).then(response => response.json()
			).then(response => {
				switch(responseCode) {
					case 200:
						html = html.replace('alert-class', 'alert-success');
						html = html.replace('html', `${response.msg} Please <a href="/account/login" class="alert-link">login</a>.`);
					case 400:
						html = html.replace('alert-class', 'alert-danger');
						html = html.replace('html', response.msg);
					default:
				}

				return res.render('account-confirm', { html });
			}) // catch should be unreachable anyways
		}
	).
	post(
		[
			auth.isNotLoggedIn,
			param('token').custom(value => {
				return ObjectId.isValid(value);
			})
		],
		function(req, res) {
			const errors = validationResult(req);
			if(!errors.isEmpty()) {
				return res.status(422).json({ msg: errors.array() });
			}

			var id = mongoose.Types.ObjectId(req.params.token);

			AccountModel.findOne({_id: id}, function(err, result) {
				if(err) return res.status(400).json({ msg: 'Error confirming account.'})
				else if(result) {
					console.log('1');

					// Is account confirmed?
					if(result.confirmed) {
						console.log('2');
						return res.status(400).json({ msg: 'Error confirming account.'});
					} else {
						result.confirmed = true;
						
						// Set it to confirmed
						result.save(function(err, result) {
							if(err) {
								console.log('3');
								console.log(err);
								return res.status(400).json({ msg: 'Error confirming account.'});
							}
							else {
								console.log('4');
								return res.status(200).json({ msg: 'Successfully confirmed account!'});
							}
						});
					}
				} else {
					return res.status(400).json({ msg: 'Error confirming account.'});
				}
			})
		}
	)
;

router.route('/forgotPassword').
	get(
		[
			auth.isNotLoggedIn,
		],
		function(req, res) {
			return res.render('account-forgotPassword', {});
		}
	).
	post(
		[
			auth.isNotLoggedIn,
			check('email').isEmail()
		],
		function(req, res) {
			const errors = validationResult(req);
			if(!errors.isEmpty()) {
				return res.status(422).json({ msg: 'Invalid input' });
			}

			const email = req.body.email;
			const token = tokenGen.randomBytes(16).toString('hex');

			const query = {
				'token': token,
				'email': email
			}

			AccountModel.findOne({ email: email }, function(err, account) {
				if(err) return res.status(400).json({ msg: 'Server error' });
				else if(!account) {
					// Even if the account doesn't exist, we still want to indicate success
					return res.status(200).json({ msg: `Password reset link has been sent to: ${email}.` });
				}
				else {
					new TokenModel(query).save(function(err, result) {
						if(err) {
							console.log(err);
							res.status(400).json({ msg: 'Server error.' });
						}
						else {
							const deleteQuery = {
								'email': email, 
								'token': { $nin: token }
							}
		
							// Delete all previous tokens
							TokenModel.deleteMany(deleteQuery, function(err, result) {
								if(err) return res.status(400).json({ msg: 'Server error.' });
								else {
									console.log(`Deleted ${result.deletedCount} tokens`);
		
									return res.status(200).json({ msg: `Password reset link has been sent to: ${email}. <b>You may need to check your spam folder.<b>`});
								}
							})
		
							// Send e-mail
							const mailOptions = {
								from: process.env.EMAIL_FROM,
								to: email,
								subject: 'Password reset request',
								text: `
									Hello,
									Please follow this link to reset your password: http://${process.env.PUB_IP}:3000/account/resetPassword/${token}
								`
							};
						
							emailer.sendMail(mailOptions, function (error, info) {
								if (error) {
									console.log(error);
								} else {
									console.log('Email sent: ' + info.response + ' to ' + email);
								}
							});
						}
					})
				}
			});
			
		}
	)
;

router.route('/resetPassword/:token').
	get(
		[
			auth.isNotLoggedIn,
			param('token').notEmpty().isHexadecimal()
		],
		function(req, res) {
			const errorHTML = '<div class="alert alert-danger" role="alert">Invalid or expired password reset link.</div>'
			const successHTML = `
				<script type="text/javascript" src="/controllers/account-resetPassword.js"></script>
				<div class="alert d-none" role="alert" id="alert"></div>
				<form id='main-form'>
					<div class='form-group mb-1'>
						<label for="password">New password:</label>
						<input type="password" class='form-control' id="password" name="password">
					</div>

					<div class='form-group mb-1'>
						<label for="password2">Confirm password:</label>
						<input type="password" class='form-control' id="password2" name="password2">
					</div>

					<button type="button" class="btn btn-primary" id="confirm_button">Confirm</button>
				</form>
			`;

			const errors = validationResult(req);
			if(!errors.isEmpty()) {
				return res.render('account-resetPassword', { html: errorHTML });
			}

			const token = req.params.token;
			const query = {
				'token': token
			};

			console.log(query);

			TokenModel.findOne(query, function(err, result) {
				if(err) return res.render('account-resetPassword', { html: errorHTML });
				else if(result) {
					console.log(result);
					return res.render('account-resetPassword', { html: successHTML });
				} else {
					console.log('not found');
					return res.render('account-resetPassword', { html: errorHTML });
				}
			})
		}
	).
	post(
		[
			auth.isNotLoggedIn,
			param('token').notEmpty().isHexadecimal(),
			check('password').notEmpty()
		],
		function(req, res) {
			const errors = validationResult(req);
			if(!errors.isEmpty()) {
				return res.status(422).json({ msg: 'Invalid input' });
			}

			const password = req.body.password;
			const token = req.params.token;

			console.log(token);

			TokenModel.findOne({'token':token}, function(err, result) {
				if(err) {
					console.log(err);
					return res.status(400).json({ msg: 'Errorrr.' });
				}
				else if(result) {
					console.log(result);
					const email = result.email;

					var account = AccountModel.findOne({email}, function(err, result) {
						result.password = password;
						result.save(function(err, result) {
							if(err) {
								console.log(err);
								res.status(400).json({ msg: 'Bad request.'});
							} else {
								// Delete this token
								TokenModel.deleteOne({token}, function(err, result) {
									if(err) return res.status(400).json({ msg: 'Server error.' });
									else {
										console.log(`Deleted ${result.deletedCount} tokens`);
										return res.status(200).json({ msg: `Password reset!`});
									}
								})

							}
						});
					})
				} else {
					return res.status(400).json({ msg: 'Error.' });
				}
			})
		}
	)
;

module.exports = router;