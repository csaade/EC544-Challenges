var mongo = require('mongodb').MongoClient;
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
// var url = 'mongodb://localhost:27017/test';
// Connect to DB

// var token = particle.login({username: 'goulakos@bu.edu', password: 'group10'});

// var devicesPr = particle.listDevices({ auth: token });


var token;
particle.login({username: 'goulakos@bu.edu', password: 'group10'}).then(
  function(data){
	  console.log('API call completed on promise resolve: ', data.body.access_token);
	  token = data.body.access_token;
	  setTimeout(retrieveData, 2000);
	}, function(err) {
    console.log('API call completed on promise fail: ', err);
});

/* a device looks like this:
{ id: '3b0038001347353236343033',
  name: 'Pho',
  last_app: null,
  last_ip_address: '168.122.146.184',
  last_heard: '2016-10-18T06:20:31.799Z',
  product_id: 1783,
  connected: false,
  platform_id: 6,
  cellular: false,
  status: 'normal' }
*/
var retrieveData = function()
{
	particle.listDevices({ auth: token }).then(function(devices) {
		var time = new Date().getTime(); // Same time for all readings
		devices.body.forEach(function(device) {
			if(device.connected) {
				particle.getVariable({ deviceId: device.id, name: 'temp', auth: token }).then(function(data) {
					var temp = data.body.result;
					var msg = device.name + ":" + temp + ":" + time;
					io.emit("DB Value", msg);
					//console.log(msg);

					//// PUSH VALUE TO DATABASE HERE ////
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

/*
	var devicesPr = particle.listDevices({ auth: token });

	devicesPr.then(
  	function(devices){
		for(index in devices.body) {
			if(devices.body[index]['connected']) {
				var deviceName = devices.body[index]['name'];
				particle.getVariable({ deviceId: deviceName, name: 'temp', auth: token }).then(function(data) {
					var time = new Date().getTime();

					var devPr = particle.getDevice({ deviceId: data.body.coreInfo['deviceID'], auth: token });
					devPr.then(
					  function(deviceAttr){
							var msg = deviceAttr.body['name'] + ":" + data.body.result + ":" + time;
							io.emit('DB Value', msg);
							// PUSH VALUE TO DATABASE HERE //

							console.log(msg);
					  },
					  function(err) {
					    console.log('API call failed: ', err);
					  }
					);
				}, function(err) {
				 	console.log('An error occurred while getting attrs:', err);
				});
			}
		}*/
}


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
app.use(express.static('public'));
// Listen on port
http.listen(3000, function(){
  console.log('listening on *:3000');
});
