const fs = require('fs');
const {logger} = require('./logger.js')
const mqtt = require('./mqtt.js')
const http = require('http');
const { stringify } = require('querystring');
const config = JSON.parse(fs.readFileSync(__dirname+'/config.json'))
var Wemo = require('wemo-client');

var wemo = new Wemo();

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function date_time(){
  let dt = new Date()
  //dt.setHours( dt.getHours() + 1 );//timezone +1, toISOString has a shuffled format
  let date = (dt).toISOString()
  return date.replace('T',' ').replace('Z','').replace(':','.').replace(':','.')
}
//------------------ main ------------------
logger.info('camera lapse service just started')
logger.info('test info')
logger.verbose('test verbose')
logger.debug('test debug')
logger.silly('test silly')
mqtt.start()

mqtt.Emitter.on('mqtt',(data)=>{
  if(data.topic == "Agent/cpu"){
    let cpu_value = parseFloat(data.msg.toString().replace("%",""))
    logger.verbose(`cpu ${cpu_value} at ${date_time()}`)
  }
  else if(data.topic == "Agent/cameras/camera garage/motion"){
    let motion = (data.msg.toString() === "true")
    logger.verbose(`motion ${motion} at ${date_time()}`)
  }
  else{
    console.log(data.topic)
  }
})

function test_wemo(){
  logger.info("wemo startup")
  wemo.discover(function(err, deviceInfo) {
    logger.info('Wemo Device Found: %j', deviceInfo);
   
    // Get the client for the found device
    var client = wemo.client(deviceInfo);
   
    // You definitely want to listen to error events (e.g. device went offline),
    // Node will throw them as an exception if they are left unhandled  
    client.on('error', function(err) {
      logger.error('Error: %s', err.code);
    });
   
    // Handle BinaryState events
    client.on('binaryState', function(value) {
      logger.info('Binary State changed to: %s', value);
    });
   
    // Turn the switch on
    logger.info('Turning on');
    client.setBinaryState(1);
  });  
}

test_wemo()
