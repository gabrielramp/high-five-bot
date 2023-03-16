// Bulletin function handled almost entirely within this file (wow!)
require("dotenv").config();
const fs = require('fs');
const path = require('path');
const utils = require('./utils');

// This function handles when the command 'bulletin' is heard by the bot.
async function bulletinEvoke(bot, trigger) {

    // Build the body
    let bulletinEvokeBodyBlock = [];
    let cardTitle = 
    {
        "type": "TextBlock",
        "text": "Bulletin 🪧",
        "wrap": true,
        "size": "Medium",
        "weight": "Bolder"
    };
    bulletinEvokeBodyBlock.push(cardTitle);

    let flavorText = 
    {
        "type": "TextBlock",
        "text": "Save Important Information!",
        "wrap": true,
        "spacing": "None"
    };
    bulletinEvokeBodyBlock.push(flavorText);

    // Building the "Quickly View your Bulletins" block
    // Get the most recently viewed bulletins for this user
    const topViewedBulletins = await getTopViewedBulletins(trigger.person.userName);
    // Build the block
    var hasTopBulletins = 0;
    let topActions = [];
    // if topViewed is not empty
    if (topViewedBulletins != null) {
        hasTopBulletins = 1;
        topViewedBulletins.forEach(([bulletinId, bulletinTitle]) => {
            let singleAction = 
            {
                "type": "Action.Submit",
                "title": `${bulletinTitle}`,
                "data": {
                    "bulletinId": `${bulletinId}`,
                    "formType": `bulletinView`
                }
            }
            topActions.push(singleAction);
        })
    }

    let topBulletinsBlock = {};
    if (hasTopBulletins != 0) {
        topBulletinsBlock = 
        {
            "type": "Container",
            "items": [
                {
                    "type": "TextBlock",
                    "text": "Quickly View Your Bulletins:",
                    "wrap": true,
                    "spacing": "Medium",
                    "$when": "${$hasTopBulletins != 0}"
                },
                {
                    "type": "ActionSet",
                    "spacing": "None",
                    "actions": topActions,
                    "height": "stretch"
                }
            ]
        };
        bulletinEvokeBodyBlock.push(topBulletinsBlock);

    }

    const actionsBlockText = hasTopBulletins === 0 ? "Get Started:" : "Bulletin some more:" 
    let actionsBlock = 
    {
        "type": "Container",
        "spacing": "Small",
        "items": [
            {
                "type": "TextBlock",
                "text": actionsBlockText,
                "wrap": true,
                "spacing": "Small"
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
    };
    bulletinEvokeBodyBlock.push(actionsBlock);

    console.log(`topbulletins: ${hasTopBulletins}`);
    // Create 'Bulletin' Evoke Card:
    let bulletinEvokeCard = {
        "type": "AdaptiveCard",
        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
        "version": "1.3",
        "$data": {
            "hasTopBulletins": `${hasTopBulletins}`
        },
        "body": bulletinEvokeBodyBlock
    }
    try {
        await bot.sendCard(bulletinEvokeCard, "Bulletin Evoke Card");
    } catch (e) {
        console.log(e);
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
        console.log(e);
    }
};

// This function handles a user clicking "Create Bulletin" on a new bulletin card.
async function initNewBulletin(bot, trigger, attachedForm) {

    // First we'll create our new bulletin's ID. Its file will be associated with this.
    const newBulletinId = utils.generaterandomString();

    // Get all of our variables ready to call
    const formData = trigger.attachmentAction.inputs;
    let newBulletinTitle = formData.newBulletinName;
    let newBulletinItem = formData.newBulletinItem;
    let newBulletinEditors = formData.newBulletinEditors;
    const unixTimestamp = utils.getUnixTimestamp();
    // console.log(`DEBUG INITNEWBULLETIN: Started. Title: ${newBulletinTitle}, Item: ${newBulletinItem}, Editors: ${newBulletinEditors}`);

    // Create the bulletin data object for initializing the JSON.
    const bulletinData = {
        title: newBulletinTitle,
        unixLastEdited: unixTimestamp,
        owner: trigger.person.userName,
        editors: [],
        viewers: [],
        items: [
            {
                id: 1,
                content: newBulletinItem
            }
        ]
    };

    // Check if the authorization file exists
    const authFileName = 'bulletinAuthorizations.json';
    const authFilePath = path.join(__dirname, 'authorization', authFileName);
    let authData = {};
    if (fs.existsSync(authFilePath)) {
        // Read the authorization file if it exists
        const authFileContent = fs.readFileSync(authFilePath);
        authData = await JSON.parse(authFileContent);
    } else {
        // Create a new authorization object if the file does not exist
        authData = {
            Owner: {},
            Editor: {},
            Viewer: {}
        };
    }

    // Add the bulletin Id to the person's Owner list
    const ownerId = trigger.person.userName;
    if (!authData.Owner[ownerId]) {
        authData.Owner[ownerId] = [newBulletinId];
    } else {
        authData.Owner[ownerId].push(newBulletinId);
    }

    // Next, we'll play with the editors list.
    if (newBulletinEditors != null && newBulletinEditors.length != 0) {
        // Clean it up first.
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
        // End cleanup

        // Next, we'll loop for each editor in the list.
        bulletinEditors.forEach(newEditor => {
            // Append their authorization with this formId
            if (!authData.Editor[newEditor]) {
                authData.Editor[newEditor] = [newBulletinId];
            } else {
                authData.Editor[newEditor].push(newBulletinId);
            }
            // And also add them to the editors in the new bulletin.
            bulletinData.editors.push(newEditor);
        });
    }

    // Then, write the bulletin file and authorization file!
    const bulletinJson = `${newBulletinId}.json`;
    const bulletinPath = path.join(__dirname, 'bulletins', bulletinJson);
    fs.writeFile(bulletinPath, JSON.stringify(bulletinData, null, 2), (err) => {
        if (err) {
            console.error(`Error writing to file: ${err}`);
            return;
        }
        console.log(`Bulletin file ${bulletinJson} created successfully.`);
    });

    // Write the updated authorization data to the file.
    fs.writeFile(authFilePath, JSON.stringify(authData, null, 2), (err) => {
        if (err) {
            console.error(`Error writing to file: ${err}`);
            return;
        }
        console.log(`Authorization file ${authFileName} updated successfully.`);
    });

    // Then return the new bulletinId as a success.
    try {
        bot.censor(attachedForm.messageId);
    } catch (e) {
        console.log(e);
    }
    return newBulletinId;
}

// This updates the viewer lists in authorization and in the bulletinId's viewerlist.
async function updateViewerLists(bot, bulletinId, roomId) {
    // Get the list of member emails from the given roomId
    bot.webex.memberships.list({roomId: roomId})
    .then(async (memberships) => {
        let viewerList = [];
        for (const member of memberships.items) {
            viewerList.push(member.personEmail)
        }
        console.log(`Viewer list for bulletin ${bulletinId} retrieved: ${viewerList}`);

        // Open up the file
        const bulletinFile = path.join(__dirname, 'bulletins', `${bulletinId}.json`);
        const bulletinData = fs.readFileSync(bulletinFile);
        let bulletinDataObject = {};
        bulletinDataObject = JSON.parse(bulletinData);
        // Update the bulletin's Viewer list
        bulletinDataObject.viewerList = viewerList;
        
        // Write the data back to the file.
        fs.writeFile(bulletinFile, JSON.stringify(bulletinDataObject, null, 2), (err) => {
            if (err) {
                console.error(`Error writing to file: ${err}`);
                return;
            }
            console.log(`Bulletin file ${bulletinId} viewerList successfully updated.`);
        });

        // Now we'll loop through each of the members, and add the bulletinId to their Viewer auth.
        try {
            const authFilePath = path.join(__dirname, 'authorization', 'bulletinAuthorizations.json');
            let authDataObject = {};
            if (fs.existsSync(authFilePath)) {
                // Read the authorization file if it exists
                const authData = fs.readFileSync(authFilePath);
                authDataObject = await JSON.parse(authData);
            }
            // For each viewer, loop through auth file, if their auth exists, push it, if not, make their auth
            let viewerBulletinObject = 
            {
                bulletinId: bulletinId,
                lastViewed: ""
            }
            viewerList.forEach ((newViewer) => {
                if (!authDataObject.Viewer[newViewer]) {
                    authDataObject.Viewer[newViewer] = [viewerBulletinObject];
                } 
                else {
                    authDataObject.Viewer[newViewer].push(viewerBulletinObject);
                }
            });

            fs.writeFile(authFilePath, JSON.stringify(authDataObject, null, 2), (err) => {
                if (err) {
                    console.error(`Error writing to file: ${err}`);
                    return;
                }
                console.log(`Authorization file viewerList successfully updated.`);
            });
        } catch (e) {
            console.log(e);
        }
    });
}

// Handled when a user clicks 'edit a bulletin' when 
async function editBulletinEvoke(bot, trigger, attachedForm) {
    // formData will contain all information passed through with the submission action of the interacted Adaptive Card, so hopefully i.e formType, formTitle, formId.
    const formData = trigger.attachmentAction.inputs;

    // TODO: Find the user's email, then go through all of the forms that they are 'owner' or 'editor' to. List these, and allow them to click them to edit them.
    //       Ideally we want to list these in order of most recently edited to least recently,

}

// This function will look at a person's bulletins, find the most recent bulletin views, and return an object that contains their names and bulletin Ids in order.
async function getTopViewedBulletins(personEmail) {

    // First we'll grab the auth file
    const authFile = path.join(__dirname, 'authorization', `bulletinAuthorizations.json`);
    let authDataObject = {};
    if (fs.existsSync(authFile)) {
        const authData = fs.readFileSync(authFile);
        authDataObject = await JSON.parse(authData);
    }
    else {
        // Return null if doesn't exist
        return null;
    }

    // Then we'll find person's view list
    if (authDataObject.Viewer[personEmail]) {
        // And find the most recently viewed
        // Sort the list by last viewed time in descending order
        const personViewList = authDataObject.Viewer[personEmail];
        personViewList.sort((a, b) => (a.lastViewed < b.lastViewed) ? 1 : -1);

        // Extract the top three bulletinIds
        const topViewedBulletinIds = personViewList.slice(0, 3).map(viewed => viewed.bulletinId);

        // Extract the top three bulletinIds and titles as an array of key-value pairs
        const topViewedBulletins = await Promise.all(
            personViewList.slice(0, 3).map(async (viewed) => {
                const bulletinId = viewed.bulletinId;
                const bulletinName = await getBulletinNameFromId(bulletinId);
                return [bulletinId, bulletinName];
            })
        );


        // Return the result as an object with key-value pairs
        console.log(`Returning top viewed bulletins: ${JSON.stringify(topViewedBulletins, null, 2)}`);
        return topViewedBulletins;
    }
    else {
        // Return null if doesn't exist
        return null;
    }
    console.log("Returning null on getTopViewedBulletins.")
    return null;
}

async function printBulletin(bot, trigger, attachedForm) {
    const formData = trigger.attachmentAction.inputs;
    const bulletinId = formData.bulletinId;
    console.log(`DEBUG: printBulletin ${bulletinId}`);

    const bulletinFile = path.join(__dirname, 'bulletins', `${bulletinId}.json`);
    let bulletinDataObject = {};
    if (fs.existsSync(bulletinFile)) {
        const bulletinData = fs.readFileSync(bulletinFile);
        bulletinDataObject = await JSON.parse(bulletinData);
        console.log(`Retrieved data bulletinDataObject ${JSON.stringify(bulletinDataObject, null, 2)}`)
    }
    else {
        return;
    }

    console.log(`Retrieved data bulletinDataObject ${JSON.stringify(bulletinDataObject, null, 2)}`)
    let viewBulletinItems = []
    if (bulletinDataObject.items && bulletinDataObject.items.length) {
        for (let i = 0; i < bulletinDataObject.items.length; i++) {
            let singleBulletinItem = 
            {
            "type": "TextBlock",
            "text": `• ${bulletinDataObject.items[i].content}`,
            "wrap": true
            }
            viewBulletinItems.push(singleBulletinItem);
        }
    }

    let viewActions = [];
    let deleteAction = 
    {
        "type": "Action.Submit",
        "title": "Delete this Message",
        "data": {
            "formType": "helpDelete"
        }
    };
    viewActions.push(deleteAction);


    viewInvoker = await utils.getPersonDetails(attachedForm.personId);
    console.log(`viewInvoker: ${JSON.stringify(viewInvoker, null, 2)}`);
    // If the person that chose to view this bulletin is the owner or editor
    if (viewInvoker.userName == bulletinDataObject.owner || bulletinDataObject.editors.includes(viewInvoker.userName)) {
        let editBulletinAction =
        {
            "type": "Action.Submit",
            "title": "Edit Bulletin",
            "data": {
                "formType": "editBulletinId",
                "bulletinId": `${bulletinId}`,
                "authorizedPerson": `${attachedForm.personId}`
            }
        };
        viewActions.push(editBulletinAction);
    }

    let viewBulletinCard = 
    {
        "type": "AdaptiveCard",
        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
        "version": "1.2",
        "body": [
            {
                "type": "Container",
                "items": [
                    {
                        "type": "TextBlock",
                        "text": `${bulletinDataObject.title}`,
                        "wrap": true,
                        "size": "Medium",
                        "weight": "Bolder"
                    }
                ]
            },
            {
                "type": "Container",
                "items": viewBulletinItems
            }
        ],
        "actions": viewActions
    };

    try {
        await bot.censor(attachedForm.messageId);
        await bot.sendCard(viewBulletinCard, "Bulletin");
    } catch (e) {
        console.log(e);
    }

    // And finally, TODO: Update the person's Unix timestamp in their auth file for this bulletinId.
    let authDataObject = {};
    const authFile = path.join(__dirname, 'authorization', `bulletinAuthorizations.json`);
    if (fs.existsSync(authFile)) {
        const authData = fs.readFileSync(authFile);
        authDataObject = JSON.parse(authData);
    }
    else {
        return;
    }

    // Try to update the person's timestamp
    try {
        const userAuthData = authDataObject.Viewer[viewInvoker.userName];
        for (let i = 0; i < userAuthData.length; i++) {
            if (userAuthData[i].bulletinId === bulletinId) {
                userAuthData[i].lastViewed = utils.getUnixTimestamp();
                break;
            }
        }
        fs.writeFileSync(authFile, JSON.stringify(authDataObject, null, 2));
    } catch (e) {
        console.log(e);
    }

}

// This will take a specific bulletinId and create a card to allow the user to select items, remove them, add a new one, or edit bulletin permissions
async function editBulletinId(bot, trigger, attachedForm) {
    // Retrieve personal data about the editor
    console.log(`DEBUG editBulletinId: Received form ${JSON.stringify(attachedForm,null,2)}`);
    const formData = attachedForm.inputs;
    const bulletinId = formData.bulletinId;
    const editEvoker = await utils.getPersonDetails(attachedForm.personId);
    console.log(`DEBUG editBulletinId: this person requested to edit this bulletin id: ${editEvoker.userName}, ${bulletinId}`);
    
    // Retrieve bulletin data
    let bulletinDataObject = {};
    const bulletinFile = path.join(__dirname, 'bulletins', `${bulletinId}.json`);
    if (fs.existsSync(bulletinFile)) {
        const bulletinData = fs.readFileSync(bulletinFile);
        bulletinDataObject = JSON.parse(bulletinData);
    }
    else {
        return;
    }
    // TODO: build this card with toggles for each of the options, and then create the actions that have the option to delete selected, edit permissions, or add a new item
    let editBulletinIdItems = []

    // Iterate over the 'items' array and create a toggle box for each item
    for (let i = 0; i < bulletinDataObject.items.length; i++) {
        const singleitem = bulletinDataObject.items[i];
        console.log(`DEBUG editBulletinId: adding choice for item ${singleitem.content}`);
        const toggleOption = {
            "title": singleitem.content,
            "value": singleitem.id.toString()
        };
        editBulletinIdItems.push(toggleOption);
    }

    // Build the card
    console.log(`DEBUG: editBulletinId: choices: ${JSON.stringify(editBulletinIdItems, null, 2)}`);
    let editBulletinIdCard = 
    {
        "type": "AdaptiveCard",
        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
        "version": "1.2",
        "body": [
            {
                "type": "Container",
                "items": [
                    {
                        "type": "TextBlock",
                        "text": `Editing:\n${bulletinDataObject.title}`,
                        "wrap": true,
                        "size": "Medium",
                        "weight": "Bolder"
                    }
                ]
            },
            {
                "type": "Container",
                "spacing": "Small",
                "items": [
                   {
                    "type": "Input.ChoiceSet",
                    "choices": editBulletinIdItems,
                    "isMultiSelect": true,
                    "placeholder": "Placeholder text",
                    "style": "expanded",
                    "id": "editBulletinSelectedOptions",
                   } 
                ]
            },
            {
                "type": "ActionSet",
                "spacing": "None",
                "actions": [
                    {
                        "type": "Action.Submit",
                        "title": "Delete Selected Items",
                        "id": "deleteSelectedBulletinItems",
                        "data": {
                            "formType": "deleteSelectedBulletinItems",
                            "endpoint": `${process.env.WEBHOOKURL}/submit`,
                            "trigger": `${trigger}`,
                            "bulletinId": bulletinId
                        }
                    },
                    {
                        "type": "Action.Submit",
                        "title": "Add Items to Bulletin",
                        "id": "addBulletinItemsEvoke",
                        "data": {
                            "formType": "addBulletinItemsEvoke",
                            "endpoint": `${process.env.WEBHOOKURL}/submit`,
                            "trigger": `${trigger}`,
                            "bulletinId": bulletinId
                        }
                    },
                    {
                        "type": "Action.Submit",
                        "title": "Edit Bulletin Permissions",
                        "id": "EditBulletinPerms",
                        "data": {
                            "formType": "EditBulletinPerms",
                            "endpoint": `${process.env.WEBHOOKURL}/submit`,
                            "trigger": `${trigger}`,
                            "bulletinId": bulletinId
                        }
                    }
                ]
            }
        ]
    };

    try {
        await bot.censor(attachedForm.messageId);
        await bot.sendCard(editBulletinIdCard, "EditBulletinIdCard");
    } catch (e) {
        console.log(e);
    }

}


async function addBulletinItemsEvoke(bot, trigger, attachedForm) {
    console.log(`DEBUG addBulletinItemsEvoke: Received form ${JSON.stringify(attachedForm,null,2)}`);
    const formData = attachedForm.inputs;
    const bulletinId = formData.bulletinId;
    const addItemsEvoker = await utils.getPersonDetails(attachedForm.personId);
    //console.log(`DEBUG addBulletinItemsEvoke: this person requested to add items to this bulletin id: ${editEvoker.userName}, ${bulletinId}`);

    let addBulletinItemsEvokeCard = 
    {
        "type": "AdaptiveCard",
        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
        "version": "1.3",
        "body": [
            {
                "type": "Container",
                "items": [
                    {
                        "type": "TextBlock",
                        "text": "Adding an item for:",
                        "wrap": true
                    },
                    {
                        "type": "TextBlock",
                        "text": `${await getBulletinNameFromId(bulletinId)}`,
                        "wrap": true,
                        "spacing": "None",
                        "size": "Medium",
                        "weight": "Bolder"
                    }
                ]
            },
            {
                "type": "Container",
                "items": [
                    {
                        "type": "Input.Text",
                        "placeholder": "i.e \"Call 248-434-5508 for a surprise!\"",
                        "label": "Type your new item here:",
                        "id": "newBulletinItem"
                    }
                ]
            },
            {
                "type": "ActionSet",
                "spacing": "None",
                "actions": [
                    {
                        "type": "Action.Submit",
                        "title": "Add Item",
                        "id": "submitNewBulletinIdItem",
                        "data": {
                            "formType": "submitNewBulletinIdItem",
                            "endpoint": `${process.env.WEBHOOKURL}/submit`,
                            "trigger": `${trigger}`,
                            "bulletinId": bulletinId
                        }
                    },
                    {
                        "type": "Action.Submit",
                        "title": "Add Item and Add Another Item",
                        "id": "bulletinSubmitAndContinue",
                        "data": {
                            "formType": "bulletinSubmitAndContinue",
                            "endpoint": `${process.env.WEBHOOKURL}/submit`,
                            "trigger": `${trigger}`,
                            "bulletinId": bulletinId
                        }
                    }
                ]
            }
        ]
    }

    try {
        await bot.censor(attachedForm.messageId);
        await bot.sendCard(addBulletinItemsEvokeCard, "addBulletinItemsEvokeCard");
    } catch (e) {
        console.log(e);
    }

}

// Exclusively adds item to a bulletin Id given an item in attachedForm and updates the unixLastEdited timestamp.
async function insertNewItem(bot, trigger, attachedForm) {
    console.log(`DEBUG insertNewItem: Received form ${JSON.stringify(attachedForm, null, 2)}`);
    let formData = attachedForm.inputs;
    const bulletinId = formData.bulletinId;
    const newBulletinItem = formData.newBulletinItem;

    // Opening the file
    let bulletinDataObject = {};
    const bulletinFile = path.join(__dirname, 'bulletins', `${bulletinId}.json`);
    if (fs.existsSync(bulletinFile)) {
        const bulletinData = fs.readFileSync(bulletinFile);
        bulletinDataObject = JSON.parse(bulletinData);
    }
    else {
        return;
    }

    let newItemObject = 
    {
        "id": utils.generaterandomString(),
        "content": newBulletinItem
    }

    console.log(`Adding item ${JSON.stringify(newItemObject, null, 2)} to bulletin ${bulletinId}.`)

    // Adding the item
    bulletinDataObject.items.push(newItemObject);
    // Setting new timestamp
    bulletinDataObject.unixLastEdited = utils.getUnixTimestamp.toString();

    let newItemConfirmationCard = 
    {
        "type": "AdaptiveCard",
        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
        "version": "1.3",
        "body": [
            {
                "type": "Container",
                "items": [
                    {
                        "type": "TextBlock",
                        "text": "Successfully added item to",
                        "wrap": true
                    },
                    {
                        "type": "TextBlock",
                        "text": `${await getBulletinNameFromId(bulletinId)}`,
                        "wrap": true,
                        "spacing": "None",
                        "size": "Medium",
                        "weight": "Bolder"
                    }
                ]
            },
            {
                "type": "ActionSet",
                "spacing": "None",
                "actions": [
                    {
                        "type": "Action.Submit",
                        "title": "View Updated Bulletin",
                        "id": "bulletinView",
                        "data": {
                            "formType": "bulletinView",
                            "endpoint": `${process.env.WEBHOOKURL}/submit`,
                            "trigger": `${trigger}`,
                            "bulletinId": bulletinId
                        }
                    },
                    {
                        "type": "Action.Submit",
                        "title": "Add Another Item",
                        "id": "addBulletinItemsEvoke",
                        "data": {
                            "formType": "addBulletinItemsEvoke",
                            "endpoint": `${process.env.WEBHOOKURL}/submit`,
                            "trigger": `${trigger}`,
                            "bulletinId": bulletinId
                        }
                    }
                ]
            }
        ]
    }

    try {
        fs.writeFileSync(bulletinFile, JSON.stringify(bulletinDataObject, null, 2));
        if (attachedForm.inputs.formType == "submitNewBulletinIdItem") {
            await bot.censor(attachedForm.messageId);
            await bot.sendCard(newItemConfirmationCard, "NewItemConfirmationCard");
        }
    } catch (e) {
        console.log(e);
    }

    console.log(`Successfully added item to bulletin ${bulletinId}.`);
}

async function deleteSelectedBulletinItems(bot, trigger, attachedForm) {
    console.log(`DEBUG insertNewItem: Received form ${JSON.stringify(attachedForm, null, 2)}`);
    let formData = attachedForm.inputs;
    const bulletinId = formData.bulletinId;
    const deleteSelections = formData.editBulletinSelectedOptions.split(",").map(str => str.trim());
    console.log(`DEBUG: deleteSelectedBulletinItems: deleteSelections:`, deleteSelections);

    // Opening file 
    let bulletinDataObject = {};
    const bulletinFile = path.join(__dirname, 'bulletins', `${bulletinId}.json`);
    if (fs.existsSync(bulletinFile)) {
        const bulletinData = fs.readFileSync(bulletinFile);
        bulletinDataObject = JSON.parse(bulletinData);
    }
    else {
        return;
    }

    // Filter out items with ids in deleteSelections array
    bulletinDataObject.items = bulletinDataObject.items.filter(item => !deleteSelections.includes(item.id));

    // Write updated object to file
    const updatedBulletinData = JSON.stringify(bulletinDataObject, null, 2);
    fs.writeFileSync(bulletinFile, updatedBulletinData);

    try {
        let copyTrigger = JSON.parse(JSON.stringify(trigger));
        await editBulletinId(bot, copyTrigger, attachedForm);
    } catch (e) {
        console.log(e);
    }

}

async function getBulletinNameFromId(bulletinId) {
    const bulletinFile = path.join(__dirname, 'bulletins', `${bulletinId}.json`);
    if (fs.existsSync(bulletinFile)) {
        const bulletinData = fs.readFileSync(bulletinFile);
        let bulletinDataObject = {};
        bulletinDataObject = JSON.parse(bulletinData);
        return bulletinDataObject.title;
    }
    else {
        return;
    }
}

async function newAuthorization(personId, formId, authType) {

}



module.exports = {
    bulletinEvoke: bulletinEvoke,
    bulletinCreate: bulletinCreate,
    initNewBulletin: initNewBulletin,
    editBulletinEvoke: editBulletinEvoke,
    updateViewerLists: updateViewerLists,
    printBulletin: printBulletin,
    editBulletinId: editBulletinId,
    addBulletinItemsEvoke: addBulletinItemsEvoke,
    insertNewItem: insertNewItem,
    deleteSelectedBulletinItems: deleteSelectedBulletinItems
};