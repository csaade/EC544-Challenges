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
	db.collection("X" + id).insertOne({
		"time" : Math.floor(new Date().getTime() / 1000),
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

/*
** Function that sends all the data from the database to the front-end HTML
** (1) Connects to database
** (2) Submits a query to get the last data from the database (from all collections)
** (3) Emits it (i.e. sends it to front-end)
** NOTE: sends it to front end in the following format (format can be modified below)
**		- XbeeID:TemperatureValue:TimeStamp
*/
var realtimeGraph = function(callback){
	
	device_id = [];
	graph_msg = [];

	/*** CONNECTION TO DB ***/
	// mongo.connect(url, function(err, db) {
	// 	assert.equal(null, err);
	// 	console.log('Connected to mongodb server'); //debug (remove this later)
		
	// 	/*** LOOPING THROUGH ALL COLLECTIONS INSIDE DB ***/
	// 	//Note: every data coming from an Xbee has its own collection in the DB
	// 	db.collections(function(e, cols) {
	// 		cols.forEach(function(col) {

	// 			var name = col.collectionName; //get XbeeID

	// 			** FINDS LAST DATA INSERTED FROM SPECIFIC COLLECTION **
	// 			/*** LOOPS THROUGH ALL DOCUMENTS INSIDE THIS DATAPOINT ***/
	// 			db.collection(name).find().skip(db.collection(name).count() - 1).forEach(function(docs) {

	// 				io.emit("DB Value", name + ":" + docs.temp + ":" + docs.time); //MODIFY THIS TO SEND IT IN DIFFERENT FORMAT
	// 				console.log("id: " + name + " temp: " + docs.temp + " time: " + docs.time); //debug (can be removed)
	// 			});
	// 		});
			
	// 	//io.emit(graph_msg);
	// 	});

		 
	// });

	
}

var average = function(callback) {
	var total = 0;
	var length = 0;
	mongo.connect(url, function(err, db) {
		assert.equal(null, err);
		console.log('Connected to mongodb server'); //debug (remove this later)
		
		/*** LOOPING THROUGH ALL COLLECTIONS INSIDE DB ***/
		//Note: every data coming from an Xbee has its own collection in the DB
		db.collections(function(e, cols) {
			cols.forEach(function(col) {

				var name = col.collectionName; //get XbeeID

				/** FINDS LAST DATA INSERTED FROM SPECIFIC COLLECTION **/
				/*** LOOPS THROUGH ALL DOCUMENTS INSIDE THIS DATAPOINT ***/
				var docs = db.collection(name).find().sort({_id:-1}).limit(1);
				console.log(docs);
					//  total = total + parseInt(docs.temp);
					//  console.log("total: " + total);
					//  //length += 1; 
					//  console.log("length: " + length);
					// // //console.log("average!!!!!!!!");
					// console.log("temp: " + docs.temp);
					// io.emit("DB Value", name + ":" + docs.temp + ":" + docs.time); //MODIFY THIS TO SEND IT IN DIFFERENT FORMAT
			});

		});	
		
	});
	var average = parseInt(total/length);
	total = 0;
	//length = 0;
	console.log("Average: " + average);
	io.emit('Average', average);
}

var sp;
sp = new serialport.SerialPort(portName, portConfig);

sp.on("open", function() {
	console.log("open");
	sp.on("data", function(data) {
		var id = data.split(":")[0];
    	var temp = parseInt(data.split(":")[1]);
    	var time = new Date().getTime();

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
		realtimeGraph();
		average();
	});

	
});


// Return the html page and other web things
app.use(express.static('public'));

// Listen on port
http.listen(3000, function(){
  console.log('listening on *:3000');
});
