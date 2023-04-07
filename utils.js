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

async function checkEvokerClicked(attachedForm, bot) {

  try {
    // First we get the Id of the trigger returned from the data in the card
    let cardEvoker = attachedForm.inputs.trigger.person.id;

    // And the person that clicked the card.
    let cardClicker = attachedForm.personId;

    console.log(`Comparing ${cardEvoker} to clicker ${cardClicker}`)
    
    // If these are the same people, then we return 'true' for, our evoker is the one interacting with the card.
    if (cardEvoker == cardClicker) {
      return true;
    }

    // If someone clicked someone else's card, then we return a false.
    else {
      return false;
    }
  } catch (e) {
    throw e;
  }

}

module.exports = {generaterandomString, getUnixTimestamp, getPersonDetails, logCommandEvoke, checkEvokerClicked};