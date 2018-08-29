## Homework # 2 The Node.js Master Class

### Task: Build the API for a pizza-delivery company

1. `New users can be created`, their information can be `edited`, and they can be `deleted`. We should store their `name, email address, and street address`.

2. Users can `log in and log out` by creating or destroying a `token`.

3. When a user is logged in, they should be able to `GET all the possible menu items` (these items can be hardcoded into the system).

4. A `logged-in user` should be able to `fill a shopping cart` with `menu items`

5. A `logged-in user` should be able to `create an order`. You should `integrate with the Sandbox of Stripe.com` to accept their payment. Note: Use the stripe sandbox for your testing. Follow this link and `click on the "tokens" tab to see the fake tokens` you can use server-side to confirm the integration is working: https://stripe.com/docs/testing#cards

6. When an order is placed, you should `email the user a receipt`. You should `integrate with the sandbox of Mailgun.com` for this. Note: `Every Mailgun account comes with a sandbox email account domain` (whatever@sandbox123.mailgun.org) that you can send from by default. So, there's no need to setup any DNS for your domain for this task https://documentation.mailgun.com/en/latest/faqs.html#how-do-i-pick-a-domain-name-for-my-mailgun-account

This is an open-ended assignment. You may take any direction you'd like to go with it, as long as your project includes the requirements. It can include anything else you wish as well.

## Enable support for https

  - add SSL certificate to initiate SSL handshake

      - use `openSSL`

      -  best practice to `gitignore the cert and pem`!!!


  - The x.509 client authentication allows clients to authenticate to servers with certificates rather than with a username and password.

     - ` mkdir https `

     - ` cd https `

     - ` openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem
    `


      - answer prompts :

            `US`

            `State`

            `Locality/City`

            `Organization name` (eg., name of company)

            `Organizational Unit Name`(eg., name of company)

            `Common Name`

                - local dev -> `localhost`

                - prod -> `www.example.com` &/or `example.com`//depends on who you're getting SSL Cert from

            `email`

      - http = `port 80`

      - https = `port 443`


  - Re-factor `createServer` function

        - put all server logic in `unifiedServer` function

## Create a User via `POST`

  - `localhost:7777/api/users`

      - ` {
            "firstName":"Joe",
            "lastName":"Schmoe",
            "password":"password2",
            "tosAgreement":true,
            "email": "test2@test2.com",
            "address": "123 Schmoe Lane"

            } `

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


## PUT token service

            - ` handlers._tokens.put `

            - extend token if it has not already expired

            - `PUT` request -> Postman:

                - ` localhost:7777/api/tokens `

                ` {
                    "id": "ske2tludkocrsrh959wz",

                    "extend": true
                  } `// extends token/session
## Delete Token Service


      - Delete/Logout

       - First do `GET` req to see if token still exists:

        ` localhost:7777/api/tokens?id=ske2tludkocrsrh959wz `

            - Then `DELETE` request -> Postman

            - ` localhost:7777/api/tokens?id=ske2tludkocrsrh959wz `


## Create Menu via `POST`


    ` localhost:7777/api/menu `

     - see `model/menu-items.js`     `
