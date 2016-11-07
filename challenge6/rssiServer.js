var SerialPort = require("serialport");
var app = require('express')();
var xbee_api = require('xbee-api');
var fs = require('fs');


var C = xbee_api.constants;
var XBeeAPI = new xbee_api.XBeeAPI({
  api_mode: 2
});

var portName = process.argv[2];


var sampleDelay = 3000;

var countFrames = 0;
var xbeeAddress = [/*"0013A20040A1A0C3",*/ "0013A20040A1A12B", "0013A20040C8493D", "0013A20040A1A147"];
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

/* gets called whenever we connect to the server (only once) */
sp.on("open", function () {
  console.log('open');
  stream = fs.createWriteStream("./out.csv");

  // generating the headers for csv

  for(i=0; i<2; i++) {
    stream.write("beacon"+(i+1).toString());
    if(i != 1)
      stream.write(",");
  }
  stream.write("\n");

  // send requests to all xbees
  for(address in xbeeAddress)
    requestRSSI(xbeeAddress[address]);
});

/* Gets called whenever we receive data from xbee */
XBeeAPI.on("frame_object", function(frame) {

  if (frame.type == 144){
    stream.write(frame.data[0].toString());
    countFrames++;

    // if we read from all xbees
    if (countFrames == 2){
      countFrames = 0;
      stream.write("\n");
      //Transmit all requests
      for(address in xbeeAddress)
        requestRSSI(xbeeAddress[address]);
  
    }
    // if we are still expecting data from xbees
    else {
      stream.write(",");
    }
  }

});
