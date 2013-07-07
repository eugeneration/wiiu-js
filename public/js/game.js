var socket = io.connect();
console.log("v1.0");

$(function() {
  
  /************************************************************************
   *
   * HELPERS
   *
   ************************************************************************/
  
  // shades a color (given as a hex string) from -100 (black) to 100 (white)
  function shadeColor(color, percent) {
  var num = parseInt(color.slice(1),16), amt = Math.round(2.55 * percent), R = (num >> 16) + amt, B = (num >> 8 & 0x00FF) + amt, G = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (B<255?B<1?0:B:255)*0x100 + (G<255?G<1?0:G:255)).toString(16).slice(1);
  }
  
  /************************************************************************
   *
   * EVERYBODY
   *
   ************************************************************************/

  // if true, this device has gyros and accelerometers usable by HTML5
  var isController = gyro.hasFeature('devicemotion');
//  isController=true;
  socket.emit('registration', isController);
  
  /************************************************************************
   *
   * CONTROLLER - BLUE
   *
   ************************************************************************/
  if (isController) {
    $("body").css('background-color', 'rgb(211, 255, 255)');
  
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
  
  
  //////////////////////////////////////////////////////////
  // screen data maintainance
  
    var screenCount = 0;
  
    function addScreen(id) {
      screenCount++;
      $("#screen-number").text("There are " + screenCount + " screens.");
    }
    function removeScreen(id) {
      screenCount--;
      $("#screen-number").text("There are " + screenCount + " screens.");
    }
    // whenever a screen registers, get it's id
    socket.on('new-screen', function(screenId) {
      addScreen(screenId);
    });
    // whenever a screen registers, get it's id
    socket.on('remove-screen', function(screenId) {
      removeScreen(screenId);
    });
    // on successful register, get starting data
    socket.on('registration-successful', function(screenIds) {
      for (var i = 0; i < screenIds.length; i++) {
        addScreen(screenIds[i]);
      }
    });
  }
  
  /************************************************************************
   *
   * SCREEN - RED
   *
   ************************************************************************/
  
  else {
  
    $("body").css('background-color', 'rgb(255, 211, 211)');
  
    // make the send a random signal button do something
    $('#send-random-signal').click(function () {
      accelX = 0;
      accelY = 0;
      accelZ = 0;
      gyroX  = 0;
      gyroY  = Math.floor(Math.random() * 180) - 90;
      gyroZ  = 0;
  //    this stuff won't exist for screens in a short while
  //    $("#accel-data-x").text(accelX);
  //    $("#accel-data-y").text(accelY);
  //    $("#accel-data-z").text(accelZ);
  //    $("#gyro-data-x").text(gyroX);
  //    $("#gyro-data-y").text(gyroY);
  //    $("#gyro-data-z").text(gyroZ);

      // start sending messages
      socket.emit('accel-data', {'gyroX': gyroX, 'gyroY': gyroY, 'gyroZ': gyroZ});
    });
    
    // steady stream of orientation data
    socket.on('orientation', function(data) {
      $('body').css('background-color', shadeColor("888888", data));
    });
  
  
  
    //////////////////////////////////////////////////////////
    // controller data maintainance
  
    var controllerCount = 0;
  
    $("#controllers").find("li").click(function() {
      $(this).animate({
        opacity     : 0
      }, 500).animate({
        width       : 0,
        margin      : 0,
        borderWidth	: 0
      }, 500, function() {
        $(this).remove();
      });
    })
  
    function addControllerDom(id) {
      $("<li class=\""+ id + "\">C</li>").appendTo("#controllers")
      .animate({ opacity     : 100 }, 500)
      .animate({ width       : 200,
                 margin      : 50,
                 borderWidth	: 0 }, 500,
      function() {
        // stuff that happens after the animate
      });
    }
    function removeControllerDom(id) {
      $("#controllers ." + id)
        .animate({ opacity     : 0 }, 500)
        .animate({ width       : 0,
                  margin      : 0,
                  borderWidth	: 0 }, 500,
        function() {
          // stuff that hapens after the animate
          $(this).remove();
        });
    }
  
    function addController(id) {
      controllerCount++;
      addControllerDom();
    }
    function removeController(id) {
      controllerCount--;
      removeControllerDom();
    }
  
    // whenever a screen registers, get it's id
    socket.on('new-controller', function(controllerId) {
      console.log("A wild screen has appeared!");
      addController(controllerId);
    });
    // whenever a screen disconnects, remove it
    socket.on('remove-controller', function(controllerId) {
      console.log("A screen has run away!");
      removeController(controllerId);
    });
    // on successful register, get starting data
    socket.on('registration-successful', function(controllerIds) {
      for (var i = 0; i < controllerIds.length; i++) {
        addScreen(controllerIds[i]);
      }
      console.log("There are " + controllerIds.length + " controllers.");
    });
  }
});
