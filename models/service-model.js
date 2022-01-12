var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
var Schema = mongoose.Schema;

var AppointmentSchema = require('./appointment-model');

var ServiceSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true
	},
	duration: {
		type: String,
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

ServiceSchema.pre('deleteOne', function(next) {
	const id = this.getQuery()['_id'];
	const name = this.getQuery()['name'];
	console.log(`Deleting service: ${name}, ID: ${id}`);



	next();
});

ServiceSchema.post('deleteOne', function(doc, next) {
	const id = this.getQuery()['_id'];
	const name = this.getQuery()['name'];
	console.log(`Deleted service: ${name}, ID: ${id}`);

	// TODO: deletes
	// delete all appointments
	// AppointmentSchema.deleteMany({service: id});

	console.log(`Deleting appointments tied to this service`);

	AppointmentSchema.deleteMany({service: id}, function(err, result) {
		if(err) next(err);
		else {
			console.log(`Deleted ${result.deletedCount} appointments`);
			next();
		}
	})

	// next();
});


module.exports = mongoose.model('services', ServiceSchema);

