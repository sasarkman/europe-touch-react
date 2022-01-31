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
			check(['name', 'duration', 'price', 'description']).notEmpty().isString(),
		], function(req, res) {
			const errors = validationResult(req);
			if(!errors.isEmpty()) {
				return res.status(422).json({ msg: 'Invalid input' });
			}

			var name = req.body.name;
			var duration = req.body.duration;
			var price = req.body.price;
			var description = req.body.description;

			var params = {name, duration, price, description};
			console.log(params);

			var new_service = new ServiceModel(params);
			new_service.save(function(err, result) {
				if(err) {
					if(err.code === 11000) {
						res.status(400).json({ msg: 'This service already exists.'});
					} else {
						res.status(400).json({ msg: 'Bad request'});
					}
				} else {
					console.log(`service created: ${name}`);
					return res.status(200).json({ msg: `Service created!` });
				}
			});
		}
	)
;

router.route('/delete').
	post(
		[
			auth.isAdmin,
			check('id').custom(value => {
				return ObjectId.isValid(value);
			}),
			check('name').notEmpty(),
		],
		function(req, res) {
			const errors = validationResult(req);
			if(!errors.isEmpty()) {
				return res.status(422).json({ msg: 'Invalid input' });
			}

			const id = new mongoose.Types.ObjectId(req.body.id);
			const name = req.body.name;
			const query = {
				_id: id,
			}

			ServiceModel.findByIdAndRemove(query, function(err, result) {
				if(err || !result) return res.status(400).json({ msg: `Failed to delete service.`});
				else return res.status(200).json({ msg: `Service deleted: ${name}`});
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
			// ServiceModel.find({}, '_id name', function(err, result) {
			// 	if(err || !result) return res.status(400).json({ msg: `Failed to retrieve services.`});
			// 	else return res.status(200).json({ msg: 'Successfully retrieved services', data: result});
			// });

			ServiceModel.find({}, '_id name').sort({'name': 1}).exec(function(err, result) {
				if(err || !result) return res.status(400).json({ msg: `Failed to retrieve services.`});
				else return res.status(200).json({ msg: 'Successfully retrieved services', data: result});
			});
		}
	)

router.route('/getservice/:id').
	get(
		[
			auth.isLoggedIn,
			check('id').custom(value => {
				return ObjectId.isValid(value);
			}),
		],
		function(req, res) {
			const errors = validationResult(req);
			if(!errors.isEmpty()) {
				return res.status(422).json({ msg: 'Invalid input' });
			}

			const id = req.params.id;

			ServiceModel.find({_id: id}, {'_id': false}, function(err, result) {
				if(err) res.status(400).json({ msg: 'Failed to get service.'})
				if(result) {
					return res.status(200).json({ msg: 'Successfully retrieved service!', data: result });
				}
			});

		}
	)

router.route('/edit').
	post(
		[
			auth.isAdmin,
			check('id').custom(value => {
				return ObjectId.isValid(value);
			}),
			check(['name', 'duration', 'price', 'description']).notEmpty(),
		],
		function(req, res) {
			const errors = validationResult(req);
			if(!errors.isEmpty()) {
				return res.status(422).json({ msg: 'Invalid input' });
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
				if(err || !result) return res.status(400).json({ msg: 'Failed to save changes.'});
				else return res.status(200).json({ msg: 'Changes saved!'});
			})
		}
	)

module.exports = router;