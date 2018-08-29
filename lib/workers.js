/*
 * Worker-related tasks
 *
 */

 // Dependencies
const path = require('path');
const fs = require('fs');
const _data = require('./data');
const https = require('https');//use https vs http depending on nature of 'check'
const http = require('http');
const helpers = require('./helpers');
const url = require('url');
const util = require('util');
const debug = util.debuglog('workers');//use this instead of manually logging out to debug + give it the name `workers` that will
//be used as a startup argument in debug
//
// Instantiate the worker module object
const workers = {};

// Lookup all checks, get their data, send to validator
workers.gatherAllChecks = function(){
  // Get all the checks
  _data.list('checks',function(err,checks){
    if(!err && checks && checks.length > 0){
      checks.forEach(function(check){//get check data w/out '.json' extension....has already been stripped out
        // Read in the check data
        _data.read('checks',check,function(err,originalCheckData){
          if(!err && originalCheckData){//originalCheckData = 'state' of check before performing the check...ie., the original check
            // Pass it to the check validator, and let that function continue the function or log the error(s) as needed
            workers.validateCheckData(originalCheckData);
          } else {
            debug("Error reading one of the check's data: ",err);
          }
        });
      });
    } else {
      debug('Error: Could not find any checks to process');
    }
  });


};

// Sanity-check the check-data,
workers.validateCheckData = function(originalCheckData){
  originalCheckData = typeof(originalCheckData) == 'object' && originalCheckData !== null ? originalCheckData : {};//make sure that originalCheckData Object exists
  originalCheckData.id = typeof(originalCheckData.id) == 'string' && originalCheckData.id.trim().length == 20 ? originalCheckData.id.trim() : false;
  originalCheckData.useremail = typeof(originalCheckData.useremail) == 'string' && originalCheckData.useremail.trim().length > 0 ? originalCheckData.useremail.trim() : false;
  originalCheckData.protocol = typeof(originalCheckData.protocol) == 'string' && ['http','https'].indexOf(originalCheckData.protocol) > -1 ? originalCheckData.protocol : false;
  originalCheckData.url = typeof(originalCheckData.url) == 'string' && originalCheckData.url.trim().length > 0 ? originalCheckData.url.trim() : false;
  originalCheckData.method = typeof(originalCheckData.method) == 'string' &&  ['post','get','put','delete'].indexOf(originalCheckData.method) > -1 ? originalCheckData.method : false;
  originalCheckData.successCodes = typeof(originalCheckData.successCodes) == 'object' && originalCheckData.successCodes instanceof Array && originalCheckData.successCodes.length > 0 ? originalCheckData.successCodes : false;
  originalCheckData.timeoutSeconds = typeof(originalCheckData.timeoutSeconds) == 'number' && originalCheckData.timeoutSeconds % 1 === 0 && originalCheckData.timeoutSeconds >= 1 && originalCheckData.timeoutSeconds <= 5 ? originalCheckData.timeoutSeconds : false;

  // Set the keys that may not be set (if the workers have never seen this check before)
  originalCheckData.state = typeof(originalCheckData.state) == 'string' && ['up','down'].indexOf(originalCheckData.state) > -1 ? originalCheckData.state : 'down';//check to see if check is up or down..if a check has never been performed, assume that it is down
  originalCheckData.lastChecked = typeof(originalCheckData.lastChecked) == 'number' && originalCheckData.lastChecked > 0 ? originalCheckData.lastChecked : false;//last time check was performed

  // If all checks pass, pass the data along to the next step in the process
  if(originalCheckData.id &&
  originalCheckData.useremail &&
  originalCheckData.protocol &&
  originalCheckData.url &&
  originalCheckData.method &&
  originalCheckData.successCodes &&
  originalCheckData.timeoutSeconds){
    workers.performCheck(originalCheckData);
  } else {
    // If checks fail, log the error and fail silently
    debug("Error: one of the checks is not properly formatted. Skipping.");
  }
};

