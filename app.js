// Load HTTP module
const express = require('express');

// Initialize express
const app = express();

// Load logging module
const logger = require('morgan');

// Load object relational model module
const mongoose = require('mongoose');

// Load authorization module
const auth = require('jsonwebtoken');

// Load user input validator
const { check, validationResult } = require('express-validator');

// Load password hashing module
const bcrypt = require('bcrypt');

// Initialize middlewares
app.use(logger('dev'));
app.use(express.urlencoded({extended:true}));

// Define static content delivery
app.use('/index', express.static(__dirname + "/views/index/"));

// Mongodb connection string
const mongo_url = "mongodb://127.0.0.1:27017/local"

// Load Models
var AccountModel = require('./models/account-model');

// Express IP and port info
const hostname = "127.0.0.1";
const port = 8000;

mongoose.connect(mongo_url, { useNewUrlParser:true, useUnifiedTopology:true, useCreateIndex:true }, (err) => {
	if (err) {
		console.log("Could not connect to database, exiting...");
		process.exit(0);
	}
	console.log("Connected to database: " + mongo_url);
});

app.post('/login', 
	[
		check('email', 'Invalid e-mail address').exists().isEmail(),
		check('password', 'Password was empty').exists()
	], function(req, res) {
		const errors = validationResult(req);
		if(!errors.isEmpty()) {
    		return res.status(422).json({ errors: errors.array() });
		}

		console.log(req.body);
		var email = req.body.email;
		var password = req.body.password;
		
		// Query database for account with this email
		AccountModel.findOne({email}, function(err, record) {
			if(err) res.send(err);
			else if(record) {
				record.comparePassword(password, function(err, isMatch) {
					if(err) res.send(err);
					if(isMatch) {
						res.send("Logged in: " + email);
					} else {
						res.send("Incorrect password");
					}
				});
			} else {
				res.send("Account not found: " + email);
			}
		})

	});

app.post('/createaccount', 
	[
		check('email', 'Invalid e-mail address').exists().isEmail(),
		check('password', 'Password was empty').exists()
	], function(req, res) {
		var email = req.body.email;
		var password = req.body.password;

		// Query database for how many accounts with this email exist
		AccountModel.count({email}, function(err, count) {
			if(err) res.send(err);
			else if(count > 0) {
				console.log("Duplicate email: " + email);
				res.send("duplicate email");
			} else {
				var newAccount = new AccountModel({email, password});
				newAccount.save();
				res.send("all good!");
			}
		})
	});

app.listen(3000, function() {
 	console.log('Example app listening on port 3000!');
});