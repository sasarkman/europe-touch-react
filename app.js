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

// Load routes
const accountRouter = require('./routes/account');
const serviceRouter = require('./routes/service');
const appointmentRouter = require('./routes/appointment');

// Load logging module
const logger = require('morgan');

// Load object relational model module
const mongoose = require('mongoose');

// Load template engine package
const sprightly = require('sprightly');

// Load authorization module
// const auth = require('jsonwebtoken');
// const auth_key = "3urop3t0uch";
const isLoggedIn = require('./auth').isLoggedIn;

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
app.use('/appointment', appointmentRouter);

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

app.get('/', isLoggedIn, function(req, res) {
	return res.redirect('/account');
});

module.exports = app;

app.listen(3000, function() {
	console.log('Example app listening on port 3000!');
});




