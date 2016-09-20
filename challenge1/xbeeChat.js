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

var temperatures = [];
var idUtilization = [];
var counter = 0;

sp.on("open", function () {
  console.log('open');
  sp.on('data', function(data) {
    //console.log('data received: ' + data);
    counter++;
    if(!(counter % 10)) {
      console.log("REFRESH");
      for(key in idUtilization)
        idUtilization[key] = 0;
    }

    for(key in idUtilization)
      console.log("Xbee ID: " + key + " Temp: " + temperatures[key]);

    if(!(counter %30)) {
      for(key in idUtilization) {
        if(idUtilization[key] == 0) {
          delete idUtilization[key];
          delete temperatures[key];
        }
      }
    }
    //Parse it here
    var xb_id = data.split(":")[0];
    var xb_temperature = data.split(":")[1];

    temperatures[xb_id] = parseInt(xb_temperature);
    if(xb_id in idUtilization)
      idUtilization[xb_id]++;
    else
      idUtilization[xb_id] = 1;

    

    var total = 0;
    var length = 0;
    for (var key in temperatures) {
      total += temperatures[key];
      length++;
    };

    var average = parseInt(total/length);
    //console.log("numDevices: " + Object.keys(temperatures).length);
    io.emit("chat message", average.toString()+ " C");
  
  });
});
