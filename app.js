require('dotenv').config();

const Vimeo = require('@vimeo/vimeo').Vimeo;
const util = require('util');
let config = {};

try {
  config = require(`./config-${process.env.NODE_ENV}.json`);
} catch (error) {
  console.error(`ERROR: For this example to run properly you must create an API app at 'https://developer.vimeo.com/apps/new' and set your callback url to 'http://localhost:8080/oauth_callback'`);
  console.error('ERROR: Once you have your app, make a copy of `config.json.example` named ' +
    '`config.json` and add your client ID, client secret and access token.');
  process.exit();
}

const lib = new Vimeo(config.client_id, config.client_secret, config.access_token);

const makeRequest = function(lib, showcaseId) {
  // Make an API request
  lib.request({
    // This is the path for the videos contained within the staff picks channels
    path: `/me/albums/${showcaseId}/videos`,
    query: {
      per_page: 100,
      sort: 'default',
      fields: 'uri,name,description,pictures.sizes'
    }
  }, function (error, body, statusCode, headers) {
    if (error) {
      console.log('error');
      console.log(error);
    } else {
      console.log('body');
      console.log(util.inspect(body, false, null));
    }

    console.log('status code');
    console.log(statusCode);
    console.log('headers');
    console.log(headers);
  });
}

// Asthma: 3959551
// Cancer: 3959527
// Central Line: 3959541
// Clinical Trials: 3959544
// Diabetes: 3959539
// G-Tube: 3959530
const showcaseIds = [3959551, 3959527, 3959541, 3959544, 3959539, 3959530];

if (config.access_token) {
  lib.setAccessToken(config.access_token);
  
  showcaseIds.forEach(showcase => makeRequest(lib, showcase));
} else {
  // Unauthenticated API requests must request an access token. You should not request a new access
  // token for each request, you should request an access token once and use it over and over.
  lib.generateClientCredentials('public', function (err, response) {
    if (err) {
      throw err;
    }

    // Assign the access token to the library.
    lib.setAccessToken(response.access_token);
    showcaseIds.forEach(showcase_id => makeRequest(lib, showcase_id));
  });
}