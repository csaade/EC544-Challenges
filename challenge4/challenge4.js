var mongo = require('mongodb').MongoClient;
var assert = require('assert');
var url = 'mongodb://localhost:27017/test';
var Particle = require('particle-api-js');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Particle = require('particle-api-js');
var particle = new Particle();

io.on('connection',function(socket) {
	console.log("Connected");
});

var device_id = [];
var graph_msg = [];


var token;
particle.login({username: 'goulakos@bu.edu', password: 'group10'}).then(
  function(data){
	  console.log('API call completed on promise resolve: ', data.body.access_token);
	  token = data.body.access_token;
	  setTimeout(retrieveData, 2000);
	}, function(err) {
    console.log('API call completed on promise fail: ', err);
});

var retrieveData = function()
{
	particle.listDevices({ auth: token }).then(function(devices) {
		var time = new Date().getTime(); // Same time for all readings
		var timeDB = new Date(); // time used for the database

		devices.body.forEach(function(device) {
			if(device.connected) {
				particle.getVariable({ deviceId: device.id, name: 'temp', auth: token }).then(function(data) {
					var temp = data.body.result;
					var msg = device.name + ":" + temp + ":" + time;
					io.emit("DB Value", msg);
					console.log(msg);

					//// PUSH VALUE TO DATABASE HERE ////
					mongo.connect(url, function(err, db) {
					  assert.equal(null, err);
					  console.log('Connected to mongodb server');
					  db.collection(device.name).insertOne({
						"time" : timeDB,/*Math.floor(new Date().getTime() / 1000),*/
						"temp" : temp
						}, function(err, result) {
						assert.equal(err, null);
						console.log(device.name + " Inserted a temperature!");
						db.close();
						});
					  });
				},
				function(err) {
					console.log("Error getting variable");
				});
			}
		});
		setTimeout(retrieveData, 2000);
	},
	function(err) {
		console.log("Error getting device list");
	}
);
}

// Return list of devices
app.get('/devices', function(req, res) {
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
app.get('/historical/:deviceName/timebackward/:time', function(req, res) {
	// Get data from mongodb
	var deviceData = {};
	deviceData.times = [];
	deviceData.temps = [];

	var deviceName = req.params["deviceName"];
	var timeBackward = parseInt(req.params["time"]); // in seconds

	mongo.connect(url, function(err, db) {
		assert.equal(null, err);
		console.log('Connected to mongodb server'); //debug (remove this later)

		var past_date = new Date();
		past_date.setTime(past_date.getTime() - timeBackward * 1000); // *1000 due to milliseconds

		db.collection(deviceName).find(
			{"time": {"$gte": past_date}}
		).toArray(function(err, docs) {
			// Push the labels for x axis ('x') and xbee id
			deviceData.times.push('x');
			deviceData.temps.push(deviceName);

			// Chart needs nulls to show that there's no data
			if(docs.length == 0) {
				deviceData.times.push(null);
				deviceData.temps.push(null);
			}

			// Loop through each
			docs.forEach(function(doc) {
				var thisTime = new Date(doc.time);
				deviceData.times.push(thisTime.toString());
				deviceData.temps.push(doc.temp);
			});

			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify(deviceData));
		});
	});
});

app.use(express.static('public'));
// Listen on port
http.listen(3000, function(){
  console.log('listening on *:3000');
});
