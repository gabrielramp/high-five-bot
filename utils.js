const crypto = require('crypto');
const axios = require ("axios");
const httpauth = {
    headers: {
      Authorization: `Bearer ${process.env.BOTTOKEN}`,
    },
};

function generaterandomString() {
    return crypto.randomBytes(5).toString('hex');
};

function getUnixTimestamp() {
    return Math.floor(Date.now() / 1000);
}

async function getPersonDetails(personId) {
    try {
      // Make a request to the Webex API and return the response
      const response = await axios.get(`https://webexapis.com/v1/people/${personId}?callingData=true`, httpauth);
      console.log(`Response: ${response.data}`);
      return response.data;
    } catch (error) {
      console.log(`Error retrieving person details for personId: ${personId}` + error);
      return null;
    }
}

module.exports = {generaterandomString, getUnixTimestamp, getPersonDetails};