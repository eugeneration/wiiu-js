var socket = io.connect('http://localhost');

$(function() {
  // attempt to prevent screen rotation
  // window.screen.lockOrientation('portrait');
  
  socket.on('news', function (data) {
    console.log(data);
    socket.emit('my other event', { my: 'data' });
  });
  
  var accelX, 
      accelY, 
      accelZ, 
      gyroX,
      gyroY,
      gyroZ;

  gyro.frequency = 20;
  gyro.startTracking(function(o) {
    accelX = o.x; 
    accelY = o.y;
    accelZ = o.z;
    gyroX  = o.alpha;
    gyroY  = o.beta;
    gyroZ  = o.gamma;

    $("#accel-data-x").text(accelX);
    $("#accel-data-y").text(accelY);
    $("#accel-data-z").text(accelZ);
    $("#gyro-data-x").text(gyroX);
    $("#gyro-data-y").text(gyroY);
    $("#gyro-data-z").text(gyroZ);
    // o.x, o.y, o.z for accelerometer
    // o.alpha, o.beta, o.gamma for gyro

    // start sending messages
    socket.emit('accel-data', {'gyroX': gyroX, 'gyroY': gyroY, 'gyroZ': gyroZ});
  });

  $("body").css('background-color', 'blue');
  // the client noticed the phone was tilted up
  socket.on('orientation-up', function(data) {
    $("body").css('background-color', 'red');
  });
});
