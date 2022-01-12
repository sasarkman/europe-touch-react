console.log('appointment.js');

var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');

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
			check('service', 'Invalid service ID').notEmpty()
		],
		function(req, res) {
			const errors = validationResult(req);
			if(!errors.isEmpty()) {
				return res.status(422).json({ errors: errors.array() });
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
								return res.send("ERROR");
							} else {
								console.log(`appointment made for email ${email}, id: ${id}`);
								return res.redirect('/account');
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
				// console.log(req.session.user);
				const id = new mongoose.Types.ObjectId(req.session.user._id);
				// const id = req.session.user._id;

				var admin = req.session.user.admin;

				if(admin) {
					var query = {};
				} else {
					var query = {account: id};
				}

				// console.log(`query = ${query}`);
				AppointmentModel.find(query, {_id:false}, function(err, result) {
					if(err) res.send(err);
					else if(result) {
						var HTML = `<< partials/appointment-viewall >>`;
						
						if(admin) HTML = `<< partials/admin/appointment-viewall >>`;

						res.render('appointment-viewall', { partial: HTML });
					}
				});
			}
		)

router.route('/getall/:type?').
		get(
			[
				auth.isLoggedIn,
				check('type', 'Invalid input').notEmpty()
			],
			function(req, res) {
				// console.log(req.session.user);
				const id = new mongoose.Types.ObjectId(req.session.user._id);
				// const id = req.session.user._id;

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
				var type = req.params.type;

				// Construct a different query based on user type
				if(admin) {
					// Return ALL appointments
					var query = {};

					// The 'title' field is used by fullcalendar and we want a different 
					// event title to display based on what kind of user this is, in this case title = person name
					project.title = '$account.name';
				} else {
					// Just return appointmetns for this user
					var query = {account: id};
				}

				// Define the type of appointment to retrieve
				switch(type) {
					case 'unapproved':
						query.approved = false;
						break;
					case 'approved':
						query.approved = true;
						break;
					default:
						break;
				}

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
						if(err) res.send(err);
						else if(result) {
							res.status(200).json(result);
						}
					}
				);
			}
		)

router.route('/modify/:field/:value')
	.post(
		[
			auth.isAdmin,
			check('field', 'Invalid input').notEmpty(),
			check('appointmentID', 'Invalid appointment').notEmpty()
		], 
		function(req, res) {
			const errors = validationResult(req);
			if(!errors.isEmpty()) {
				return res.status(422).json({ errors: errors.array() });
			}

			var appointmentID = req.body.appointmentID;
			var id = new mongoose.Types.ObjectId(appointmentID);
			var query = { _id: id };

			const field = req.params.field;
			const value = req.params.value;
			
			console.log(`App: ${appointmentID}, changing ${field} to ${value}`);
			AppointmentModel.findByIdAndUpdate(id,
				{
					$set: {
						[field]: value
					}
				},
				function(err, result) {
					if(err) return res.send(err);
					else return res.send(result);
				}
			);
			
		}
	);

router.route('/cancel/:appointmentID')
	.post([
		auth.isLoggedIn,
		check('appointmentID', 'Invalid input').notEmpty()
	], function(req, res) {
		const errors = validationResult(req);
		if(!errors.isEmpty()) {
			return res.status(422).json({ errors: errors.array() });
		}

		var admin = req.session.user.admin;
		var appointmentID = new mongoose.Types.ObjectId(req.params.appointmentID);

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

		AppointmentModel.deleteOne(query, function(err, result) {
			if(err) return res.send(err);
			else return res.send(result);
		});
	})

module.exports = router;