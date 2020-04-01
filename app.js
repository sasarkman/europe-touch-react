// Load HTTP module
var express = require('express');

// Load logging module
var logger = require('morgan');

// Load database module
var db = require('mongodb').MongoClient

// Initialize express and logger
var app = express();
app.use(logger('dev'));

// Mongodb connection string
const mongo_url = "mongodb://127.0.0.1:27017/"

// Express IP and port info
const hostname = "127.0.0.1";
const port = 8000;

// db.connect(mongo_url, function(err, database) {
// 	if (err) throw err;
// 	var dbo = database.db("local");
// 	dbo.collection("europe-touch").findOne({}, function(err, result) {
// 		if (err) throw err;
// 		console.log("Query: " + JSON.stringify(result));
// 		database.close();
// 	});
// });

app.get('/', function(req, res) {
 	res.send('Hello World!');
});

app.use('/index', express.static(__dirname + "/views/index/"));

app.listen(3000, function() {
 	console.log('Example app listening on port 3000!');
});