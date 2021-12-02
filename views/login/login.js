console.log("login.js");

// Load user input validator
const { check, validationResult } = require('express-validator');

// const session = require('express-session');
// const FileStore = require('session-file-store')(session);
// const sessionStore = require('connect-mongodb-session')(session);

// Load Models
var AccountModel = require('../../models/account-model');

module.exports = function(app) {
	// var store = new sessionStore({
	// 	uri: mongo_url,
	// 	collection: 'mySessions'
	//   });

	// app.use(session({
	// 	name:'session_id',
	// 	secret:'europe-touch',
	// 	saveUninitialized: false,
	// 	resave: false,
	// 	store:new FileStore()
	// 	// store: store
	// }));

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
			],
			function(req, res) {
				const errors = validationResult(req);
				if(!errors.isEmpty()) {
					return res.status(422).json({ errors: errors.array() });
				}

				// already logged in?
				if(req.session.user) {
					console.log(`Already logged in as ${req.session.user}`);
					return res.send("Logout first");
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
								//cookie
								req.session.user = email;

								//const token = generateToken(email);
								// res.status(200).send({ auth: true, token: token });
								res.status(200).send();
							} else {
								res.send("Incorrect password");
							}
						});
					} else {
						res.send("Account not found: " + email);
					}
				});
			}
		)
	;
};