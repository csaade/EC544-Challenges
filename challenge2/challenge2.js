var mongo = require('mongodb').MongoClient;
var serialport = require('serialport');
var assert = require('assert');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var url = 'mongodb://localhost:27017/test';

// Connect to DB
/*
mongo.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log('Connected to mongodb server');
  db.close();
});
*/

// Connect to serialport
/*
var portName = process.argv[2],
portConfig = {
    baudRate: 9600,
    parser: serialport.parsers.readline("\n")
};
var sp;
sp = new serialport.SerialPort(portName, portConfig);
*/

// Return the html page and other web things
app.use(express.static('public'));

// Listen on port
http.listen(3000, function(){
  console.log('listening on *:3000');
});
