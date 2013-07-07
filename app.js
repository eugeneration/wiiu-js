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
      if (isController) {
        // notify all the screens this controller needs to be removed
        broadcastToAllScreens('remove-controller', socket.id);
        delete controllers[socket.id];
      }
      else {
        // notify all the controllers this screen needs to be removed
        broadcastToAllControllers('remove-screen', socket.id);
        delete screens[socket.id];
      }
    }
  });
              
  // puts the person in the controllers/screens object
  socket.on('registration', function (data) {
    isController = data;
    if (isController) {
      // add to the list of controllers a new controller
      controllers[socket.id] = socket;
      // send the list of existing screens to the new controller
      var screenIdArray = [];
      for(var id in screens) {
        if (screens.hasOwnProperty(id)) {
          screenIdArray.push(id);
        }
      }
      socket.emit('registered-as-controller', screenIdArray);
      // broadcast to all the existing screens that a new controller arrived
      broadcastToAllScreens('new-controller', socket.id);
    }
    else {
      // add to the list of screens the new screen
      screens[socket.id] = socket;
      // send the list of existing controllers to the new screen
      var controllerIdArray = [];
      for(var id in controllers) {
        if (controllers.hasOwnProperty(id)) {
          controllerIdArray.push(id);
        }
      }
      socket.emit('registered-as-screen', controllerIdArray);
      // broadcast to all the existing controllers that a new screen arrived
      broadcastToAllControllers('new-screen', socket.id);
    }
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
    for(var id in controllers) {
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
    
    broadcastToAllScreens('orientation', {
                          "id" : socket.id,
                          "gyroY" : gyroY
                          });
  });
              
  /************************************************************************
   *
   * SIGNALS SENT BY SCREEN - RED
   *
   ************************************************************************/
});
