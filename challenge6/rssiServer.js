var SerialPort = require("serialport");
var app = require('express')();
var xbee_api = require('xbee-api');
var csvWriter = require('csv-write-stream')

var C = xbee_api.constants;
var XBeeAPI = new xbee_api.XBeeAPI({
  api_mode: 2
});

var portName = process.argv[2];

var writer = csvWriter();

var sampleDelay = 3000;

var countFrames = 0;
var xbeeAddress = ["0013A20040A1A0C3", "0013A20040A1A12B", "0013A20040C8493D", "0013A20040A1A147"];\
var line = [];



//Note that with the XBeeAPI parser, the serialport's "data" event will not fire when messages are received!
portConfig = {
  baudRate: 9600,
  parser: XBeeAPI.rawParser()
};

var sp;
sp = new SerialPort.SerialPort(portName, portConfig);

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


sp.on("open", function () {
  console.log('open');
    //Transmit all requests
  for address in xbeeAddress
    requestRSSI(xbeeAddress[address]);
});


XBeeAPI.on("frame_object", function(frame) {
  console.log(frame);
  console.log();

  if (frame.type == 144){
    line.push("Beacon ID: " + frame.data[1] + ", RSSI: " + (frame.data[0]));
    countFrames++;
  }

  if ( countFrames == 4){
    countFrames = 0;

  for lines in line
    console.log(line[lines]);

  //Transmit all requests
    for address in xbeeAddress
      requestRSSI(xbeeAddress[address]);

  //Clear all RSSI data in memory
  line = [];
  
  }

});
