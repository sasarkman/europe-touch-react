console.log('appointment.js');

// Module for credentials loading
require('dotenv').config();

var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;

// Load user input validator
const { check, validationResult } = require('express-validator');

// Load authentication middleware
const auth = require('../auth');

// Load Models
var AccountModel = require('../models/account-model');
var AppointmentModel = require('../models/appointment-model');

// Emailer
const nodemailer = require('nodemailer');
const emailer = nodemailer.createTransport({
	service: process.env.EMAIL_SERVICE,
	auth: {
		user: process.env.EMAIL_ADDR,
		pass: process.env.EMAIL_PASS
	}
});

// SMS
const texter = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

router.route('/schedule').
	get([
			auth.isLoggedIn
		],
		function(req, res) {
			return res.render('appointment-schedule', {});
		}
	).
	post(
		[
			auth.isLoggedIn,
			check('datetime').notEmpty().isISO8601(),
			check('service').notEmpty()
		],
		function(req, res) {
			const errors = validationResult(req);
			if(!errors.isEmpty()) {
				return res.status(422).json({ msg: 'Invalid input' });
			}

			// Get session info
			var id = new mongoose.Types.ObjectId(req.session.user._id);
			var email = req.session.user.email;

			// Get body info
			var service = new mongoose.Types.ObjectId(req.body.service);
			var datetime = req.body.datetime;

			var newAppointment = new AppointmentModel({account:id, service, datetime});
			newAppointment.save(function(err, result) {
				if(err) {
					console.log(err);
					// return res.send("ERROR");
					return res.status(400).json({ msg: 'Failed to schedule appointment' })
				} else {
					console.log(`appointment made for email ${email}, id: ${id}`);
					// return res.redirect('/account');
					return res.status(200).json({ msg: 'Appointment scheduled!' })
				}
			});
		}
	)
;

router.route('/viewAll').
		get(
			[
				auth.isLoggedIn
			],
			function(req, res) {
				var admin = req.session.user.admin;
				var HTML = `<< partials/appointment-viewAll >>`;
				
				if(admin) HTML = `<< partials/admin/appointment-viewAll >>`;

				res.render('appointment-viewAll', { partial: HTML });
			}
		)

router.route('/getall/').
		get(
			[
				auth.isLoggedIn,
			],
			function(req, res) {
				const id = new mongoose.Types.ObjectId(req.session.user._id);

				// Final query output structure
				var project = {
					// Appointment data
						// Note: this gets consumed by fullcalendar in JSON object, not sure why
						'id': '$_id',
						'start': '$datetime',
						'approved': '$approved',
						'created': '$createdTimestamp',
					// Account data
						'account.email': 1,
						'account.name': 1,
						'account.phone': 1,
						'account.age': 1,
					// Service Data
						'service.name': 1,
						'service.duration': 1,
						'service.price': 1,
						'service.description': 1
				}

				var admin = req.session.user.admin;

				// Appointment type may come into request inside a query payload
				var type =  req.query.t;

				// Construct a different query based on user type
				if(admin) {
					// Return ALL appointments
					var query = {};

					// The 'title' field is used by fullcalendar and we want a different 
					// event title to display based on what kind of user this is, in this case title = '<name>: <service name>'
					project.title = {
						"$concat": ["$account.name", ": ", "$service.name"]
					}
				} else {
					// Just return appointments for this user
					var query = {account: id};

					project.title = {
						"$concat": ["$service.name", ": ", "$service.description"]
					}
				}

				// Define the type of appointment to retrieve
				switch(type) {
					// Query approved appointments
					case 'c':
						query.approved = true;
						break;
					// Query unapproved appointments
					case 'u':
						query.approved = false;
						break;
					default:
						break;
				}


				var today = new Date(),
				oneDay = ( 1000 * 60 * 60 * 24 ),
				oneDayBehind = new Date( today.valueOf() - ( oneDay ) ),
				thirtyDays = new Date( today.valueOf() - ( 30 * oneDay ) ),
				fifteenDays = new Date( today.valueOf() - ( 15 * oneDay ) ),
				sevenDays = new Date( today.valueOf() + ( 7 * oneDay ) );

				// TODO: Need more work here
				// query.datetime = {
				// 	"$gte": oneDayBehind,
				// }

				AppointmentModel.aggregate([
					{
						$match: query
					},
					// Join query with Accounts using foreign key 'account'
					{
						$lookup: {
							from: 'accounts',
							localField: 'account',
							foreignField: '_id',
							as: 'account'
						}
					},
					// Convert array to object
					{
						$unwind: '$account'
					},
					// Join query with Services using foreign key 'service'
					{
						$lookup: {
							from: 'services',
							localField: 'service',
							foreignField: '_id',
							as: 'service'
						}
					},
					// Convert array to object
					{
						$unwind: '$service'
					},
					// Define final output
					{
						$project: project
					}],
					function(err, result) {
						if(err) res.status(400).json(err)
						else return res.status(200).json(result);
					}
				);
			}
		)

