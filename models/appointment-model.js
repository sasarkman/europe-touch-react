var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
var Schema = mongoose.Schema;

var AppointmentSchema = new mongoose.Schema({
	email: { 
		type: String, 
		required: true, 
	},
	service: {
		type: String,
		required: true
	},
	date: {
		type: Date,
		required: true
	},
	createdTimestamp: {
		type: Date,
		default: Date().now
	},
	approved: {
		type: Boolean,
		default: false
	}
});

AppointmentSchema.pre('save', function(next) {
	var appointment = this;

	console.log(`Converting ${appointment.data} to ${Date.parse(appointment.date)}`);
	appointment.date = Date.parse(appointment.date);
});

module.exports = mongoose.model('appointments', AppointmentSchema);

