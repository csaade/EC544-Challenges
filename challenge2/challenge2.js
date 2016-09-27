var mongo = require('mongodb').MongoClient;
var serialport = require('serialport');
var assert = require('assert');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var url = 'mongodb://localhost:27017/test';

// Connect to DB

var insertTemp = function(id, temp, db, callback) {
	db.collection('temperatures').insertOne({
		"XBee_id" : id,
		"time" : new Date(),
		"temp" : temp
	}, function(err, result) {
		assert.equal(err, null);
		console.log("Inserted a temperature!!!!!!!!");
		callback();
	});
};

// Connect to serialport

var portName = process.argv[2],
portConfig = {
    baudRate: 9600,
    parser: serialport.parsers.readline("\n")
};
var sp;
sp = new serialport.SerialPort(portName, portConfig);

sp.on("open", function() {
	console.log("open");
	sp.on("data", function(data) {
		var id = parseInt(data.split(":")[0]);
    	var temp = parseInt(data.split(":")[1]);

    	//Insert into the database called temperatures
    	//To print the database, enter "mongo". Then "db.temperatures.find().pretty()" in the terminal. 
    	mongo.connect(url, function(err, db) {
		  assert.equal(null, err);
		  console.log('Connected to mongodb server');
		  insertTemp(id, temp, db, function() {
		  	db.close();
		  });
		});
	});
});


// Return the html page and other web things
app.use(express.static('public'));

// Listen on port
http.listen(3000, function(){
  console.log('listening on *:3000');
});
