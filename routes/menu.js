/*
 * Request menuHandlers
 *
 */

// Dependencies
const _data = require('../lib/data');
const helpers = require('../lib/helpers');
const config = require("../lib/config");

const path = require("path");
const fs = require("fs");
// Define all the handlers
const tokenHandlers = require("./tokens");
const menuObject = require('../model/menu-items');

const menuHandlers = {};

// Not-Found
menuHandlers.notFound = function(data,callback){
  callback(404);
};

// Tokens
menuHandlers.menu = function(data,callback){
  const acceptableMethods = ['post','get','put','delete'];
  if(acceptableMethods.indexOf(data.method) > -1){//if date method exists within the macceptabethods array
     menuHandlers._menu[data.method](data,callback);
  } else {
    callback(405);
  }
};


menuHandlers._menu  = {};



menuHandlers._menu.post = function(data,callback){


 if(menuObject){

          _data.read('menu','pizza', function(err,data){
              if(err){


      if(tokenHandlers.getAdminToken ){ //only allow admin to POST to menu


                  // Store the user
                  _data.create('menu','pizza', menuObject,function(err){
                    if(!err){
                      callback(200);
                    } else {
                      console.log(err);
                      callback(500,{'Error' : 'Could not create the menu'});
                    }
                  });
                }
                }
          });
        }
//} //end tokenHandlers.get if statement
};


// GET menu EX: localhost:7777/api/menu?id=TOKEN_ID
menuHandlers._menu.get = function(data,callback){
  // Check/get TOKEN_ID of logged in user
  const id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;//get/verify token to see if user is logged in

    if(id){
    _data.read('menu', 'pizza', function(err, data){//name of directory, name of file, callback function
      console.log('this was the error', err, 'and this was the data', data);
      if(!err && data){
        callback(200,data);
      }
    });

   }
};



// Export the handlers
module.exports = menuHandlers;
