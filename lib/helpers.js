/*
 * Helpers for letious tasks
 *
 */

// Dependencies
let config = require('./config');
let crypto = require('crypto');//need this to hash passwords
let https = require('https');
let querystring = require('querystring');//need this to stringify urls
// Container for all the helpers
let helpers = {};

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = function(str){
  try{
    let obj = JSON.parse(str);
    return obj;
  } catch(e){
    return {};
  }
};


// Create a SHA256 hash
helpers.hash = function(str){
  if(typeof(str) == 'string' && str.length > 0){
    let hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
};

// Create a string of random alphanumeric characters, of a given length
helpers.createRandomString = function(strLength){
  strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
  if(strLength){
    // Define all the possible characters that could go into a string
    let possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

    // Start the final string
    let str = '';
    for(i = 1; i <= strLength; i++) {
        // Get a random charactert from the possibleCharacters string
        let randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
        // Append this character to the string
        str+=randomCharacter;
    }
    // Return the final string
    return str;
  } else {
    return false;
  }
};



helpers.sendStripeOrder = function( amount,callback){
  // Validate parameters

//const amount = config.stripe.amount;
const currency = config.stripe.currency;
const source = config.stripe.source;
const description = config.stripe.description;
 //totalBill = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;

  if(currency, source, amount, description){

    // Configure the request payload
    const payload = {
    //  totalBill,
      amount,
      currency,
      source,
      'description': 'description: "Sample Charge"',
    };
  const stringPayload = querystring.stringify(payload);


    // Configure the request details
  const requestDetails = {
      'protocol' : 'https:',
      'hostname' : 'api.stripe.com',
      'method' : 'POST',
      'path' : '/api/order',
      'auth' : config.process.env.PIRPLE_STRIPE_TOKEN_SK+':'+config.process.env.PIRPLE_STRIPE_TOKEN_PK ,
      'headers' : {
        "Content-Type" : 'application/x-www-form-urlencoded',//not a JSON content-type API...
        "Content-Length": Buffer.byteLength(stringPayload)//Buffer is available globally....get byte length of stringified payload
      }
    };

    // Instantiate the request object...send off details
    const req = https.request(requestDetails,function(res){
        // Grab the status of the sent request
        const status =  res.statusCode;
        // Callback successfully if the request went through
        if(status == 200 || status == 201){
          callback(false);//calling back false because we're using the error back pattern....there is no error
        } else {
          callback('Status code returned was '+status);
        }
    });

    // Bind to the error event so it doesn't get thrown..ie., dont want any error to kill the thread
    req.on('error',function(e){
      callback(e);
    });

    // Add the payload to the request
    req.write(stringPayload);

    // End the request
    req.end();

  } else {
    callback('Given parameters were missing or invalid');
  }
};



helpers.sendMailGunEmail = function(userEmail,msg,callback){
  // Validate parameters
  userEmail = typeof(userEmail) == 'string' && userEmail.trim().length > 0 ? userEmail.trim() : false;
  msg = typeof(msg) == 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false;
  if(userEmail && msg){

    // Configure the request payload
    var payload = {
      'From' : config.PIRPLE_FAKE_TEST_EMAIL,
      'To' : userEmail,
      'Body' : msg
    };
    var stringPayload = querystring.stringify(payload);


    // Configure the request details
    var requestDetails = {
      'protocol' : 'https:',
      'hostname' : 'api.mailgun.net/v3',
      'method' : 'POST',
      'path' : config.PIRPLE_MAILGUN_SANDBOX_DOMAIN,
      'auth' : config.PIRPLE_MAILGUN_API_KEY,
      'headers' : {
        'Content-Type' : 'application/x-www-form-urlencoded',//not a JSON content-type API
        'Content-Length': Buffer.byteLength(stringPayload)//Buffer is available globally....get byte length of stringified payload
      }
    };

    // Instantiate the request object
    var req = https.request(requestDetails,function(res){
        // Grab the status of the sent request
        var status =  res.statusCode;
        // Callback successfully if the request went through
        if(status == 200 || status == 201){
          //callback(false);//calling back false because we're using the error back pattern....there is no error
          const msg = "Your order has been placed."
          helpers.sendMailGunEmail(userEmail,msg,callback);
        } else {
          //callback('Status code returned was '+status);
          const msg = "Your order has not been placed usccessfully."
          helpers.sendMailGunEmail(userEmail,msg,callback);
        }
    });

    // Bind to the error event so it doesn't get thrown
    req.on('error',function(e){
      callback(e);
    });

    // Add the payload
    req.write(stringPayload);

    // End the request
    req.end();

  } else {
    callback('Given parameters were missing or invalid');
  }
};
// Export the module
module.exports = helpers;
