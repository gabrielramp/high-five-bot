const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const axios = require ("axios");

const httpauth = {
    headers: {
      Authorization: `Bearer ${process.env.BOTTOKEN}`,
    },
};

// This creates a randomized string for formIds.
function generaterandomString() {
    return crypto.randomBytes(5).toString('hex');
};

// Here we generate Unix timestamps for time comparison in data.
function getUnixTimestamp() {
    return Math.floor(Date.now() / 1000);
}

// This calls the Webex API to retrieve a person's details.
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

async function getMentionedPeople(roomId, messageId) {
  
}

// Here we log our commands for metrics!
async function logCommandEvoke(commandId) {
  let commandLogDataObject = {};
  const commandLogFile = path.join(__dirname, 'logs', `commandLog.json`);
  if (fs.existsSync(commandLogFile)) {
      const commandLogData = fs.readFileSync(commandLogFile);
      commandLogDataObject = JSON.parse(commandLogData);
  }
  else {
      commandLogDataObject = {}
  }

  if (!commandLogDataObject[commandId])
  {
    commandLogDataObject[commandId] = 1;
  }
  else {
    commandLogDataObject[commandId] += 1;
  }
  console.log(`Writing command log for ${commandId}`)
  fs.writeFileSync(commandLogFile, JSON.stringify(commandLogDataObject,null,2));
}

module.exports = {generaterandomString, getUnixTimestamp, getPersonDetails, logCommandEvoke};