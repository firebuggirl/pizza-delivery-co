/*
 * Request orderHandlers
 *
 */

// Dependencies
const _data = require('../lib/data');
const helpers = require('../lib/helpers');
const config = require('../lib/config');
const tokenHandlers = require('./tokens');
const path = require("path");
const fs = require("fs");
const cartHandlers = require('../routes/cart');
const menuObject = require('../model/menu-items');



//const stripe = require('stripe')(config.stripeKey);//how to add this w/out module installed?????
//const stripe = "https://api.stripe.com";
const stripe = helpers.sendStripeOrder;
const keySecret = config.hashingSecret;
// Define all the orderHandlers
const orderHandlers = {};

// Not-Found
orderHandlers.notFound = function(data,callback){
  callback(404);
};

// order
orderHandlers.order = function(data,callback){
  const acceptableMethods = ['post'];
  if(acceptableMethods.indexOf(data.method) > -1){
    orderHandlers._order[data.method](data,callback);
  } else {
    callback(405);
  }
};

// Container for all the order methods
orderHandlers._order  = {};

//const getCartContents = cartHandlers._cart.get;

//POST localhost:7777/api/order?email=woof@woof.com
// SET Headers token = LOGGED_IN_USER_TOKEN application/json
// {
// 	"userEmail": "woof@woof.com",
// 	"amount": "$29",
// 	"currency": "usd",
// 	"description": "test bill"
// }
orderHandlers._order.post = function(data,callback){

  msg = typeof(msg) == 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false;
  const totalBill = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
  //const order = typeof(data.payload.order) == 'object' && data.payload.order instanceof Array && data.payload.order.length > 0 ? data.payload.order : false;
  const amount = typeof(data.payload.amount) == 'string' && data.payload.amount.trim().length > 0 ? data.payload.amount.trim() : false;
  const currency = typeof(data.payload.currency) == 'string' && data.payload.currency.trim().length > 0 ? data.payload.currency.trim() : false;
  const source = typeof(data.payload.source) == 'string' && data.payload.source.trim().length > 0 ? data.payload.source.trim() : false;
  const description = typeof(data.payload.description) == 'string' && data.payload.description.trim().length > 0 ? data.payload.description.trim() : false;
    // Get token from headers
    let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

    // Lookup the user email by reading the token
    _data.read('tokens',token,function(err,tokenData){


        if(!err && tokenData){
            const userEmail = tokenData.email;

            _data.read('users',userEmail,function(err,userData){

                if(!err && userData){

                  let userOrderItems = typeof(userData.orderItems) == 'object' && userData.orderItems instanceof Array ? userData.orderItems : [];// add new item to user's order array or add to new (empty) Array if user does not already have any checks

                  let orderId = helpers.createRandomString(20);
                  //const amount = cartHandlers.totalBill;
                  let orderObject = {
                    'id' : orderId,
                    'userEmail' : userEmail,
                    'amount': totalBill,
                     'currency': currency,
                     'description': description


                  };

                  _data.create('order',orderId,orderObject,function(err){

                    if(!err){

                      userData.orderItems = userOrderItems;
                      userData.orderItems.push(orderId);

                        _data.update('users',userEmail,userData,function(err){
                          if(!err){
                            const amount = '$29';
                            //callback(200,orderObject);//error!! can't send headers after they are sent
                            helpers.sendStripeOrder( amount, callback);
                            //helpers.sendMailGunEmail( userEmail,msg,callback );


                          }//end if !console.err();
                          else {
                            callback(500,{'Error' : 'Could not update the user with the new order info.'});
                          }

                        });//end _data.update('users',userEmail


                    }//end if(!err)


                  });//END _data.create('order',orderId,orderObject

                }//end if(!err && userData)


            });//end _data.read('users'


        }// end   if(!err && tokenData)
    });//end _data.read('tokens')



  };//end orderHandlers


// Export the orderHandlers
module.exports = orderHandlers;
