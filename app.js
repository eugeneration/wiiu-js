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




var clients = {},
    controllers = {},
    screens = {};
var isController = null;

io.sockets.on('connection', function (socket) {
              
  // On connection
  var hs = socket.handshake;
  clients[socket.id] = socket;
  
  socket.on('disconnect', function () {
    delete clients[socket.id]; // remove the client from the array
    if (isController !== null) {
      if (isController) { delete controllers[socket.id]; }
      else              { delete screens[socket.id];     }
    }
  });
              
  // puts the person in the controllers/screens object
  socket.on('registration', function (data) {
    isController = data;
    if (isController) { controllers[socket.id] = socket; }
    else              { screens[socket.id] = socket;     }
    console.log("This device is a controller? " + data);
  });
              
  /************************************************************************
   *
   * HELPERS
   *
   ************************************************************************/
  function broadcastToAllScreens (messageTitle, data) {
    for(var id in screens) {
      if (screens.hasOwnProperty(id)) {
        screens[id].emit(messageTitle, data);
      }
    }
  }
  function broadcastToAllControllers (messageTitle, data) {
    for(var id in controlllers) {
      if (controllers.hasOwnProperty(id)) {
        controllers[id].emit(messageTitle, data);
      }
    }
  }
  /************************************************************************
   *
   * SIGNALS SENT BY CONTROLLER - BLUE
   *
   ************************************************************************/
  // signal sent VERY FREQUENTLY for accelerometer data
  socket.on('accel-data', function(data) {
    var gyroX = data.gyroX;
    var gyroY = data.gyroY;
    var gyroZ = data.gyroZ;
    
    broadcastToAllScreens('orientation', gyroY);
  });
              
  /************************************************************************
   *
   * SIGNALS SENT BY SCREEN - RED
   *
   ************************************************************************/
});
