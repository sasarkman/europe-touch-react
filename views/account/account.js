console.log("account.js");

// Load user input validator
const { check, validationResult } = require('express-validator');

// Load Models
var AccountModel = require('../../models/account-model');

module.exports = function(app) {
	app.route('/createaccount').
		get(
			function(req, res) {
				return res.send("Reached /createaccount");
			}
		).
		post(
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
		)
	app.route('/deleteaccount').
		post(
			[
				check('email', 'Invalid e-mail address').exists().isEmail(),
				check('password', 'Password was empty').exists(),
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
			}
		)
	;
};