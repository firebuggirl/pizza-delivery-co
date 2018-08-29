/*
 * Server-related tasks
 *
 */

 // Dependencies
 const http = require('http');
 const https = require('https');
 const url = require('url');
 const StringDecoder = require('string_decoder').StringDecoder;
 const config = require('./config');
 const fs = require('fs');
 //const handlers = require('./handlers');
 const helpers = require('./helpers');
 const path = require('path');
 const userHandlers = require('../routes/users');
 const tokenHandlers = require('../routes/tokens');
 const menuHandlers = require('../routes/menu');
 const checkHandlers = require('../routes/checks');
 const cartHandlers = require('../routes/cart');
 const orderHandlers = require('../routes/order');

 const util = require('util');
 const debug = util.debuglog('server');

// Instantiate the server module object
const server = {};


//
// helpers.sendStripeOrder('test2@test2.com', '', function(err){
//   console.log('This was the error', err);
// });

 // Instantiate the HTTP server
server.httpServer = http.createServer(function(req,res){
   server.unifiedServer(req,res);
 });

 // Instantiate the HTTPS server
server.httpsServerOptions = {
   'key': fs.readFileSync(path.join(__dirname,'/../https/key.pem')),
   'cert': fs.readFileSync(path.join(__dirname,'/../https/cert.pem'))
 };
 server.httpsServer = https.createServer(server.httpsServerOptions,function(req,res){
   server.unifiedServer(req,res);
 });

 // All the server logic for both the http and https server
server.unifiedServer = function(req,res){

   // Parse the url
   const parsedUrl = url.parse(req.url, true);

   // Get the path
   const path = parsedUrl.pathname;
   const trimmedPath = path.replace(/^\/+|\/+$/g, '');

   // Get the query string as an object
   const queryStringObject = parsedUrl.query;

   // Get the HTTP method
   const method = req.method.toLowerCase();

   //Get the headers as an object
   const headers = req.headers;

   // Get the payload,if any
   const decoder = new StringDecoder('utf-8');
   let buffer = '';
   req.on('data', function(data) {
       buffer += decoder.write(data);
   });
   req.on('end', function() {
       buffer += decoder.end();

       // Check the router for a matching path for a handler. If one is not found, use the notFound handler instead.
       const chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

       // Construct the data object to send to the handler
       const data = {
         'trimmedPath' : trimmedPath,
         'queryStringObject' : queryStringObject,
         'method' : method,
         'headers' : headers,
         'payload' : helpers.parseJsonToObject(buffer)
       };

       // Route the request to the handler specified in the router
       chosenHandler(data,function(statusCode,payload){

         // Use the status code returned from the handler, or set the default status code to 200
         statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

         // Use the payload returned from the handler, or set the default payload to an empty object
         payload = typeof(payload) == 'object'? payload : {};

         // Convert the payload to a string
         const payloadString = JSON.stringify(payload);

         // Return the response
         res.setHeader('Content-Type', 'application/json');
         res.writeHead(statusCode);
         res.end(payloadString);
         console.log(trimmedPath,statusCode);

         // If the response is 200, print green, otherwise print red
          if(statusCode == 200){
            debug('\x1b[32m%s\x1b[0m',method.toUpperCase()+' /'+trimmedPath+' '+statusCode);
          } else {
            debug('\x1b[31m%s\x1b[0m',method.toUpperCase()+' /'+trimmedPath+' '+statusCode);
          }
       });

   });
 };

 // Define the request router
// server.router = {
//   'users' : handlers.users,
//   'tokens' : handlers.tokens,
//   'menu': handlers.menu
//
//  };

 // Define routers
 server.router = {
     'api/users' : userHandlers.users,
     'api/tokens': tokenHandlers.tokens,
     'api/menu'  : menuHandlers.menu,
     'api/checks': checkHandlers.checks,
     'api/cart' : cartHandlers.cart,
     'api/order': orderHandlers.order
}
 // Init script
server.init = function(){
  // Start the HTTP server
  server.httpServer.listen(config.httpPort,function(){
    console.log('The HTTP server is running on port '+config.httpPort);
  });

  // Start the HTTPS server
  server.httpsServer.listen(config.httpsPort,function(){
   console.log('The HTTPS server is running on port '+config.httpsPort);
  });
};

// Define the handlers
//const handlers = {};


// // Not found Handler
// handlers.notFound = function(data, callback){
//     callback(404, {"Error" : "Page not found"});
// }
 // Export the module
 module.exports = server;
