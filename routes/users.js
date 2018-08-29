/*
 * Request Handlers
 *
 */

// Dependencies
const _data = require('../lib/data');
const helpers = require('../lib/helpers');
const config = require("../lib/config");
const path  = require("path");
const fs = require("fs");
const tokenHandlers = require("./tokens");
// Define all the userHandlers
const userHandlers = {};



// Not-Found
userHandlers.notFound = function(data,callback){
  callback(404);
};

// Users
userHandlers.users = function(data,callback){
  const acceptableMethods = ['post','get','put','delete'];
  if(acceptableMethods.indexOf(data.method) > -1){//if date method exists within the macceptabethods array
    userHandlers._users[data.method](data,callback);
  } else {
    callback(405);
  }
};

// Container for all the users methods
userHandlers._users  = {};

// Users - post
// Required data: firstName, lastName, email, password, tosAgreement
// Optional data: none
userHandlers._users.post = function(data,callback){
  // Check that all required fields are filled out
  const firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  const lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  const tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;//have to agree to terms of service
  const email = typeof(data.payload.email) == 'string' && data.payload.email.length > 0 ? data.payload.email.trim() : false;
  const address = typeof(data.payload.address) == 'string' && data.payload.address.length > 0 ? data.payload.address.trim() : false;

  if(firstName && lastName && password && tosAgreement && email && address){
    // Make sure the user doesnt already exist
    _data.read('users',email,function(err,data){
      if(err){
        // Hash the password
        const hashedPassword = helpers.hash(password);

        // Create the user object
        if(hashedPassword){
          const userObject = {
            'firstName' : firstName,
            'lastName' : lastName,
            'hashedPassword' : hashedPassword,
            'tosAgreement' : true,
            'email': email,
            'address': address
          };

          // Store the user
          _data.create('users',email,userObject,function(err){
            if(!err){
              callback(200);
            } else {
              console.log(err);
              callback(500,{'Error' : 'Could not create the new user'});
            }
          });
        } else {
          callback(500,{'Error' : 'Could not hash the user\'s password.'});
        }

      } else {
        // User alread exists
        callback(400,{'Error' : 'A user with that email already exists'});
      }
    });

  } else {
    callback(400,{'Error' : 'Missing required fields'});
  }

};
// Required data: email
// Optional data: none
userHandlers._users.get = function(data,callback){
   // Check that the email address is valid
    console.log(data.queryStringObject.email.trim().length);
  const email = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 ? data.queryStringObject.email.trim() : false;
  if(email){

    // Get token from headers
    const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
    // Verify that the given token is valid for the email address
    tokenHandlers._tokens.verifyToken(token,email,function(tokenIsValid){
      if(tokenIsValid){
        // Lookup the user
        _data.read('users',email,function(err,data){
          if(!err && data){
            // Remove the hashed password from the user user object before returning it to the requester
            delete data.hashedPassword;
            callback(200,data);
          } else {
            callback(404);
          }
        });
      } else {
        callback(403,{"Error" : "Missing required token in header, or token is invalid."})
      }
    });
  } else {
    callback(400,{'Error' : 'Missing required field'})
  }
};

// Required data: email
// Optional data: firstName, lastName, password (at least one must be specified)
// @TODO Only let an authenticated user up their object. Dont let them access update elses.
userHandlers._users.put = function(data,callback){
  // Check for required field
  const email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;

  // Check for optional fields ...'trim' to make sure that trimmed strings without white space are also greater than 0 + if has trimmed version use that or = false
  const firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  const lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  const address = typeof(data.payload.address) == 'string' && data.payload.address.trim().length > 0 ? data.payload.address.trim() : false;

  // Error if email is invalid
  if(email){
    // Error if nothing is sent to update
    if(firstName || lastName || password || address){

      // Get token from headers
    const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
      // Verify that the given token is valid for the email address
    tokenHandlers._tokens.verifyToken(token,email,function(tokenIsValid){
      if(tokenIsValid){
      // Lookup the user
      _data.read('users',email,function(err,userData){
        if(!err && userData){
          // Update the fields if necessary
          if(firstName){
            userData.firstName = firstName;
          }
          if(lastName){
            userData.lastName = lastName;
          }
          if(password){
            userData.hashedPassword = helpers.hash(password);
          }
          if(address){
            userData.address = address;
          }
              // Store the new updates
              _data.update('users',email,userData,function(err){
                if(!err){
                  callback(200);
                } else {
                  callback(500,{'Error' : 'Could not update the user.'});
                }
              });
            } else {
              callback(400,{'Error' : 'Specified user does not exist.'});
            }
          });
        } else {
          callback(403,{"Error" : "Missing required token in header, or token is invalid."});
        }
      });
    } else {
      callback(400,{'Error' : 'Missing fields to update.'});
    }
  } else {
    callback(400,{'Error' : 'Missing required field.'});
  }

};

// Required data: email
userHandlers._users.delete = function(data,callback){
  // Check that email address is valid
  const email = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 ? data.queryStringObject.email.trim() : false;
  if(email){

    // Get token from headers
    const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

    // Verify that the given token is valid for the email address
    tokenHandlers._tokens.verifyToken(token,email,function(tokenIsValid){
      if(tokenIsValid){
        // Lookup the user
        _data.read('users',email,function(err,data){
          if(!err && data){
            _data.delete('users',email,function(err){
              if(!err){
                callback(200);
              } else {
                callback(500,{'Error' : 'Could not delete the specified user'});
              }
            });
          } else {
            callback(400,{'Error' : 'Could not find the specified user.'});
          }
        });
      } else {
        callback(403,{"Error" : "Missing required token in header, or token is invalid."});
      }
    });
  } else {
    callback(400,{'Error' : 'Missing required field'})
  }
};




// Export the userHandlers
module.exports = userHandlers;
