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

router.route('/').
	get(
		[
			auth.isAdmin
		],
		function(req, res) {
			res.render('admin/service-manage', {});
		}
	);

router.route('/create').
	get(
		[
			auth.isAdmin
		],
		function(req, res) {
			res.render('service-create', {});
		}
	).
	post(
		[
			auth.isAdmin,
			check('service', 'Invalid service name specified').exists().isString(),
			check('duration', 'Invalid duration specified').exists().isString(),
			check('price', 'Invalid price specified').exists().isString(),
			check('description', 'Invalid service description specified').exists().isString(),
		], function(req, res) {
			const errors = validationResult(req);
			if(!errors.isEmpty()) {
				return res.status(422).json({ errors: errors.array() });
			}

			var name = req.body.service;
			var duration = req.body.duration;
			var price = req.body.price;
			var description = req.body.description;

			var new_service = new ServiceModel({name, duration, price, description});
			new_service.save(function(err, result) {
				if(err) {
					console.log(err);
					return res.status(422).json({error: 'duplicate service'});
				} else {
					console.log(`service created: ${name}`);
					return res.status(202).json(`service created: ${name}`);
				}
			});
		}
	)
;

router.route('/delete').
	post(
		[
			auth.isAdmin,
			check('id', 'Invalid service ID').exists(),
			check('name', 'Invalid service name').exists()
		],
		function(req, res) {
			const errors = validationResult(req);
			if(!errors.isEmpty()) {
				return res.status(422).json({ errors: errors.array() });
			}

			const id = new mongoose.Types.ObjectId(req.body.id);
			const name = req.body.name;
			const query = {
				_id: id,
				// not ideal
				name: name
			}

			ServiceModel.deleteOne(query, function(err, result) {
				if(err) res.send(err);
				else res.send(result);
			});
		}
	)

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
			// console.log(req.params);

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

router.route('/edit').
	post(
		[
			auth.isAdmin,
			check('id', 'Invalid input').exists(),
			check('name', 'Invalid service name').exists(),
			check('duration', 'Invalid duration').exists(),
			check('price', 'Invalid price').exists(),
			check('description', 'Invalid service description').exists(),
		],
		function(req, res) {
			const errors = validationResult(req);
			if(!errors.isEmpty()) {
				return res.status(422).json({ errors: errors.array() });
			}

			const id = new mongoose.Types.ObjectId(req.body.id);
			const name = req.body.name;
			const duration = req.body.duration;
			const price = req.body.price;
			const description = req.body.description;
			console.log(id);

			const query = {
				name: name,
				duration: duration,
				price: price,
				description: description,
			}

			ServiceModel.findByIdAndUpdate(id, query, {new:true}, function (err, result) {
				if(err) return res.send(err);
				else return res.send(result);
				// else return res.redirect(req.get('referer'));
			})
		}
	)

module.exports = router;