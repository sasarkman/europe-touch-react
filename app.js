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
	secret: process.env.SESSION_SECRET,
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

// Expose directories
app.use('/controllers', express.static(path.join(__dirname, 'controllers')));
app.use('/scripts', express.static(path.join(__dirname, 'scripts')));

app.use('/jquery.js', express.static(path.join(__dirname, 'node_modules/jquery/dist/jquery.js')));
app.use('/jquery-ui.js', express.static(path.join(__dirname, 'node_modules/jquery-ui-dist/jquery-ui.js')));
app.use('/jquery-validation.js', express.static(path.join(__dirname, 'node_modules/jquery-validation/dist/jquery.validate.js')));

app.use('/bootstrap.js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js/bootstrap.bundle.js')));
app.use('/bootstrap.css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css/bootstrap.min.css')));

app.use('/font-awesome.css', express.static(path.join(__dirname, 'node_modules/font-awesome/css/font-awesome.css')));

app.use('/fullcalendar.js', express.static(path.join(__dirname, 'node_modules/fullcalendar/main.js')));
app.use('/fullcalendar.css', express.static(path.join(__dirname, 'node_modules/fullcalendar/main.css')));

// Mongodb connection string
const mongo_url = process.env.MONGODB_URL;

// Express IP and port info
app.set('port', process.env.PORT);

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

app.listen(app.get('port'), function() {
	console.log(`Example app listening on port ${app.get('port')}`);
});