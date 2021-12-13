console.log("service.js");

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
var ServiceModel = require('../models/service-model');


router.route('/createservice').
	get(
		[
			auth.isAdmin
		],
		function(req, res) {
			res.sendFile(path.join(__dirname, './createservice.html'));
		}
	).
	post(
		[
			auth.isAdmin,
			check('name', 'Invalid service name specified').exists().isString(),
			check('duration', 'Invalid duration specified').exists().isString(),
			check('price', 'Invalid price specified').exists().isString(),
			check('email', 'Invalid e-mail address').exists().isEmail(),
		], function(req, res) {
			const errors = validationResult(req);
			if(!errors.isEmpty()) {
				return res.status(422).json({ errors: errors.array() });
			}

			var name = req.body.name;
			var duration = req.body.duration;
			var price = req.body.price;
			var description = req.body.description;

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
		}
	)
;

router.route('/getservices').
	get(
		[
			auth.isLoggedIn
		],
		function(req, res) {
			// Look up all records and return the records' "name" and "_id" fields
			ServiceModel.find({}, '_id name', function(err, result) {
				if(result) {
					return res.status(200).json(result);
				}
			});
		}
	)

router.route('/getservice/:id').
	get(
		[
			auth.isLoggedIn
		],
		function(req, res) {
			console.log(req.params);

			const id = req.params.id;

			if(ObjectId.isValid(id)) {
				// Look up all records and return the records' "name" and "_id" fields
				ServiceModel.find({_id: id}, {'_id': false}, function(err, result) {
					if(err) console.log(err);
					if(result) {
						return res.status(200).json(result);
					}
				});
			} else {
				return res.status(404).send("Bad input");
			}
		}
	)

module.exports = router;