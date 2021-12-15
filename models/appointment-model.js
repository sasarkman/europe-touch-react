var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
var Schema = mongoose.Schema;

var AppointmentSchema = new mongoose.Schema({
	account: { 
		type: mongoose.SchemaTypes.ObjectId, 
		required: true,
	},
	service: {
		type: mongoose.SchemaTypes.ObjectId,
		required: true
	},
	datetime: {
		type: Date,
		required: true
	},
	createdTimestamp: {
		type: Date,
		default: Date.now
	},
	approved: {
		type: Boolean,
		default: false
	}
});

module.exports = mongoose.model('appointments', AppointmentSchema);

