require('dotenv').config();
const fs = require('fs');

// Sample subset of 6 showscases from production account
const showcaseIds = require('./example.json');

const Vimeo = require('@vimeo/vimeo').Vimeo;
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

const makeRequest = async (showcase) => lib.request({
    path: `/me/albums/${showcase.id}/videos`,
    query: {
      per_page: 100,
      sort: 'default',
      fields: 'uri,name,description,pictures.sizes'
    }
  });

const requestedData = [];

if (config.access_token) {
	lib.setAccessToken(config.access_token);

	try {
		showcaseIds.forEach(async showcase => {
			const response = await makeRequest(showcase);

			requestedData.push({
				id: showcase.id,
				title: showcase.title,
				data: {
					uri: response.body.data[0].uri,
					name: response.body.data[0].name,
					description: response.body.data[0].description,
					thumbnail: response.body.data[0].pictures.sizes[response.body.data[0].pictures.sizes.length - 1]
				}
			});

			if (showcaseIds.length === requestedData.length) {
				fs.writeFileSync('./output.json', JSON.stringify(requestedData, null, 2));

				console.log(requestedData);
				console.log('');
				console.log('--------------------');
				console.log('');
				console.log('DONE!');
				console.log('Output File: ./output.json');
			}
		});
	} catch (error) {
		console.error(`ERROR: ${error}`);
		process.exit();
	}
}