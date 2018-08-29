## Build checks service


- meat of app

- task to check URL every x # of seconds to check if up or down

- create new `checks` route in `routes/checks.js`


- `lib/config.js`:

    - create 5 check limit ` 'maxChecks' : 5 `

- `routes/checks.js`:

      - `handlers.checks`

      - `handlers._checks.post`



## Start server + test out new checks service

  - ` node index.js `

  - In Postman:

      - Re-create a token via `POST` req:

          - ` localhost:7777/api/tokens `

          `  {
              "email": "test2@test2.com",
              "password": "password2"
            } `


            - grab new token id + add to headers via Postman GUI -> `POST`:

                - `content/type`: `application/json`
                - add `token/ID`

                - ` localhost:7777/api/checks `


                ` {
                    "protocol": "http",
                    "url": "localhost.com",
                    "method": "get",
                    "successCodes": [ 200, 201 ],
                    "timeoutSeconds": 3
                  } `//returns status 200 + new check id

                  - send 4 more times so that user has 5 checks on account...check `user` collection for # of checks in `checks` array

                  - will not be able create 6 checks due to 5 limit check if all is working as intended


## `handlers._checks.get`

    - `GET` request:

        - ` localhost:7777/api/checks?id=zhov5gu6yg7rjm0o15e0 `//`check` id....that `matches user token/id` that is set in headers via Postman


## `handlers._checks.put`

    - use same token in Postman headers as above...if hasn't expired

    - `PUT`:

        ` localhost:7777/api/checks`


        ` {
            "id": "zhov5gu6yg7rjm0o15e0",
            "protocol": "https",
            "url": "yahoo.com",
            "method": "put",
            "successCodes": [
                200,
                201,
                403
            ],
            "timeoutSeconds": 2
        } `//returns status 200...look in `checks` collection to find updated checks object w/ matching ID above



## `handlers._checks.delete`


- Delete `check` + any record of `check` being on the `user's object`

  - `DELETE`:

    ` localhost:7777/checks?id=zhov5gu6yg7rjm0o15e0 `

    - leave token in headers...delete body


## `handlers._users.delete`:

    - when deleting `user`, also delete each of the associated `checks`:

    `   var userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : []; `

    ` var checksToDelete = userChecks.length; `

    `DELETE`:

    ` localhost:7777/users?phone=5555555555 `// user + associated checks is deleted

    - keep same token in headers
