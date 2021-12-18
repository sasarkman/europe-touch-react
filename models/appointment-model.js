var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
var Schema = mongoose.Schema;

var AppointmentSchema = new mongoose.Schema({
	account: { 
		type: mongoose.SchemaTypes.ObjectId, 
		required: true,
		ref: 'accounts'
	},
	service: {
		type: mongoose.SchemaTypes.ObjectId,
		required: true,
		ref: 'services'
	},
	datetime: {
		type: Date,
		required: true,
		ref: 'appointments',
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

