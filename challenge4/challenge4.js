// var mongo = require('mongodb').MongoClient;
//var serialport = require('serialport');
var Particle = require('particle-api-js');

// var express = require('express');
// var app = express();
// var http = require('http').Server(app);

// var io = require('socket.io')(http);
var device_id = [];
var graph_msg = [];
// var url = 'mongodb://localhost:27017/test';
// Connect to DB


var Particle = require('particle-api-js');
var particle = new Particle();

// var token = particle.login({username: 'goulakos@bu.edu', password: 'group10'});

// var devicesPr = particle.listDevices({ auth: token });


particle.login({username: 'goulakos@bu.edu', password: 'group10'}).then(
  function(data){
    console.log('API call completed on promise resolve: ', data.body.access_token);
	  //var devicesPr = particle.listDevices({ auth: data.body.access_token });
	//console.log(devicesPr);

	particle.getVariable({ deviceId: '2a0047001747353236343033', name: 'tempString', auth: data.body.access_token }).then(function(data) {
  console.log('Device variable retrieved successfully:', data);
}, function(err) {
  console.log('An error occurred while getting attrs:', err);
});},
  function(err) {
    console.log('API call completed on promise fail: ', err);
  });



// particle.getVariable({ deviceId: 'Trump', name: 'temp', auth: token }).then(function(data) {
//   console.log('Device variable retrieved successfully:', data);
// }, function(err) {
//   console.log('An error occurred while getting attrs:', err);
// });

// var insertTemp = function(id, temp, db, callback) {
// 	// Check for null id
// 	if(id == null || id == "")
// 		return;

// 	db.collection("X" + id).insertOne({
// 		"time" : new Date(),Math.floor(new Date().getTime() / 1000),
// 		"temp" : temp
// 	}, function(err, result) {
// 		assert.equal(err, null);
// 		console.log("X" + id + " Inserted a temperature!!!!!!!!");
// 		callback();
// 	});
// };



// Return a json array for the historical graph
// app.get('/historical/:xbeeId/timebackward/:time', function(req, res) {
// 	// Get data from mongodb
// 	var xbeeData = {};
// 	xbeeData.times = [];
// 	xbeeData.temps = [];

// 	var xbeeId = req.params["xbeeId"];
// 	var timeBackward = parseInt(req.params["time"]); // in seconds

// 	mongo.connect(url, function(err, db) {
// 		assert.equal(null, err);
// 		console.log('Connected to mongodb server'); //debug (remove this later)

// 		var past_date = new Date();
// 		past_date.setTime(past_date.getTime() - timeBackward * 1000); // *1000 due to milliseconds

// 		db.collection(xbeeId).find(
// 			{"time": {"$gte": past_date}}
// 		).toArray(function(err, docs) {
// 			// Push the labels for x axis ('x') and xbee id
// 			xbeeData.times.push('x');
// 			xbeeData.temps.push(xbeeId);

// 			// Chart needs nulls to show that there's no data
// 			if(docs.length == 0) {
// 				xbeeData.times.push(null);
// 				xbeeData.temps.push(null);
// 			}

// 			// Loop through each 
// 			docs.forEach(function(doc) {
// 				var thisTime = new Date(doc.time);
// 				xbeeData.times.push(thisTime.toString());
// 				xbeeData.temps.push(doc.temp);
// 			});

// 			res.setHeader('Content-Type', 'application/json');
// 			res.send(JSON.stringify(xbeeData));
// 		});
// 	});
// });

// Listen on port
// http.listen(3000, function(){
//   console.log('listening on *:3000');
// });
