var SerialPort = require("serialport");
var app = require('express')();
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
var counter = 0;

sp.on("open", function () {
  console.log('open');
  sp.on('data', function(data) {
    console.log('data received: ' + data);

    //Parse it here
    var xb_id = data.split(":")[0];
    var xb_temperature = data.split(":")[1];

    if(xb_id == "1") {
      first_xb.push(parseInt(xb_temperature,10));
      counter++;
    }

    if(counter == 5) {
      var total = 0;
      for (var i = 0; i < xb_temperature.length; i++) {
        total += xb_temperature[i];
      }
      var average = total/xb_temperature.length;
      io.emit("chat message", xb_id + " has an average of: " + average.toString() + " C");
      counter = 0;
    }
  
  });
});

