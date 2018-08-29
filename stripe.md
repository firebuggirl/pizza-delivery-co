
https://pirple.thinkific.com/courses/take/the-nodejs-master-class/lessons/3810632-connecting-to-an-api

 - create `order` route

 - create `helpers.sendStripeOrder` in `lib/helpers.js` + `var querystring = require('querystring');`

 - create `workers.alertUserToStatusChange` in `lib/workers.js` to alert user if there is/has been a state change in their order


- create a Stripe object and add it to `lib/config`

- place `helpers.sendStripeOrder` in `lib/server.js`??



## GET cart items:



- `GET` user token:

## Create Token via `POST`

    - `localhost:7777/api/tokens`

        - ` {
             "email": "test2@test2.com",
             "password": "password2"
            }

        `

## Get token service

            - ` handlers._tokens.get  `

        - resend previous `POST` request to get new token ID:

        ` localhost:7777/api/tokens `

              - `GET` request:

              ` localhost:7777/api/tokens?id=ske2tludkocrsrh959wz `

              // returns token


- `GET` request

- Set Headers for logged in user before sending GET request:

    - ` Content-type: application/json

        token : LOGGED_IN_USER_TOKEN  `


    - ` localhost:7777/api/cart?id=CART_ID `





- `POST` to Stripe `order`

` localhost:7777/api/order`

- Set headers:

` Content-type: application/JSON `
` token: LOGGED_IN_USER_TOKEN `


`  {
  "id" : "8lz9vdub7sfuzinjjh42",
  "useremail" : "test2@test2.com",
  "method": "post",
    "successCodes": [ 200, 201 ],
    "timeoutSeconds": 3
  } `


  const orderObject = {
    'id' : orderId,
    'useremail' : useremail,
  //  'protocol' : protocol,
  //  'url' : url,
    'method' : method,
    'successCodes' : successCodes,
    'timeoutSeconds' : timeoutSeconds
  };
