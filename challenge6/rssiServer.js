var SerialPort = require("serialport");
var app = require('express')();
var xbee_api = require('xbee-api');
var fs = require('fs');
var http = require('http').Server(app);
var express = require('express');
var io = require('socket.io')(http);
var ml = require('machine_learning');

var RSSI_values = [];
var beacon1 = [], beacon2 = [], beacon3 = [],beacon4 = [];
var pollCount = 0; //for continuing the polling system
//buffers for averaging in order to make data less jumpy

/****** TCP/IP SERVER TO MATLAB *****/
// var net = require('net');
// net.createServer(connectListener).listen(8080);
/***** SERVER ENDS HERE ******/


/*** SERVER CONNECTION LISTENER *****/
// function connectListener(socket) {
//   socket.name = socket.remoteAddress+ ":" + socket.remotePort;

//   //socket.write("shutup dude \n"); // this is how we write data to it 
//   //(eventually, we will be writing an array of RSS values)
//   if(RSSI_values.length == 4) {
//     var value_to_send = "[";
//     for(index in RSSI_values) {
//       value_to_send = value_to_send.concat(RSSI_values[index]);
//       console.log(index);
//       if(index != RSSI_values.length-1)
//         value_to_send = value_to_send.concat(",");
//     }

//     value_to_send = value_to_send.concat("]");
//     console.log('sending to matlab: ' + value_to_send);

//     socket.write(value_to_send);
  
//     RSSI_values = [];
//     //Transmit all requests
//     for(address in xbeeAddress)
//         requestRSSI(xbeeAddress[address]);
//   }
//   // adding 'data' event handler on socket
//   socket.on('data', function(data) {
//     console.log("Matlab sent: " + data.toString());
//     io.emit('bin_number', data.toString());
//   });

//   // closing connection
//   socket.on('close', function(data) {
//     console.log("closed " + data.toString());
//   });

// }

var request_counter = 0;

// Read output.csv into a 2d array
var knn = null;
var train_data = [];
var bins = [];

var C = xbee_api.constants;
var XBeeAPI = new xbee_api.XBeeAPI({
  api_mode: 2
});

var portName = process.argv[2];


var sampleDelay = 3000;
var xbeeAddress = ["0013A20040ACFF00", "0013A20040A1A0C3", "0013A20040ACFF79", "0013A20040A1A12B"];
var stream;

portConfig = {
  baudRate: 9600,
  parser: XBeeAPI.rawParser()
};

var sp;
sp = new SerialPort.SerialPort(portName, portConfig);

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
    for(address in xbeeAddress) {
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
    
/* gets called whenever we connect to the server which is the serial port(only once) */
sp.on("open", function () {
  console.log('open');
  stream = fs.createWriteStream("./out.csv");

  // generating the headers for csv

  // for(i=0; i<4; i++) {
  //   stream.write("beacon"+(i+1).toString());
  //   if(i != 3)
  //     stream.write(",");
  // }
  // stream.write("\n");

  // send requests to all xbees
  // requestAllRSSI();

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
      // console.log(frame.data[1].toString() + " " + frame.data[0].toString());
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
                                
          console.log(RSSI_values.toString() + ' bin: ' + bin);
          bin = parseInt(bin);
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
http.listen(3000, function(){
    console.log('listening on *:3000');
});
