const axios = require('axios');

async function listCalendarEvents(accessToken) {
  const calID = '';
  const url = `https://api.zoom.us/v2/calendars/${calID}/events`;
  const config = {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  //  params: { calId: calID }
  };

  console.log('Request URL:', url);
  console.log('Request Config:', JSON.stringify(config, null, 2));

  try {
    const response = await axios.get(url, config);
    console.log('Response Status:', response.status);
    console.log('Response Headers:', JSON.stringify(response.headers, null, 2));
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.response) {
     
      console.error('Zoom API Error Status:', error.response.status);
      console.error('Zoom API Error Headers:', JSON.stringify(error.response.headers, null, 2));
      console.error('Zoom API Error Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('Zoom API No Response Error:', error.request);
    } else {
      console.error('Zoom API Request Setup Error:', error.message);
    }
    console.error('Zoom API Error Config:', JSON.stringify(error.config, null, 2));
  }
  
}  module.exports = { listCalendarEvents };
