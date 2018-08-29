/*
 * Request cartHandlers
 *
 */

// Dependencies
const _data = require('../lib/data');
const helpers = require('../lib/helpers');
const config = require('../lib/config');
const tokenHandlers = require('./tokens');
const path = require("path");
const fs = require("fs");
const menuObject = require('../model/menu-items');


// Define all the cartHandlers
const cartHandlers = {};

// Not-Found
cartHandlers.notFound = function(data,callback){
  callback(404);
};

// cart
cartHandlers.cart = function(data,callback){
  const acceptableMethods = ['post','get','put','delete'];
  if(acceptableMethods.indexOf(data.method) > -1){
    cartHandlers._cart[data.method](data,callback);
  } else {
    callback(405);
  }
};

// Container for all the cart methods
cartHandlers._cart  = {};


// cart - post
// Required data: at least one item
// POST to cart EX: localhost:7777/api/cart
// Set Headers:
// Content-type: application/json
// Token: TOKEN_ID
// EX: POST request:
// {
//   "userEmail" : "test2@test2.com",
//   "order": [
//     {
//       "name": "thin-crust",
//       "toppings": ["pepperoni", "peppers", "olives"],
//       "sizeChoice": [
//                 { "_id": "large", "price": 18 }
//                 ]
//         }
//   ]
// }

cartHandlers._cart.post = function(data,callback){

  var order = typeof(data.payload.order) == 'object' && data.payload.order instanceof Array && data.payload.order.length > 0 ? data.payload.order : false;
    // Get token from headers
    var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

    // Lookup the user email by reading the token
    _data.read('tokens',token,function(err,tokenData){
      if(!err && tokenData){
        var userEmail = tokenData.email;

        // Lookup the user data
        _data.read('users',userEmail,function(err,userData){
          if(!err && userData){
            var userCartItems = typeof(userData.cartItems) == 'object' && userData.cartItems instanceof Array ? userData.cartItems : [];// add new item to user's order array or add to new (empty) Array if user does not already have any checks
            // Verify that user has less than the number of max-cart per user
            if(userCartItems.length < config.maxCartItems){
              // Create random id for check
              var cartId = helpers.createRandomString(20);

              // Create check object including useremail

              //let cartObject = menuObject;
              let cartObject = {
                'id' : cartId,
                'userEmail' : userEmail,
                'order': order
              };
              // Save the object..persist data to disk..stored in `cart` collection
              _data.create('cart',cartId,cartObject,function(err){
                if(!err){
                  // Add check id to the user's object
                  userData.cartItems = userCartItems;
                  userData.cartItems.push(cartId);

                  // Save the new user data
                  _data.update('users',userEmail,userData,function(err){
                    if(!err){
                      // Return the data about the new order in the cart document/directory
                      callback(200,cartObject);
                    } else {
                      callback(500,{'Error' : 'Could not update the user with the new order info.'});
                    }
                  });
                } else {
                  callback(500,{'Error' : 'Could not create the new order'});
                }
              });



            } else {
              callback(400,{'Error' : 'The user already has the maximum number of cart items ('+config.maxCartItems+').'})
            }


          } else {
            callback(403);
          }
        });


      } else {
        callback(403);
      }
    });

};



// cart - get
// Required data: id
// Optional data: none
// Set headers: Content-type: application/json + token = LOGGED_IN_USER_TOKEN
// GET localhost:7777/api/cart?id=CART_ID
cartHandlers._cart.get = function(data,callback){
  // check that id is valid
  const id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
  if(id){
    // Lookup the cart
    _data.read('cart',id,function(err,cartData){
      if(!err && cartData){
        // Get the token that sent the request
        const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
        // Verify that the given token is valid and belongs to the user who created the cart
        //console.log("This is cart data",cartData.id);



        const cartUserEmail = cartData.userEmail;
        const itemName = cartData.order[0].name;
        const Toppings = cartData.order[0].toppings;
        const pizzaSize = cartData.order[0].sizeChoice[0]._id;
        const pizzaPrice = cartData.order[0].sizeChoice[0].price;



        function calculateBill(total, tax = 0.0725) {
          return total + (total * Math.round(tax * 100)/ 100) ;
        }

        const totalBill = calculateBill(pizzaPrice, undefined);

        console.log(totalBill);

        console.log(`This is the cart data for the logged in user with this cart ID ${cartData.id}. ${cartUserEmail} has ordered a ${pizzaSize} ${itemName} pizza with the following toppings : ${Toppings}. The sub-total without tax is ${pizzaPrice} and the total with tax is ${totalBill}.`);



        tokenHandlers._tokens.verifyToken(token,cartData.userEmail,function(tokenIsValid){
          if(tokenIsValid){
            // Return cart data
            callback(200,cartData);
          } else {
            callback(403);
          }
        });
      } else {
        callback(404);
      }
    });
  } else {
    callback(400,{'Error' : 'Missing required field, or field invalid'})
  }
};

// cart - put
// Required data: id
// Optional data: protocol,url,method,successCodes,timeoutSeconds (one must be sent)
cartHandlers._cart.put = function(data,callback){

};


// cart - delete
// Required data: id
// Optional data: none
cartHandlers._cart.delete = function(data,callback){

};


// Export the cartHandlers
module.exports = cartHandlers;
