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
			return res.render('scheduleappointment', {});
		}
	).
	post(
		[
			auth.isLoggedIn,
			check('datetime').exists().isISO8601(),
			check('service', 'Invalid service ID').exists()
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

				if(req.session.user.admin) {
					var query = {};
				} else {
					var query = {account: id};
				}

				// console.log(`query = ${query}`);
				AppointmentModel.find(query, {_id:false}, function(err, result) {
					if(err) res.send(err);
					else if(result) {
						// res.status(200).json(result);
						res.render('appointment-viewall', {});
					}
				});
			}
		)

router.route('/getall').
		get(
			[
				auth.isLoggedIn
			],
			function(req, res) {
				// console.log(req.session.user);
				const id = new mongoose.Types.ObjectId(req.session.user._id);
				// const id = req.session.user._id;

				if(req.session.user.admin) {
					var query = {};
				} else {
					var query = {account: id};
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
							as: 'user'
						}
					},
					// Convert array to object
					{
						$unwind: '$user'
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
						$project: {
							'_id': 0,
							'user.email': 1,
							'service.name': 1,
							'start': '$datetime',
							'approved': '$approved',
							'created': '$createdTimestamp'
						}
					},],
					function(err, result) {
						if(err) res.send(err);
						else if(result) {
							res.status(200).json(result);
						}
					}
				);
			}
		)

module.exports = router;