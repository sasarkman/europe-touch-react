// Load HTTP module
const express = require('express');

// Initialize express
const app = express();

// Module for credentials loading
require('dotenv').config();

// Session/cookie module
const session = require('express-session');
// const FileStore = require('session-file-store')(session);
const sessionStore = require('connect-mongodb-session')(session);
const cookieAuth = require('./cookie-session-authenticate');

const tokenAuth = require('./token-authenticate');

// Load logging module
const logger = require('morgan');

// Load object relational model module
const mongoose = require('mongoose');

// Load authorization module
const auth = require('jsonwebtoken');
const auth_key = "3urop3t0uch";

// Load user input validator
const { check, validationResult } = require('express-validator');

// Load password hashing module
const bcrypt = require('bcrypt');

// Initialize middlewares
app.use(logger('dev'));
app.use(express.urlencoded({extended:true}));

// Define static content delivery
app.use('/index', express.static(__dirname + "/views/index/"));
app.use('/login', express.static(__dirname + "/views/login/"));

// Mongodb connection string
//const mongo_url = "mongodb://127.0.0.1:27017/local"
const mongo_url = process.env.MONGODB_URL;

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

var store = new sessionStore({
	uri: mongo_url,
	collection: 'mySessions'
  });

app.use(session({
	name:'session_id',
	secret:'europe-touch',
	saveUninitialized: false,
	resave: false,
	// store:new FileStore()
	store: store
}));

app.get('/', function(req, res) {
	res.send("Reached /");
});

app.route('/login').
	get(
		function(req, res) {
			return res.send("Reached /login");
		}
	).
	post( 
	[
		check('email', 'Invalid e-mail address').exists().isEmail(),
		check('password', 'Password was empty').exists(),
	], function(req, res) {
		const errors = validationResult(req);
		if(!errors.isEmpty()) {
			return res.status(422).json({ errors: errors.array() });
		}

		// already logged in?
		if(req.session.user) {
			console.log(`Already logged in as ${req.session.user}`);
			return res.send("Logout first");
		} 

		// console.log(req.body);
		var email = req.body.email;
		var password = req.body.password;
		
		// Query database for account with this email
		AccountModel.findOne({email}, function(err, record) {
			if(err) res.send(err);
			else if(record) {
				record.comparePassword(password, function(err, isMatch) {
					if(err) res.send(err);
					if(isMatch) {
						//cookie
						req.session.user = email;

						const token = generateToken(email);
						res.status(200).send({ auth: true, token: token });
					} else {
						res.send("Incorrect password");
					}
				});
			} else {
				res.send("Account not found: " + email);
			}
		})
	});

app.post('/logout', function(req, res) {
	if(req.session.user) {
		res.status(200).send("Logged out!");
		req.session.destroy();
	} else {
		res.status(404).send("You're not logged in!");
	}
});

app.post('/createaccount', 
	[
		check('email', 'Invalid e-mail address').exists().isEmail(),
		check('password', 'Password was empty').exists()
	], function(req, res) {
		const errors = validationResult(req);
		if(!errors.isEmpty()) {
			return res.status(422).json({ errors: errors.array() });
		}
		
		var email = req.body.email;
		var password = req.body.password;

		// already logged in?
		if(req.session.user) {
			console.log(`Already logged in as ${req.session.user}`);
			res.send("Logout first");
		}

		// Query database for how many accounts with this email exist
		AccountModel.count({email}, function(err, count) {
			if(err) res.send(err);
			else if(count > 0) {
				console.log("Duplicate email: " + email);
				res.status(401).send("E-mail already in use: " + email);
			} else {
				var newAccount = new AccountModel({email, password});
				newAccount.save();
				res.send("all good!");
			}
		})
	}
);

app.get('/home', function(req, res) {
		if(req.session.user) {
			var user = req.session.user;
			console.log(`${user} visited /home`);
		}

		res.redirect("/login");
	}
);

// TODO: Don't need this route for now
// app.post('/deleteaccount', 
// 	[
// 		check('email', 'Invalid e-mail address').exists().isEmail(),
// 		check('password', 'Password was empty').exists(),
// 		[tokenAuth]
// 	], function(req, res) {
// 		var email = req.body.email;
// 		var password = req.body.password;

// 		// Query database for how many accounts with this email exist
// 		AccountModel.count({email}, function(err, count) {
// 			if(err) res.send(err);
// 			else if(count > 0) {
// 				console.log("Duplicate email: " + email);
// 				res.send("duplicate email");
// 			} else {
// 				var newAccount = new AccountModel({email, password});
// 				newAccount.save();
// 				res.send("all good!");
// 			}
// 		})
// 	}
// );

app.get('/token', [tokenAuth], function(req, res) {
	res.send("Reached /example");
});

app.get('/cookie', [cookieAuth], function(req, res) {
	res.send("Reached /example");
});

function generateToken(data) {
	return auth.sign({data}, auth_key);
}

function verifyToken(token) {
	try {
		return auth.verify(token, auth_key);
	} catch(e) {
		console.log('e: ', e);
		return null;
	}
}

app.listen(3000, function() {
	console.log('Example app listening on port 3000!');
});