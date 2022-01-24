console.log('appointment.js');

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

			AccountModel.count({email},
				function(err, count) {
					console.log(`count: ${count}`);
					if(count == 1) {
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
				}
			)
		}
	)
;

router.route('/viewall').
		get(
			[
				auth.isLoggedIn
			],
			function(req, res) {
				var admin = req.session.user.admin;
				var HTML = `<< partials/appointment-viewall >>`;
				
				if(admin) HTML = `<< partials/admin/appointment-viewall >>`;

				res.render('appointment-viewall', { partial: HTML });
			}
		)

router.route('/getall/').
		get(
			[
				auth.isLoggedIn,
			],
			function(req, res) {
				// console.log(req.session.user);
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
					case 'a':
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
				thirtyDays = new Date( today.valueOf() - ( 30 * oneDay ) ),
				fifteenDays = new Date( today.valueOf() - ( 15 * oneDay ) ),
				sevenDays = new Date( today.valueOf() + ( 7 * oneDay ) );

				// Need more work here
				// query.datetime = {
				// 	"$gte": today,
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

// Note: Probably not an unsafe route so commenting for now
// router.route('/modify')
// 	.post(
// 		[
// 			auth.isAdmin,
// 			check('f', 'Invalid input').notEmpty(),
// 			check('v', 'Invalid input').notEmpty(),
// 			check('i', 'Invalid input').notEmpty()
// 		], 
// 		function(req, res) {
// 			const errors = validationResult(req);
// 			if(!errors.isEmpty()) {
// 				return res.status(422).json({ errors: errors.array() });
// 			}

// 			var appointmentID = req.body.i;
// 			var id = new mongoose.Types.ObjectId(appointmentID);
// 			var query = { _id: id };

// 			const field = req.body.f;
// 			const value = req.body.v;
			
// 			console.log(`App: ${appointmentID}, changing ${field} to ${value}`);
// 			AppointmentModel.findByIdAndUpdate(id,
// 				{
// 					$set: {
// 						[field]: value
// 					}
// 				},
// 				function(err, result) {
// 					if(err) return res.send(err);
// 					else return res.send(result);
// 				}
// 			);
			
// 		}
// 	);

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
			var query = { _id: id };
			
			AppointmentModel.findByIdAndUpdate(id,
				{
					$set: {
						'approved': true
					}
				},
				function(err, result) {
					if(err) return res.status(400).json({ msg: 'Failed to confirm appointment' })
					else return res.status(200).json({ msg: 'Confirmed appointment!', data: result })
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
			var query = { _id: id };

			console.log(query);
			
			AppointmentModel.findByIdAndUpdate(id,
				{
					$set: {
						'approved': false
					}
				},
				function(err, result) {
					if(err) return res.status(400).json({ msg: 'Failed to unconfirm appointment' })
					else return res.status(200).json({ msg: 'Unconfirmed appointment!', data: result })
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
			return res.status(422).json({ errors: errors.array() });
		}

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

		// Was this appointment approved?
		AppointmentModel.findOne(query, function(err, result) {
			if(err) return res.status(400).json({ msg: 'Failed to check appointment.' })
			else {
				console.log(`Appointment status: ${result.approved}`);
				if(result.approved) {
					// send SMS notification
				}
			}
		});

		AppointmentModel.deleteOne(query, function(err, result) {
			if(err) return res.status(400).json({ msg: 'Failed to cancel appointment.'})
			else return res.status(200).json({ msg: 'Cancelled appointment!', data: result })
		});
	})

module.exports = router;