// Bulletin function handled almost entirely within this file (wow!)
require("dotenv").config();
const fs = require('fs');
const path = require('path');
const utils = require('./utils');

// This function handles when the command 'bulletin' is heard by the bot.
async function bulletinEvoke(bot, trigger) {
    // TODO: Get all of the users' current bulletins where they are 'Viewers' to put in the Quickly View actionset.
    const newBulletinId = utils.generaterandomString();

    // Create 'Bulletin' Evoke Card:
    let bulletinEvokeCard = {
        "type": "AdaptiveCard",
        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
        "version": "1.3",
        "body": [
            {
                "type": "TextBlock",
                "text": "Bulletin 🪧",
                "wrap": true,
                "size": "Medium",
                "weight": "Bolder"
            },
            {
                "type": "TextBlock",
                "text": "Save Important Information!",
                "wrap": true,
                "spacing": "None"
            },
            {
                "type": "Container",
                "items": [
                    {
                        "type": "TextBlock",
                        "text": "Quickly View Your Bulletins:",
                        "wrap": true,
                        "spacing": "Medium"
                    },
                    {
                        "type": "ActionSet",
                        "spacing": "None",
                        "actions": [
                            {
                                "type": "Action.Submit",
                                "title": "WORK IN PROGRESS"
                            },
                            {
                                "type": "Action.Submit",
                                "title": "WORK IN PROGRESS"
                            },
                            {
                                "type": "Action.Submit",
                                "title": "WORK IN PROGRESS"
                            }
                        ],
                        "height": "stretch"
                    }
                ]
            },
            {
                "type": "Container",
                "items": [
                    {
                        "type": "TextBlock",
                        "text": "Bulletin Some More:",
                        "wrap": true,
                        "spacing": "Medium"
                    },
                    {
                        "type": "ActionSet",
                        "spacing": "None",
                        "actions": [
                            {
                                "type": "Action.Submit",
                                "title": "Create a Bulletin",
                                "id": "createBulletin",
                                data: {
                                    "formId": `${newBulletinId}`,
                                    "formType": "bulletinCreate",
                                    "endpoint": `${process.env.WEBHOOKURL}/submit`,
                                    "trigger": trigger
                                }
                            },
                            {
                                "type": "Action.Submit",
                                "title": "Edit a Bulletin",
                                "id": "editBulletin",
                                data: {
                                    "formType": "editBulletin",
                                    "endpoint": `${process.env.WEBHOOKURL}/submit`,
                                    "trigger": trigger
                                }
                            },
                            {
                                "type": "Action.Submit",
                                "title": "Edit Bulletin Permissions",
                                "id": "EditBulletinPerms",
                                data: {
                                    "formType": "EditBulletinPerms",
                                    "endpoint": `${process.env.WEBHOOKURL}/submit`,
                                    "trigger": trigger
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    }
    try {
        bot.sendCard(bulletinEvokeCard, "Bulletin Evoke Card")
    } catch (e) {
        throw (e);
    }
}

// Here we handle when a user clicks the 'Create a Bulletin' button.
async function bulletinCreate(bot, trigger, attachedForm) {
  // formData will contain all information passed through with the submission action of the interacted Adaptive Card, so hopefully i.e formType, formTitle, formId.
  const formData = trigger.attachmentAction.inputs;
  console.log(`DEBUG BULLETINCREATE: attachedForm: ${JSON.stringify(attachedForm), undefined, 2}`)

  let newBulletinCard = {
        "type": "AdaptiveCard",
        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
        "version": "1.3",
        "body": [
            {
                "type": "Container",
                "items": [
                    {
                        "type": "TextBlock",
                        "text": "Create a Bulletin",
                        "wrap": true,
                        "size": "Medium",
                        "weight": "Bolder"
                    },
                    {
                        "type": "Container",
                        "items": [
                            {
                                "type": "Input.Text",
                                "placeholder": "i.e \"Important Links for Apprentices\"",
                                "label": "Name your new Bulletin:",
                                "isRequired": true,
                                "id": "newBulletinName"
                            },
                            {
                                "type": "Input.Text",
                                "placeholder": "i.e Link for Culture: https://www.youtube.com/watch?v=9JnGuLUvE4A",
                                "label": "Give your Bulletin its first item:",
                                "isMultiline": true,
                                "isRequired": true,
                                "id": "newBulletinItem"
                            },
                            {
                                "type": "Input.Text",
                                "placeholder": "example@cisco.com",
                                "label": "Add Editors to your Bulletin, separated by comma (optional)",
                                "id": "newBulletinEditors"
                            }
                        ]
                    }
                ]
            }
        ],
        actions: [
            {
              type: "Action.Submit",
              title: "Create Bulletin",
              data: {
                "trigger": trigger,
                "formType": "bulletinNewBulletin",
                "formId": `${formData.formId}`,
                "endpoint": `${process.env.WEBHOOKURL}/submit`,
              }
            }
        ]
    };
    try {
        await bot.censor(attachedForm.messageId);
        await bot.sendCard(newBulletinCard, "Bulletin Create Card")
    } catch (e) {
        throw (e);
    }
};

// This function handles a user clicking "Create Bulletin" on a new bulletin card.

async function initNewBulletin(bot, trigger, attachedForm) {

    const newBulletinId = utils.generaterandomString();

    // formData will contain all information passed through with the submission action of the interacted Adaptive Card, so hopefully i.e formType, formTitle, formId.
    const formData = trigger.attachmentAction.inputs;

    let newBulletinTitle = formData.newBulletinName;
    let newBulletinItem = formData.newBulletinItem;
    let newBulletinEditors = formData.newBulletinEditors;
    const unixTimestamp = utils.getUnixTimestamp();
    console.log(`DEBUG INITNEWBULLETIN: Started. Title: ${newBulletinTitle}, Item: ${newBulletinItem}, Editors: ${newBulletinEditors}`);

      // Create the bulletin data object
    const bulletinData = {
        title: newBulletinTitle,
        unixLastEdited: unixTimestamp,
        items: [
            {
                id: 1,
                content: newBulletinItem
            }
        ]
    };

  // Generate a file name based on the form ID
  const fileName = `${newBulletinId}.json`;

  // Write the data to a new file in the bulletins directory
  const filePath = path.join(__dirname, 'bulletins', fileName);
  fs.writeFile(filePath, JSON.stringify(bulletinData, null, 2), (err) => {
    if (err) {
      console.error(`Error writing to file: ${err}`);
      return;
    }
    console.log(`Bulletin file ${fileName} created successfully.`);
  });

  // Check if the authorization file exists
  const authFileName = 'bulletinAuthorizations.json';
  const authFilePath = path.join(__dirname, 'authorization', authFileName);
  let authData = {};
  if (fs.existsSync(authFilePath)) {
    // Read the authorization file if it exists
    const authFileContent = fs.readFileSync(authFilePath);
    authData = JSON.parse(authFileContent);
  } else {
    // Create a new authorization object if the file does not exist
    authData = {
      Owner: {},
      Editor: {},
      Viewer: {}
    };
  }

  // Add the person who submitted the bulletin as the owner
  const ownerId = trigger.person.userName;
  if (!authData.Owner[ownerId]) {
    authData.Owner[ownerId] = [newBulletinId];
  } else {
    authData.Owner[ownerId].push(newBulletinId);
  }

      // Clean up editors list
      if (newBulletinEditors != null && newBulletinEditors.length != 0) {
        // First we remove any escape characters 
        let cleanedNewBulletinEditors = newBulletinEditors.replace(/\\/g, '');
        // Then we remove any adjacent semicolons (i.e ",,,,,," becomes ",")
        cleanedNewBulletinEditors = cleanedNewBulletinEditors.replace(/,,+/g, ',');
        // Then if the first or last characters are semicolons, remove them
        if (cleanedNewBulletinEditors.slice(-1) === ',') {
            cleanedNewBulletinEditors = cleanedNewBulletinEditors.slice(0, -1);
        }
        if (cleanedNewBulletinEditors.charAt(0) === ',') {
            cleanedNewBulletinEditors = cleanedNewBulletinEditors.slice(1);
        }
        // Then we remove unnecessary whitespace.
        let bulletinEditors = cleanedNewBulletinEditors.split(',').map(word => word.trim()); 

        bulletinEditors.forEach(newEditor => {
            if (!authData.Editor[newEditor]) {
                authData.Editor[newEditor] = [newBulletinId];
            } else {
                authData.Editor[newEditor].push(newBulletinId);
            }
        });
    }

  // Write the updated authorization data to the file
  fs.writeFile(authFilePath, JSON.stringify(authData, null, 2), (err) => {
    if (err) {
      console.error(`Error writing to file: ${err}`);
      return;
    }
    console.log(`Authorization file ${authFileName} updated successfully.`);
  });
}

// Handled when a user clicks 'edit a bulletin' when 
async function editBulletinEvoke(bot, trigger, attachedForm) {
    // formData will contain all information passed through with the submission action of the interacted Adaptive Card, so hopefully i.e formType, formTitle, formId.
    const formData = trigger.attachmentAction.inputs;


}

async function newAuthorization(personId, formId, authType) {

}

async function insertNewItem(formId, newItem) {

}

module.exports = {
    bulletinEvoke: bulletinEvoke,
    bulletinCreate: bulletinCreate,
    initNewBulletin: initNewBulletin,
    editBulletinEvoke: editBulletinEvoke
};