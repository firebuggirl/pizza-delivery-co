




handlers._order.post = function(data,callback){
  //Validate the email in the query string
  var email = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 5 ? data.queryStringObject.email.trim() : false;
  if (email){
    //Vlidate the token
     var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
    //Verify that the given token is valid for the email address
    handlers._tokens.verifyToken(token,email,function(tokenIsValid){
        if(tokenIsValid){
          // read the users info
          _data.read('users',email,function(err,userData){
            if(!err && userData){
              //calculate the amount
              var amount = userData.cartItems.length * 100;
              if(amount){
                helpers.sendStripeOrder(email,amount,callback);
              }else {
                callback('your cart is empty');
              }
            } else{
              callback(404,{'Error':'User information is missing'});
            }
          });

        } else {
          callback(500,{'Error' : 'token in the header is either invalid or expired'});
        }
    });

  } else {
    callback(404,{'Error':'Specified user doesn\'t exist'});
  }
};
