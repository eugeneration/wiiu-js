var socket = io.connect();

$(function() {
  // make the send a random signal button do something
  $('#send-random-signal').click(function () { 
    accelX = 0; 
    accelY = 0;
    accelZ = 0;
    gyroX  = 0;
    gyroY  = Math.floor(Math.random() * 180) - 90;
    gyroZ  = 0;

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
  
  // this is the main loop
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
  
  function shadeColor(color, percent) {   
    var num = parseInt(color.slice(1),16), amt = Math.round(2.55 * percent), R = (num >> 16) + amt, B = (num >> 8 & 0x00FF) + amt, G = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (B<255?B<1?0:B:255)*0x100 + (G<255?G<1?0:G:255)).toString(16).slice(1);
  }

  // steady stream of orientation data
  socket.on('orientation', function(data) {
    $('body').css('background-color', shadeColor("888888", data));
  });

  // the client noticed the phone was tilted up
  socket.on('orientation-up', function(data) {
    $("body").css('background-color', 'red');
  });
  // the orientation is normal
  socket.on('orientation-default', function(data) {
    // keep making the background blue
    $("body").css('background-color', 'blue');
  });
});
