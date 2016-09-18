var SerialPort = require("serialport");
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var portName = process.argv[2],
portConfig = {
	baudRate: 9600,
	parser: SerialPort.parsers.readline("\n")
};
var sp;
sp = new SerialPort.SerialPort(portName, portConfig);

app.get('/', function(req, res){
  res.sendfile('index.html');
});

app.use(express.static(__dirname + '/static'));

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
  });
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
    sp.write(msg + "\n");
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

var first_xb = [];
var second_xb = [];
var third_xb = [];
var fourth_xb = [];

/* Counter used until they are equal to 5 (since we average every 5 values) */
var acounter = 0;
var bcounter = 0;
var ccounter = 0;
var dcounter = 0;

sp.on("open", function () {
  console.log('open');
  sp.on('data', function(data) {
    console.log('data received: ' + data);

    //Parse it here
    var xb_id = data.split(":")[0];
    var xb_temperature = data.split(":")[1];

    if(xb_id == "1") {
      first_xb.push(parseInt(xb_temperature,10));
      acounter++;
    }
    if(xb_id == "2") {
      second_xb.push(parseInt(xb_temperature,10));
      bcounter++;
    }
    if(xb_id == "3") {
      third_xb.push(parseInt(xb_temperature,10));
      ccounter++;
    }
    if(xb_id == "4") {
      fourth_xb.push(parseInt(xb_temperature,10));
      dcounter++;
    }

    /* If we have at least 5 values: start averaging */
    if(acounter >= 5 && bcounter >=5 /*&& ccounter >=5 && dcounter >=5*/) {
    	
    /*acounter = 0;
    bcounter = 0;
    ccounter = 0;
    dcounter = 0;*/

      var atotal = 0;
      var btotal = 0;
      /*var ctotal = 0;
      var dtotal = 0;*/
        
      for (var i = 0; i < 5; i++) {
        atotal += first_xb[i];
        btotal += second_xb[i];
        /*ctotal += third_xb[i];
        dtotal += fourth_xb[i];*/
      }
      
      first_xb = [];
      acounter = 0;
      second_xb = [];
      bcounter = 0;
      /*third_xb = [];
      fourth_xb = [];*/
        
      var average = ((atotal / 5) + (btotal / 5) /*+ (ctotal / 5) + (dtotal / 5)*/) / 2/*4*/
      

      io.emit("chat message", average.toString() + " C");
    }
  
  });
});

