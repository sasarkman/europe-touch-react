var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
var Schema = mongoose.Schema;

var AccountSchema = new mongoose.Schema({
	email: {
		type: String, 
		required: true, 
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	phone: {
		// playing it safe
		type: String,
		required: true
	},
	name: {
		type: String,
		required: true,
	},
	age: {
		type: Number,
		required: true
	},
	admin: {
		type: Boolean,
		default: false
	},
	confirmed: {
		type: Boolean,
		default: false
	}
});

AccountSchema.pre('save', function(next) {
	this.wasNew = this.isNew;
	var account = this;

	if(!account.isModified('password')) return next();

	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
		if(err) return next("genSalt error");

		bcrypt.hash(account.password, salt, function(err, hash) {
			if(err) return next("bcrypt hash error");

			account.password = hash;
			next();
		})
	})
});

AccountSchema.post('save', function(doc, next) {
	var account = this;

	if(this.wasNew) {
		console.log(`http://localhost:3000/account/confirm/${this._id}`);
		// send confirmation e-mail
	}

	next();
})

AccountSchema.methods.comparePassword = function(candidatePassword, callback) {
	bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
		if(err) return callback(err);
		return callback(null, isMatch);
	})
}

module.exports = mongoose.model('accounts', AccountSchema);

