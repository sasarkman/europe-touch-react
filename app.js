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

// Module for credentials loading
require('dotenv').config();

// Load path module for filepaths
const path = require('path');

// Session/cookie module
const session = require('express-session');
app.use(session({
	name:'session_id',
	secret:'europe-touch',
	saveUninitialized: true,
	resave: false,
	// store:new FileStore()
	// store: store
}));

// Initialize and load router middleware
const router = express.Router();
app.use(router);

// const FileStore = require('session-file-store')(session);
//const sessionStore = require('connect-mongodb-session')(session);
//const cookieAuth = require('./cookie-session-authenticate');

//const tokenAuth = require('./token-authenticate');

// Load routes
const accountRouter = require('./routes/account');
// const loginRouter = require('./routes/login');
const serviceRouter = require('./routes/service');

// Load logging module
const logger = require('morgan');

// Load object relational model module
const mongoose = require('mongoose');

const sprightly = require('sprightly');

// Load authorization module
const auth = require('jsonwebtoken');
const auth_key = "3urop3t0uch";

// Load user input validator
const { check, validationResult } = require('express-validator');

// Load password hashing module
const bcrypt = require('bcrypt');

// Initialize middlewares
app.use(logger('dev'));

// Initialize routes
// app.use('/login', loginRouter);
app.use('/account', accountRouter);
app.use('/service', serviceRouter);

// Define and initialize templating engine
app.engine('spy', sprightly);
app.set('view engine', 'spy');
app.set('views', path.join(__dirname, 'views'));

// Expose controllers directory
app.use(express.static(path.join(__dirname, 'controllers')));

// Mongodb connection string
//const mongo_url = "mongodb://127.0.0.1:27017/local"
const mongo_url = process.env.MONGODB_URL;

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

app.get('/', function(req, res) {
	if(typeof(req.session.user) != "undefined") {
		var user = req.session.user.email;
		console.log(`${user} visited /`);
		return res.render('account', {});
	} else {
		return res.render('login', {});
	}
});

module.exports = app;

app.listen(3000, function() {
	console.log('Example app listening on port 3000!');
});