// Perform the check, send the originalCheck data and the outcome of the check process to the next step in the process
workers.performCheck = function(originalCheckData){

  // Prepare the intial check outcome
  const checkOutcome = {
    'error' : false,
    'responseCode' : false//response code has not been set yet
  };

  // Mark that the outcome has not been sent yet
  let outcomeSent = false;

  // Parse the hostname and path out of the originalCheckData
  const parsedUrl = url.parse(originalCheckData.protocol+'://'+originalCheckData.url, true);
  const hostName = parsedUrl.hostname;
  const path = parsedUrl.path; // Using path not pathname because we want the query string

  // letruct the request
  const requestDetails = {
    'protocol' : originalCheckData.protocol+':',
    'hostname' : hostName,
    'method' : originalCheckData.method.toUpperCase(),
    'path' : path,
    'timeout' : originalCheckData.timeoutSeconds * 1000 // 1000 ms
  };

  // Instantiate the request object (using either the http or https module)
  const _moduleToUse = originalCheckData.protocol == 'http' ? http : https;
  const req = _moduleToUse.request(requestDetails,function(res){
      // Grab the status of the sent request
      const status =  res.statusCode;

      // Update the checkOutcome and pass the data along
      checkOutcome.responseCode = status;
      if(!outcomeSent){
        workers.processCheckOutcome(originalCheckData,checkOutcome);
        outcomeSent = true;
      }
  });

  // Bind to the error event so it doesn't get thrown
  req.on('error',function(e){
    // Update the checkOutcome and pass the data along
    checkOutcome.error = {'error' : true, 'value' : e};
    if(!outcomeSent){
      workers.processCheckOutcome(originalCheckData,checkOutcome);
      outcomeSent = true;
    }
  });

  // Bind to the timeout event
  req.on('timeout',function(){//throw error if there is a timeout
    // Update the checkOutcome and pass the data along
    checkOutcome.error = {'error' : true, 'value' : 'timeout'};
    if(!outcomeSent){
      workers.processCheckOutcome(originalCheckData,checkOutcome);
      outcomeSent = true;
    }
  });

  // End the request
  req.end();
};

// Process the check outcome, update the check data as needed, trigger an alert if needed
// Special logic for accomodating a check that has never been tested before (don't alert on that one)
workers.processCheckOutcome = function(originalCheckData,checkOutcome){

  // Decide if the check is considered up or down
  const state = !checkOutcome.error && checkOutcome.responseCode && originalCheckData.successCodes.indexOf(checkOutcome.responseCode) > -1 ? 'up' : 'down';

  // Decide if an alert is warranted 51:48
  const alertWarranted = originalCheckData.lastChecked && originalCheckData.state !== state ? true : false;

  // Update the check data
  const newCheckData = originalCheckData;
  newCheckData.state = state;
  newCheckData.lastChecked = Date.now();

  // Save the updates
  _data.update('checks',newCheckData.id,newCheckData,function(err){
    if(!err){
      // Send the new check data to the next phase in the process if needed
      if(alertWarranted){
        workers.alertUserToStatusChange(newCheckData);
      } else {
        debug("Check outcome has not changed, no alert needed");
      }
    } else {
      debug("Error trying to save updates to one of the checks");
    }
  });
};

// Alert the user as to a change in their check status
workers.alertUserToStatusChange = function(newCheckData){
  const msg = 'Alert: Your check for '+newCheckData.method.toUpperCase()+' '+newCheckData.protocol+'://'+newCheckData.url+' is currently '+newCheckData.state;
  helpers.sendTwilioSms(newCheckData.useremail,msg,function(err){
    if(!err){
      debug("Success: User was alerted to a status change in their check, via sms: ",msg);
    } else {
      debug("Error: Could not send sms alert to user who had a state change in their check",err);
    }
  });
};

// Timer to execute the worker-process once per minute
workers.loop = function(){
  setInterval(function(){
    workers.gatherAllChecks();
  },1000 * 60);
};



// Alert the user as to a change in their order status
workers.alertUserToStatusChange = function(newOrderData){
  var msg = 'Alert: Your check for '+newOrderData.method.toUpperCase()+' '+newOrderData.protocol+'://'+newOrderData.url+' is currently '+newOrderData.state;
  helpers.sendStripeOrder(newOrderData.userPhone,msg,function(err){
    if(!err){
      console.log("Success: User was alerted to a status change in their order, via sms: ",msg);
    } else {
      console.log("Error: Could not send alert to user who had a state change in their order",err);
    }
  });
};

// Init script
workers.init = function(){
  // Send to console, in yellow
  console.log('\x1b[33m%s\x1b[0m','Background workers are running');

  // Execute all the checks immediately
  workers.gatherAllChecks();

  // Call the loop so the checks will execute later on
  workers.loop();//will continue to execute on their own...loop will be set with setInterval
};


 // Export the module
 module.exports = workers;
