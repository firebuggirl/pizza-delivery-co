## Background Workers


- Alert users via SMS when requests to server(s) are up/down

https://pirple.thinkific.com/courses/take/the-nodejs-master-class/lessons/3810764-background-workers

    - = Background processes

    - refactor `index.js`


    - create `lib.list` function via `lib/data.js` -> to be used w/in `workers.gatherAllChecks`


    - create workers file to start up workers


        - create `workers.init` script

              - call `workers.gatherAllChecks();`  + `workers.loop `








## Test that checks are set up properly w/Postman

  - ` node index.js `

  - Get a `token/id` from previous req via `POST`:

  ` localhost:3000/tokens `

  ` {
    "phone": "4158675309",
    "password": "password"
    } `


  - create new `check` `POST`:

  ` localhost:3000/checks `

  - set headers:

      `Content-Type: JSON`

      `token: token/id`

      ` {
          "protocol": "https",
          "url": "google.com",
          "method": "get",
          "successCodes": [200, 201],
          "timeoutSeconds": 3

        } `

        ` {
            "protocol": "https",
            "url": "google.com",
            "method": "get",
            "successCodes": [200, 201],
            "timeoutSeconds": 3

          } `



////////////////
//
// If process fails above, create new user, token before setting new checks
//
- create new user via `POST` `localhost:3000/users`

          ` {
              "firstName":"Jane",
              "lastName":"Dreamer",
              "phone":"4158675309",
              "password":"password",
              "tosAgreement":true
              } `
- create token for user via `POST` `localhost:3000/tokens`

  - phone # needs to be realistic
              ` {
                "phone": "4158675309",
                "password": "password"
                } `


  - get token ID

  - grab new token id + add to headers via Postman GUI -> `POST`:

            - `content/type`: `application/json`
            - add `token/ID`

            - ` localhost:3000/checks `




  - `state` is `down` for new checks..why?

  - correct messages not being output to console...come back to end of video


      - because the status codes `301` & `302` were not included in list of successCodes ...ie., due to the fact that we're not prefixing req urls w/ www
