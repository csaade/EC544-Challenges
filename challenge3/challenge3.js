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
        console.log("Kyle is a nag");
        // Just received a status string from the arduino, sent it to the web page
        io.emit('status_msg', data);
	});
});

// When a socket connection occurs from the web page
io.on('connection', function(socket) {
    socket.on('led_msg', function(msg) {
        // Received a message to toggle an LED from the web page,
        // now send the character to the xbee->arduino
        sp.write(msg);
    });
});

// Return the html page and other web things
app.use(express.static('public'));

// Listen on port
http.listen(3000, function(){
  console.log('listening on *:3000');
});
