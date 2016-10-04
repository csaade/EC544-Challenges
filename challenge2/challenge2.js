var mongo = require('mongodb').MongoClient;
var serialport = require('serialport');
var assert = require('assert');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var device_id = [];
var graph_msg = [];
var url = 'mongodb://localhost:27017/test';
// Connect to DB

var insertTemp = function(id, temp, db, callback) {
	// Check for null id
	if(id == null || id == "")
		return;

	db.collection("X" + id).insertOne({
		"time" : new Date(),/*Math.floor(new Date().getTime() / 1000),*/
		"temp" : temp
	}, function(err, result) {
		assert.equal(err, null);
		console.log("X" + id + " Inserted a temperature!!!!!!!!");
		callback();
	});
};

/***
Function that sends all the data from the database to the front-end HTML
** (1) Connects to database
** (2) Submits a query to get the last data from the database (from all collections)
** (3) Emits it (i.e. sends it to front-end)
** NOTE: sends it to front end in the following format (format can be modified below)
**		- XbeeID:TemperatureValue:TimeStamp
** NOTE: instead of displaying one
***/

// Connect to serialport
var portName = process.argv[2],
portConfig = {
    baudRate: 9600,
    parser: serialport.parsers.readline("\n")
};

var sp;
sp = new serialport(portName, portConfig);

sp.on("open", function() {
	console.log("open");
	sp.on("data", function(data) {
		var id = data.split(":")[0];
    	var temp = parseInt(data.split(":")[1]);
    	var time = new Date().getTime();
    	//var time_UTC = new Date(time).toUTCString();
    	io.emit("DB Value", "X" + id + ":" + temp + ":" + time);

    	//Insert into the database called temperatures
    	//To print the database, enter "mongo". Then "db.temperatures.find().pretty()" in the terminal.
    	mongo.connect(url, function(err, db) {
		  assert.equal(null, err);
		  console.log('Connected to mongodb server');
		  insertTemp(id, temp, db, function() {
		  	db.close();
		  });
		});
		//realtimeGraph();
		//average();
	});


});

// Return the html page and other web things
app.use(express.static('public'));

// Return list of xbees
app.get('/xbees', function(req, res) {
	mongo.connect(url, function(err, db) {

		db.listCollections().toArray(function(err, cols) {
			var json_array = {};
			json_array.names = [];
			cols.forEach(function(col) {
				json_array.names.push(col.name);
			})
			
			console.log(json_array);
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify(json_array));
		});

	})
});

// Return a json array for the historical graph
app.get('/historical/:xbeeId/timebackward/:time', function(req, res) {
	// Get data from mongodb
	var xbeeData = {};
	xbeeData.times = [];
	xbeeData.temps = [];

	var xbeeId = req.params["xbeeId"];
	var timeBackward = parseInt(req.params["time"]); // in seconds

	mongo.connect(url, function(err, db) {
		assert.equal(null, err);
		console.log('Connected to mongodb server'); //debug (remove this later)

		var past_date = new Date();
		past_date.setTime(past_date.getTime() - timeBackward * 1000); // *1000 due to milliseconds

		db.collection(xbeeId).find(
			{"time": {"$gte": past_date}}
		).toArray(function(err, docs) {
			// Push the labels for x axis ('x') and xbee id
			xbeeData.times.push('x');
			xbeeData.temps.push(xbeeId);

			// Chart needs nulls to show that there's no data
			if(docs.length == 0) {
				xbeeData.times.push(null);
				xbeeData.temps.push(null);
			}

			// Loop through each 
			docs.forEach(function(doc) {
				var thisTime = new Date(doc.time);
				xbeeData.times.push(thisTime.toString());
				xbeeData.temps.push(doc.temp);
			});

			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify(xbeeData));
		});
	});
});

// Listen on port
http.listen(3000, function(){
  console.log('listening on *:3000');
});
