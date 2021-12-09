console.log("service.js");

var express = require('express');
var router = express.Router();

const path = require('path');

var mongoose = require('mongoose');

// Load user input validator
const { check, validationResult } = require('express-validator');

// Load Models
var AccountModel = require('../models/account-model');
var ServiceModel = require('../models/service-model');


router.route('/createservice').
	get(
		function(req, res) {
			res.sendFile(path.join(__dirname, './createservice.html'));
		}
	).
	post(
		[
			check('service', 'Invalid service specified').exists().isString(),
			check('duration', 'Invalid duration specified').exists().isString(),
			check('price', 'Invalid price specified').exists().isString(),
			check('email', 'Invalid e-mail address').exists().isEmail(),
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

			var service = req.body.service;
			var duration = req.body.duration;
			var price = req.body.price;
			var description = req.body.description;
			var email = req.body.email;
			// var password = req.body.password;

			// Query database for how many accounts with this email exist
			AccountModel.findOne({email: email}, function(err, result) {
				// console.log(result);
				if(result) {
					if(result.email == email) {
						var new_service = new ServiceModel({service, duration, price, description});
						new_service.save(function(err, result) {
							if(err) {
								console.log('duplicate service');
								return res.status(422).json({error: 'duplicate service'});
							} else {
								console.log(`service created: ${service}`);
								return res.status(202).json(`service created: ${service}`);
							}
						});
					} else {
						return res.status(422).json({error: 'invalid user'});
					}
				}
			});
		}
	)
;

module.exports = router;