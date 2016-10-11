var serialport = require('serialport');
var assert = require('assert');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);


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
    	

    	io.emit("DB Value", "X" + id + ":" + temp + ":" + time);
	});


});

// Return the html page and other web things
app.use(express.static('public'));

// Listen on port
http.listen(3000, function(){
  console.log('listening on *:3000');
});
