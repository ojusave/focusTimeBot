const axios = require('axios');
const qs = require('querystring');

// Zoom API credentials
const ZOOM_ACCOUNT_ID = '';
const ZOOM_CLIENT_ID = '';
const ZOOM_CLIENT_SECRET = '';

// Zoom OAuth endpoint
const ZOOM_OAUTH_URL = 'https://zoom.us/oauth/token';

async function getZoomAccessToken() {
  try {
    const response = await axios.post(ZOOM_OAUTH_URL, 
      qs.stringify({
        grant_type: 'account_credentials',
        account_id: ZOOM_ACCOUNT_ID
      }), 
      {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(ZOOM_CLIENT_ID + ':' + ZOOM_CLIENT_SECRET).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const accessToken = response.data.access_token;
    console.log('Access Token:', accessToken);
    return accessToken;
  } catch (error) {
    console.error('Error getting Zoom access token:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Usage
getZoomAccessToken()
  .then(token => {
    // Use the token for subsequent API calls
    console.log('Successfully obtained Zoom access token');
  })
  .catch(error => {
    console.error('Failed to obtain Zoom access token');
  });

  module.exports = { getZoomAccessToken };
