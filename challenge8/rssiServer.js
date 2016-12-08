var SerialPort = require("serialport");
var app = require('express')();
var xbee_api = require('xbee-api');
var fs = require('fs');
var http = require('http').Server(app);
var express = require('express');
var io = require('socket.io')(http);
var ml = require('machine_learning');
var path = require('path');

// var spawn = require('child_process').spawn;
// var proc;
 

var RSSI_values = [];
var beacon1 = [], beacon2 = [], beacon3 = [],beacon4 = [];
var pollCount = 0; //for continuing the polling system
//buffers for averaging in order to make data less jumpy

var request_counter = 0;

// Read output.csv into a 2d array
var knn = null;
var train_data = [];
var bins = [];

var C = xbee_api.constants;
var XBeeAPI = new xbee_api.XBeeAPI({
  api_mode: 2
});

var xbeePort = '/dev/cu.usbserial-A601D97W';//'/dev/ttyUSB0';//process.argv[2];
var arduinoPort = '/dev/cu.usbmodem1421';//'/dev/ttyACM0';

var sampleDelay = 3000;
var xbeeAddress = ["0013A20040ACFF00", "0013A20040A1A0C3", "0013A20040ACFF79", "0013A20040A1A12B"];
var stream;

var portConfig = {
  baudRate: 9600,
  parser: XBeeAPI.rawParser()
};

var portArduinoConfig = {
  baudrate: 9600
};

var sp;
var spArduino;
sp = new SerialPort.SerialPort(xbeePort, portConfig);
spArduino = new SerialPort.SerialPort(arduinoPort, portArduinoConfig);

/* Requests RSSI value from Xbee specified by address param */
function requestRSSI(address){

  //Create a packet to be sent to all other XBEE units on the PAN.
  // The value of 'data' is meaningless, for now.
  var RSSIRequestPacket = {
    type: C.FRAME_TYPE.ZIGBEE_TRANSMIT_REQUEST,
    destination64: address,
    broadcastRadius: 0x01,
    options: 0x00,
    data: "test"
  }

  sp.write(XBeeAPI.buildFrame(RSSIRequestPacket));

}

// Requests rssi's from all xbees
function requestAllRSSI() {
    request_counter++;
    for(var address in xbeeAddress) {
        requestRSSI(xbeeAddress[address]);
    }
}

function averageRSSI(buffer){
    var total = 0;
    for(var i = 0; i < buffer.length; i++) {
        total += buffer[i];
    }
    var avg = total / buffer.length;
    RSSI_values.push(avg); //save
}

// Serial Communication with Arduino
  spArduino.on("open", function() {
  console.log('open arduino serial');

//   // Dont need to read value from arduino
//   // spArduino.on('data', function(data) {
//   //   console.log('data received from arduino:' + data);
//   // });

//   // Writing to arduino
//   // spArduino.write(new Buffer('4', 'ascii'), function(err, results) {
//   //   console.log('err' + err);
//   //   console.log('results' + results);
//   // });
  });

/* gets called whenever we connect to the server which is the serial port(only once) */
sp.on("open", function () {
  console.log('open Xbee serial');
  stream = fs.createWriteStream("./out.csv");

    console.log('Reading training data');
    var file_data = fs.readFileSync('./output.csv');//, (err, data) => {
    var lines = file_data.toString().split('\n');
    for(var row = 1; row < lines.length - 1; row++) // skip first row and last row (newline)
    {
        var cols = lines[row].split(',');
        // console.log(cols);
        var row_array = [];
        for(var col = 0; col < cols.length - 1; col++) // get the left 4 columns
            row_array.push(parseInt(cols[col]));

        bins.push(cols[cols.length - 1]); // put the bin # in a different list
        train_data.push(row_array);
    }

    knn = new ml.KNN({
        data: train_data,
        result: bins
    });
    console.log('Done');

    requestAllRSSI();
});

