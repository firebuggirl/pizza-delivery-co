
https://hackernoon.com/how-to-use-environment-variables-keep-your-secret-keys-safe-secure-8b1a7877d69c

* List all the Default Environment Variables:

      ` printenv `

*  create a file named `app-env`


* Source this file into local environment using source command

      ` source app-env `

* ....can now use these environment variables in our program:

        - ...access to the variables defined in your environment is available via the process.env global object.

* To access key(s):

      - EX:

            ` var api_key = process.env.API_KEY; `

* `add app-env to .gitignore` so this file is ignored to .git !!!!!!


    ` app-env `
