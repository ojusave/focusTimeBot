const axios = require('axios');
const moment = require('moment');
require('dotenv').config();

const { getZoomAccessToken } = require('./auth.js');
const { listCalendarEvents } = require('./calendar.js');


const ZOOM_API_BASE_URL = 'https://api.zoom.us/v2';

const USER_ID = 'me';
const PAGE_SIZE = 300;
const MEETING_TYPES = ['scheduled', 'live', 'upcoming', 'upcoming_meetings', 'previous_meetings'];

function logRequestResponse(method, url, requestData, responseData) {
  console.log(`\n${method} ${url}`);
  console.log('Request:', JSON.stringify(requestData, null, 2));
  console.log('Response:', JSON.stringify(responseData, null, 2));
}

async function getPastMeetingDetails(accessToken, meetingUUID) {
  const url = `${ZOOM_API_BASE_URL}/past_meetings/${meetingUUID}`;
  const config = { headers: { 'Authorization': `Bearer ${accessToken}` } };
  const response = await axios.get(url, config);
  logRequestResponse('GET', url, config, response.data);
  return response.data;
}

async function getPastMeetingParticipants(accessToken, meetingUUID) {
  const url = `${ZOOM_API_BASE_URL}/past_meetings/${meetingUUID}/participants`;
  const config = { headers: { 'Authorization': `Bearer ${accessToken}` } };
  const response = await axios.get(url, config);
  logRequestResponse('GET', url, config, response.data);
  return response.data.participants;
}

async function getMeetingRegistrants(accessToken, meetingId) {
  const url = `${ZOOM_API_BASE_URL}/meetings/${meetingId}/registrants`;
  const config = { headers: { 'Authorization': `Bearer ${accessToken}` } };
  const response = await axios.get(url, config);
  logRequestResponse('GET', url, config, response.data);
  return response.data.registrants;
}

async function fetchMeetingsForPeriod(accessToken, startDate, endDate, type) {
  let allMeetings = [];
  let nextPageToken = '';

  do {
    const url = `${ZOOM_API_BASE_URL}/users/${USER_ID}/meetings`;
    const params = {
      type: type,
      page_size: PAGE_SIZE,
      from: startDate.format('YYYY-MM-DD'),
      to: endDate.format('YYYY-MM-DD'),
      next_page_token: nextPageToken,
    };

    const config = {
      headers: { 'Authorization': `Bearer ${accessToken}` },
      params: params,
    };

    const response = await axios.get(url, config);
    logRequestResponse('GET', url, config, response.data);
    const meetings = response.data.meetings || [];
    allMeetings = allMeetings.concat(meetings);

    nextPageToken = response.data.next_page_token;
  } while (nextPageToken);

  return allMeetings;
}

async function listZoomMeetings() {
  try {
    const accessToken = await getZoomAccessToken();

    const endDate = moment().endOf('day');
    const startDate = moment(endDate).subtract(6, 'months').startOf('day');

    let allMeetings = [];

    while (startDate.isBefore(endDate)) {
      const periodEnd = moment(startDate).add(30, 'days').endOf('day');
      const actualEndDate = periodEnd.isAfter(endDate) ? endDate : periodEnd;

      for (const type of MEETING_TYPES) {
        let meetings = await fetchMeetingsForPeriod(accessToken, startDate, actualEndDate, type);
        allMeetings = allMeetings.concat(meetings);
      }

      startDate.add(30, 'days');
    }

    console.log(`Total meetings fetched: ${allMeetings.length}`);

    const detailedMeetings = [];
    const now = moment();

    for (const meeting of allMeetings) {
      const meetingEndTime = moment(meeting.end_time);
      
      if (meetingEndTime.isBefore(now)) {
        const meetingUUID = meeting.uuid;
        const meetingId = meeting.id;

        const details = await getPastMeetingDetails(accessToken, meetingUUID);
        const participants = await getPastMeetingParticipants(accessToken, meetingUUID);
        const registrants = await getMeetingRegistrants(accessToken, meetingId);

        detailedMeetings.push({
          ...meeting,
          details,
          participants,
          registrants
        });
      }
    }
    console.log('Detailed past meetings:', JSON.stringify(detailedMeetings, null, 2));

    // Add this line to fetch and log calendar events
    await listCalendarEvents(accessToken);

  } catch (error) {
    console.error('Error listing Zoom meetings:', error.message);
  }
}

listZoomMeetings();

module.exports = { ZOOM_API_BASE_URL };