/* Gets called whenever we receive data from xbee */
XBeeAPI.on("frame_object", function(frame) {


  if (frame.type == 144){
    //console.log('xbee' + frame.data[1].toString() + 'rssi' + frame.data[0].toString());
      console.log(frame.data[1].toString() + " " + frame.data[0].toString());
      if(request_counter == 4){
      // if (beacon1.length == 4){

          beacon1 = padArray(beacon1, 4);
          beacon2 = padArray(beacon2, 4);
          beacon3 = padArray(beacon3, 4);
          beacon4 = padArray(beacon4, 4);

          averageRSSI(beacon1);
          averageRSSI(beacon2);
          averageRSSI(beacon3);
          averageRSSI(beacon4);

          printArrays();

          // stream.write("\n");
          var bin = knn.predict({
             x: RSSI_values,
             k: 1
          });


          bin = parseInt(bin);

          console.log(RSSI_values.toString() + ' bin: ' + bin.toString());
            spArduino.write("fucking bitch", function(err, results) {
              results = bin.toString();
              console.log('err ' + err);
              console.log('results ' + results);
            });

          // io.emit('msg', bin.toString());

          stream.write(RSSI_values[0].toString() + ',');
          stream.write(RSSI_values[1].toString() + ',');
          stream.write(RSSI_values[2].toString() + ',');
          stream.write(RSSI_values[3].toString());
          stream.write('\n');

          RSSI_values =[], beacon1 = [], beacon2 = [], beacon3 = [], beacon4 = [] ;//clear buffers
          request_counter = 0;
      }


      switch(frame.data[1]){
          case 1:
              beacon1.push(parseInt(frame.data[0]));
              pollCount++;
              break;
          case 2:
              beacon2.push(parseInt(frame.data[0]));
              pollCount++;
              break;
          case 3:
              beacon3.push(parseInt(frame.data[0]));
              pollCount++;
              break;
          case 4:
              beacon4.push(parseInt(frame.data[0]));
              pollCount++;
              break;
      };

    // stream.write(frame.data[0].toString());
    //console.log(frame.data[0].toString());
    //countFrames++;

    //For continued polling
    if(pollCount == 4){
      pollCount = 0;
      // requestAllRSSI();
      setTimeout(requestAllRSSI, 1000);
    }
    // if we are still expecting data from xbees
    // else {
    //   stream.write(",");
    // }

  }
});

function padArray(arr, len) {
    if(arr.length == 0)
        return;

    if(arr.length < len) {
        for(var i = arr.length - 1; i < len; i++) {
            arr.push(arr[0]);
        }
    }

    return arr;
}

function printArrays() {
    console.log(beacon1);
    console.log(beacon2);
    console.log(beacon3);
    console.log(beacon4);
}

// Listen on port
app.use(express.static('public'));

io.on('connection', function(socket) {
    socket.on('remote_msg', function(msg) {
        // Received a message to toggle an LED from the web page,
        // now send the character to the xbee->arduino
        spArduino.write(msg);
    });

  //   socket.on('start-stream', function() {
  //   startStreaming(io);
  // });

  //   socket.on('disconnect', function() {
  //     stopStreaming();
  //   });

});

// http.listen(3000, function(){
//     console.log('listening on *:3000');
// });

// function stopStreaming() {
//   app.set('watchingFile', false);
//   if (proc) proc.kill();
//   fs.unwatchFile('./public/image_stream.jpg');
// }
 
// function startStreaming(io) {
 
//   if (app.get('watchingFile')) {
//     io.emit('liveStream', 'image_stream.jpg?_t=' + (Math.random() * 100000));
//     return;
//   }
 
//   var args = ["-w", "640", "-h", "480", "-o", "./public/image_stream.jpg", "-t", "999999999", "-tl", "1"];
//   proc = spawn('raspistill', args);
 
//   console.log('Watching for changes...');
 
//   app.set('watchingFile', true);
 
//   fs.watchFile('./public/image_stream.jpg', function(current, previous) {
//     io.emit('liveStream', 'image_stream.jpg?_t=' + (Math.random() * 100000));
//   })
// }

