var awsIot = require('aws-iot-device-sdk');

var myThingName = 'RpiButton';

var thingShadows = awsIot.thingShadow({
   keyPath: '/root/privkey.pem',
  certPath: '/root/cert.pem',
    caPath: '/root/aws-iot-rootCA.crt',
  clientId: myThingName,
    region: 'us-east-1'
});

mythingstate = {
  "state": {
    "reported": {
      "ip": "unknown"
    }
  }
}

var networkInterfaces = require( 'os' ).networkInterfaces( );
mythingstate["state"]["reported"]["ip"] = networkInterfaces['wlan0'][0]['address'];

var Gpio = require('onoff').Gpio,
button = new Gpio(7, 'in', 'both');

thingShadows.on('connect', function() {
  console.log("Connected...");
  console.log("Registering...");
  thingShadows.register( myThingName );

  // An update right away causes a timeout error, so we wait about 2 seconds
  setTimeout( function() {
    console.log("Updating my IP address...");
    clientTokenIP = thingShadows.update(myThingName, mythingstate);
    console.log("Update:" + clientTokenIP);
  }, 2500 );


  // Code below just logs messages for info/debugging
  thingShadows.on('status',
    function(thingName, stat, clientToken, stateObject) {
       console.log('received '+stat+' on '+thingName+': '+
                   JSON.stringify(stateObject));
    });

  thingShadows.on('update',
      function(thingName, stateObject) {
         console.log('received update '+' on '+thingName+': '+
                     JSON.stringify(stateObject));
      });

  thingShadows.on('timeout',
      function(thingName, clientToken) {
         console.log('received timeout for '+ clientToken)
      });

  thingShadows
    .on('close', function() {
      console.log('close');
    });
  thingShadows
    .on('reconnect', function() {
      console.log('reconnect');
    });
  thingShadows
    .on('offline', function() {
      console.log('offline');
    });
  thingShadows
    .on('error', function(error) {
      console.log('error', error);
    });

  //Watch for button change
  button.watch(function(err, value) {
   console.log("Button Changed " + String(value))
   delete mythingstate['version']; //Cleanup to post to AWS
   mythingstate["state"]["reported"]["button"] = value
   buttonStateResponse = thingShadows.update(myThingName, mythingstate);
   console.log("Update:" + buttonStateResponse);
  });


});
