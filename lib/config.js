/*
 * Create and export configuration constiables
 *
 */

// Container for all environments
const environments = {};

// Staging (default) environment
environments.staging = {
  'httpPort' : 7777,
  'httpsPort' : 7771,
  'envName' : 'staging',
  'hashingSecret' : 'thisIsASecret',
  'maxChecks' : 5,
  'maxCartItems': 20,
  'stripe':{
    'PIRPLE_STRIPE_TOKEN_PK' : process.env.PIRPLE_STRIPE_TOKEN_PK,
    'PIRPLE_STRIPE_TOKEN_SK': "process.env.PIRPLE_STRIPE_TOKEN_SK",
    'source': "tok_visa",
    'currency': "usd"

},
  'mailgun': {
    'PIRPLE_FAKE_TEST_EMAIL': process.env.PIRPLE_FAKE_TEST_EMAIL,
    'PIRPLE_MAILGUN_API_KEY': process.env.PIRPLE_MAILGUN_API_KEY,
    'PIRPLE_MAILGUN_SANDBOX_DOMAIN': process.env.PIRPLE_MAILGUN_SANDBOX_DOMAIN
  }
  }



// Production environment
environments.production = {
  'httpPort' : 5000,
  'httpsPort' : 5001,
  'envName' : 'production',
  'hashingSecret' : 'thisIsAlsoASecret',
  'maxChecks' : 5,
  'maxCartItems': 20,
  'stripe' : '',//Dont use keys above for production
  'fromEmail': '',
  'mailgunAPIKey': '',
  'mailgunDomain': ''
};

// Determine which environment was passed as a command-line argument
const currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current environment is one of the environments above, if not default to staging
const environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// Export the module
module.exports = environmentToExport;
