var express = require('express');
var app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);
var _ = require('underscore')._,
    backbone = require('backbone');

server.listen(process.env.PORT || 3000);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/public/index.html');
});

// configuring middleware
app.configure(function() {
  // The number of milliseconds in one day
  var oneDay = 86400000;

  // Use compress middleware to gzip content
  app.use(express.compress());

  // Serve up content from public directory
  app.use(express.static(__dirname + "/public", { maxAge:oneDay }));
});

// the connection stuff
var clients = {};

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('registration', function (data) {
    console.log(data);
  });
});
