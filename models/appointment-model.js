var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
var Schema = mongoose.Schema;

var AppointmentSchema = new mongoose.Schema({
	email: { 
		type: String, 
		required: true, 
	},
	date: {
		type: Date,
		required: true
	},
	created: {
		type: Date,
		default: new Date()
	}
});

AppointmentSchema.pre('save', function(next) {
	var appointment = this;

	if(!appointment.isModified('date')) return next();
});

module.exports = mongoose.model('appointments', AppointmentSchema);

