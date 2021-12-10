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
			check('name', 'Invalid service name specified').exists().isString(),
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
				console.log(`Already logged in as ${req.session.user.email}`);
				res.send("Logout first");
			}

			var name = req.body.name;
			var duration = req.body.duration;
			var price = req.body.price;
			var description = req.body.description;
			var email = req.body.email;
			// var password = req.body.password;

			// Make sure the user creating this appointment exists and is logged in
			AccountModel.findOne({email: email}, function(err, result) {
				if(result) {
					if(result.email == email) {
						var new_service = new ServiceModel({name, duration, price, description});
						new_service.save(function(err, result) {
							if(err) {
								console.log('duplicate service');
								return res.status(422).json({error: 'duplicate service'});
							} else {
								console.log(`service created: ${name}`);
								return res.status(202).json(`service created: ${name}`);
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

router.route('/getservices').
	get(
		function(req, res) {
			ServiceModel.find({}, function(err, result) {
				if(result) {
					return res.status(200).json(result);
				}
			});
		}
	)

module.exports = router;