router.route('/confirm')
	.post(
		[
			auth.isAdmin,
			check('id').custom(value => {
				return ObjectId.isValid(value);
			}),
		],
		function(req, res) {
			const errors = validationResult(req);
			if(!errors.isEmpty()) {
				return res.status(422).json({ errors: errors.array() });
			}

			var id = new mongoose.Types.ObjectId(req.body.id);

			AppointmentModel.findOne(
				{
					_id: id,
					'approved': false
				},
				function(err, appointment) {
					if(err || !appointment) {
						return res.status(400).json({ msg: 'Failed to confirm appointment' })
					} else {
						const account = appointment.account;

						appointment.approved = true;
						appointment.save(function(err, result) {
							if(err) {
								return res.status(400).json({ msg: 'Failed to confirm appointment' })
							} else {
								// Perform notification operations asynchronously
								AccountModel.findOne({ _id: account }, function(err, account) {
									if(err || !account) console.log(err);
									else {
										const mailOptions = {
											from: process.env.EMAIL_FROM,
											to: account.email,
											subject: 'Appointment confirmation',
											text: `
												Hello ${account.name},
												Your appointment for ${appointment.datetime} has been confirmed!
				
												See you soon,
												Edina
											`
										};
									
										// Send e-mail notification
										emailer.sendMail(mailOptions, function (error, info) {
											if (error) {
												console.log(error);
											} else {
												console.log('Email sent: ' + info.response);
											}
										});

										// Send SMS text
										texter.messages
										.create({
											to: account.phone,
											from: process.env.TWILIO_NUMBER,
											body: `Hi ${account.name}, your appointment at ${result.datetime} has been confirmed! - Europe Touch Massage`,
										})
										.then(message => console.log(message.sid));
									}
								})
								return res.status(200).json({ msg: 'Confirmed appointment!'})
							}
						})
					}
				}
			);
		}
	);

router.route('/unconfirm')
	.post(
		[
			auth.isAdmin,
			check('id').custom(value => {
				return ObjectId.isValid(value);
			}),
		],
		function(req, res) {
			const errors = validationResult(req);
			if(!errors.isEmpty()) {
				return res.status(422).json({ errors: errors.array() });
			}

			var id = new mongoose.Types.ObjectId(req.body.id);
			AppointmentModel.updateOne(
				{
					_id: id,
					'approved': true
				},
				{
					'approved': false
				},
				function(err, result) {
					if(err || !result || result.modifiedCount != 1) {
						return res.status(400).json({ msg: 'Failed to unconfirm appointment' })
					}
					else {
						return res.status(200).json({ msg: 'Unconfirmed appointment!'})
					}
				}
			);
			
		}
	);

router.route('/cancel')
	.post([
		auth.isLoggedIn,
		check('id').custom(value => {
			return ObjectId.isValid(value);
		}),
	], function(req, res) {
		const errors = validationResult(req);
		if(!errors.isEmpty()) {
			return res.status(422).json({ msg: errors.array() });
		}

		// note: check that 'id' is this user's id?

		var admin = req.session.user.admin;
		var appointmentID = new mongoose.Types.ObjectId(req.body.id);

		var query = {
			_id: appointmentID
		};

		if(admin) {
			console.log(`Admin is deleting appointment ${appointmentID}`);
		} else {
			console.log(`User is deleting appointment ${appointmentID}`);
			var userID = new mongoose.Types.ObjectId(req.session.user._id);
			query.account = userID;
		}

		AppointmentModel.findOneAndDelete(query, function(err, result) {
			if(err || !result) return res.status(400).json({ msg: 'Failed to cancel appointment.' })
			else {
				// If cancelled appointment was approved, need to notify admin
				if(result.approved) {
					const accountID = result.account;

					// Query database for account with this email
					AccountModel.findOne({'_id': accountID}, function(err, account) {
						if(err || !account) res.send(err);
						else {
							// Send email notification
							const mailOptions = {
								from: process.env.EMAIL_FROM,
								to: process.env.EMAIL_ADDR,
								subject: `Appointment cancelled: ${account.name}`,
								text: `
									${account.name} (${account.email}) has cancelled their appointment for ${result.datetime}
								`
							};
						
							emailer.sendMail(mailOptions, function (error, info) {
								if (error) {
									console.log(error);
								} else {
									console.log('Email sent: ' + info.response);
								}
							});

							// Send SMS text
							texter.messages
								.create({
									to: '+12085854971',
									from: process.env.TWILIO_NUMBER,
									body: `${account.name} has cancelled their appointment at ${result.datetime}. Their phone number is ${account.phone}. - Europe Touch Massage`
								})
								.then(message => console.log(message.sid));
						}
					});
				}
				return res.status(200).json({ msg: 'Cancelled appointment!', data: result })
			}
		});
	})

module.exports = router;