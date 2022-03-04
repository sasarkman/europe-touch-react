var mongoose = require('mongoose');
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

ServiceSchema.post('findOneAndRemove', function(doc, next) {
	AppointmentSchema.deleteMany({service: doc._id}, function(err, result) {
		if(err) next(err);
		else {
			next();
		}
	})
});

module.exports = mongoose.model('services', ServiceSchema);

