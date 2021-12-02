// Load HTTP module
const express = require('express');
const bodyParser = require('body-parser');

// Initialize express
const app = express();
//app.use(express.urlencoded({extended:true}));

app.use(bodyParser.urlencoded({
	extended: true
 }));
app.use(bodyParser.json());

// Connect routes from other files
// require('./views/login/login.js')(app);

// Module for credentials loading
require('dotenv').config();

// Session/cookie module
const session = require('express-session');
// const FileStore = require('session-file-store')(session);
//const sessionStore = require('connect-mongodb-session')(session);
//const cookieAuth = require('./cookie-session-authenticate');

//const tokenAuth = require('./token-authenticate');

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

// Define static content delivery
app.use('/login', express.static(__dirname + "/views/login/"));
app.use('/account', express.static(__dirname + "/views/account/"));

// Mongodb connection string
//const mongo_url = "mongodb://127.0.0.1:27017/local"
const mongo_url = process.env.MONGODB_URL;
console.log(`URL: ${mongo_url}`);
exports.mongo_url = mongo_url;

// Load Models
var AccountModel = require('./models/account-model');
exports.AccountModel = AccountModel;

// Express IP and port info
const hostname = "127.0.0.1";
const port = 8000;


mongoose.connect(mongo_url, { useNewUrlParser:true, useUnifiedTopology:true }, (err) => {
	if (err) {
		console.log(err);
		console.log("Could not connect to database, exiting...");
		process.exit(0);
	}
	console.log("Connected to database: " + mongo_url);
});

// var store = new sessionStore({
// 	uri: mongo_url,
// 	collection: 'mySessions'
//   });

app.use(session({
	name:'session_id',
	secret:'europe-touch',
	saveUninitialized: true,
	resave: false,
	// store:new FileStore()
	// store: store
}));

app.get('/', function(req, res) {
	if(req.session.user) {
		var user = req.session.user;
		console.log(`${user} visited /home`);
	}

	res.redirect("/login");
});

app.post('/logout', function(req, res) {
	if(req.session.user) {
		res.status(200).send("Logged out!");
		req.session.destroy();
	} else {
		res.status(404).send("You're not logged in!");
	}
});




app.listen(3000, function() {
	console.log('Example app listening on port 3000!');
});

module.exports = app;

// Connect routes from other files
require('./views/login/login.js')(app);
require('./views/account/account.js')(app);