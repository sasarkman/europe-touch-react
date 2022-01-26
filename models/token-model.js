var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TokenSchema = new mongoose.Schema({
	token: {
		type: String,
		unique: true,
		required: true
	},
	email: {
		type: String,
		required: true,
		ref: 'accounts'
	},
	expireAt: {
		type: Date,
		default: Date.now,
		index: {
			expires: '1d'
		}
	}
});

// Use .syncIndexes() in case expiration time needs to change?

TokenSchema.post('save', function(next) {
	console.log(`/resetPassword/${this.token}`);
});

module.exports = mongoose.model('tokens', TokenSchema);