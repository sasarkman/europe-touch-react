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

// Expose directories
app.use('/controllers', express.static(path.join(__dirname, 'controllers')));
// app.use('/js', express.static(path.join(__dirname, 'node_modules/jquery/dist')));
// app.use('/js', express.static(path.join(__dirname, 'node_modules/jquery-ui-dist')));
// app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));
// app.use('/js', express.static(path.join(__dirname, 'node_modules/js-year-calendar/dist')));
// app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
// app.use('/css', express.static(path.join(__dirname, 'node_modules/js-year-calendar/dist')));

// app.use('/jquery.js', express.static(path.join(__dirname, 'node_modules/jquery/dist/jquery.min.js')));
app.use('/jquery.js', express.static(path.join(__dirname, 'node_modules/jquery/dist/jquery.js')));
// app.use('/popper.js', express.static(path.join(__dirname, 'node_modules/@popperjs/core/dist/cjs/popper.js')));
// app.use('/jquery-ui.js', express.static(path.join(__dirname, 'node_modules/jquery-ui-dist/jquery-ui.min.js')));
app.use('/jquery-ui.js', express.static(path.join(__dirname, 'node_modules/jquery-ui-dist/jquery-ui.js')));
// app.use('/bootstrap.js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js')));
app.use('/bootstrap.js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js/bootstrap.bundle.js')));
app.use('/bootstrap.css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css/bootstrap.min.css')));
// app.use('/js-year-calendar.js', express.static(path.join(__dirname, 'node_modules/js-year-calendar/dist/js-year-calendar.js')));
// app.use('/js-year-calendar.css', express.static(path.join(__dirname, 'node_modules/js-year-calendar/dist/js-year-calendar.min.css')));
app.use('/bootstrap-calendar.js', express.static(path.join(__dirname, 'node_modules/bootstrap-calendar/js/calendar.js')));
app.use('/bootstrap-calendar.css', express.static(path.join(__dirname, 'node_modules/bootstrap-calendar/css/calendar.css')));
app.use('/tmpls', express.static(path.join(__dirname, 'node_modules/bootstrap-calendar/tmpls/')));

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




