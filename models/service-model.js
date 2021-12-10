var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
var Schema = mongoose.Schema;

var ServiceSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true
	},
	duration: {
		type: Number,
		required: true
	},
	price: {
		type: Number,
		required: true
	},
	description: {
		type: String
	}
});

// AppointmentSchema.pre('save', function(next) {
// 	var appointment = this;

// 	console.log(`Converting ${appointment.data} to ${Date.parse(appointment.date)}`);
// 	appointment.date = Date.parse(appointment.date);
// });

module.exports = mongoose.model('services', ServiceSchema);

