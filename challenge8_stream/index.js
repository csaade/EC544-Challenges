var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var path = require('path');
 
var spawn = require('child_process').spawn;
var proc;
 
app.use('/', express.static(path.join(__dirname, 'stream')));
 
 
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});
 
var sockets = {};
 
io.on('connection', function(socket) {
 
  sockets[socket.id] = socket;
  console.log("Total clients connected : ", Object.keys(sockets).length);
 
  socket.on('disconnect', function() {
    delete sockets[socket.id];
 
    // no more sockets, kill the stream
    if (Object.keys(sockets).length == 0) {
      app.set('watchingFile', false);
      if (proc) proc.kill();
      fs.unwatchFile('./stream/image_stream.jpg');
    }
  });
 
  socket.on('start-stream', function() {
    startStreaming(io);
  });

  socket.on('continue-stream', function() {
    continueStream(io);
  });
 
});
 
http.listen(3000, function() {
  console.log('listening on *:3000');
});
 
function stopStreaming() {
  if (Object.keys(sockets).length == 0) {
    app.set('watchingFile', false);
    if (proc) proc.kill();
    fs.unwatchFile('./stream/image_stream.jpg');
  }
}
 
function startStreaming(io) {
 
  if (app.get('watchingFile')) {
    io.sockets.emit('liveStream', 'image_stream.jpg?_t=' + (Math.random() * 100000));
    return;
  }
 
  //var args = ["-w", "640", "-h", "480", "-o", "./stream/image_stream.jpg", "-t", "999999999", "-tl", "100"];
  //proc = spawn('raspistill', args);

  var args = ["-r", "640x480", "./stream/image_stream.jpg"];
  proc = spawn('fswebcam', args);

  console.log('Watching for changes...');
 
  app.set('watchingFile', true);
}

// gets called whenever the specified file changed?
fs.watchFile('./stream/image_stream.jpg', function(current, previous) {
  console.log('CHANGE!!!!');
  io.sockets.emit('liveStream', 'image_stream.jpg?_t=' + (Math.random() * 100000));
})

function continueStream(io) {

  // this is how we take a picture with a raspbi (much better)
  //var args = ["-w", "640", "-h", "480", "-o", "./stream/image_stream.jpg", "-t", "999999999", "-tl", "100"];
  //proc = spawn('raspistill', args);

  console.log('Continue streaming...');

  var args = ["-r", "640x480", "./stream/image_stream.jpg"]; // takes a picture
  proc = spawn('fswebcam', args);
  io.sockets.emit('liveStream', 'image_stream.jpg?_t=' + (Math.random() * 100000));
 
  //app.set('watchingFile', true);
 
  //fs.watchFile('./stream/image_stream.jpg', function(current, previous) {
  //  io.sockets.emit('liveStream', './stream/image_stream.jpg?_t=');
  //})

}