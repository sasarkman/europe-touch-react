// Load HTTP module
// const http = require("http");
var express = require('express');
var logger = require('morgan');
var app = express();
app.use(logger('dev'));

const hostname = "127.0.0.1";
const port = 8000;

app.get('/', function(req, res) {
  res.send('Hello World!');
});

app.listen(3000, function() {
  console.log('Example app listening on port 3000!');
});