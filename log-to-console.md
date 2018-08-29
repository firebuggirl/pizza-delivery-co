## Logging Files to the console

https://pirple.thinkific.com/courses/take/the-nodejs-master-class/lessons/3810906-logging-to-the-console


- Tell Node when to log certain strings vs others

- Send to console, in yellow in `workers.init()` when app boots up:

   ` console.log('\x1b[33m%s\x1b[0m','Background workers are running'); `

- light blue via `server.js`:

  `  console.log('\x1b[36m%s\x1b[0m','The HTTP server is running on port '+config.httpPort); `


  - pink:

    ` console.log('\x1b[35m%s\x1b[0m','The HTTPS server is running on port '+config.httpsPort);//  `


## Debugging

- ...can use `DEBUG` w/ almost any Node dependency/module that supports it

    - ` NODE_DEBUG=http node index.js `// debug http module


- Debug your own modules:

  - in `workers.js`:

        - include `const util = require('util');`

        -  + `const debug = util.debuglog('workers');`

        - find/replace most `console.log` w/ `debug`

        - ` NODE_DEBUG=workers node index.js  `//each worker log will be returned w/ process id



## Log out success status of requests in console in green or red

   - repeat in `server.js`

          - ` var util = require('util');
              var debug = util.debuglog('server'); `


          - test in Postman via `POST`:


          - start app via ` NODE_DEBUG=server node index.js `

              ` localhost:3000/checks `//send random request

              - debug messages on `server` on happen when a request hits the API
