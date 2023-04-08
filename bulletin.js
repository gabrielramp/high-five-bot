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
        "text": "Bulletin📜",
        "wrap": true,
        "size": "Large",
        "weight": "Bolder"
    };
    bulletinEvokeBodyBlock.push(cardTitle);

    // Building the "Quickly View your Bulletins" block
    // Get the most recently viewed bulletins for this user
    const topViewedBulletins = await getTopViewedBulletins(trigger.person.userName);
    // Build the block
    var hasTopBulletins = 0;
    let topActions = [];
    // if topViewed is not empty
    if (topViewedBulletins != null && topViewedBulletins.length > 0) {
        hasTopBulletins = 1;
        topViewedBulletins.forEach(([bulletinId, bulletinTitle]) => {
            let singleAction = 
            {
                "type": "Action.Submit",
                "title": `${bulletinTitle}`,
                "data": {
                    "bulletinId": `${bulletinId}`,
                    "formType": `bulletinView`,
                    "originalEvoker": trigger.person.id
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
            "spacing": "Default",
            "items": [
                {
                    "type": "TextBlock",
                    "text": "Quickly view your top bulletins:",
                    "wrap": true,
                    "spacing": "Medium",
                    "$when": "${$hasTopBulletins != 0}"
                },
                {
                    "type": "Container",
                    "spacing": "None",
                    "items": [
                        {
                            "type": "ActionSet",
                            "spacing": "None",
                            "actions": topActions,
                            "height": "stretch"
                        }
                    ]
                }
            ]
        };
        bulletinEvokeBodyBlock.push(topBulletinsBlock);
    }

    let actionsBlockActionSet = [];
    if (!(hasTopBulletins === 0)) {
        actionsBlockActionSet.push(
            {
                "type": "Action.Submit",
                "spacing": "None",
                "title": "View all Bulletins",
                "id": "viewAllBulletinsEvoke",
                data: {
                    "formType": "viewAllBulletinsEvoke",
                    "endpoint": `${process.env.WEBHOOKURL}/submit`,
                    "originalEvoker": trigger.person.id
                }
            }
        )
        actionsBlockActionSet.push(
            {
                "type": "Action.Submit",
                "spacing": "None",
                "title": "Create a Bulletin",
                "id": "createBulletin",
                data: {
                    "formType": "bulletinCreate",
                    "endpoint": `${process.env.WEBHOOKURL}/submit`,
                    "originalEvoker": trigger.person.id
                }
            }
        )
        actionsBlockActionSet.push(
            {
                "type": "Action.Submit",
                "spacing": "None",
                "title": "Edit a Bulletin",
                "id": "editBulletin",
                data: {
                    "formType": "editBulletinEvoke",
                    "endpoint": `${process.env.WEBHOOKURL}/submit`,
                    "originalEvoker": trigger.person.id
                }
            }
        )
    }
    else
    {
        actionsBlockActionSet.push(
            {
                "type": "Action.Submit",
                "spacing": "None",
                "title": "Create a Bulletin",
                "id": "createBulletin",
                data: {
                    "formType": "bulletinCreate",
                    "endpoint": `${process.env.WEBHOOKURL}/submit`,
                    "originalEvoker": trigger.person.id
                }
            }
        )
    }

    const actionsBlockText = hasTopBulletins === 0 ? "Get Started:" : "Bulletin some more:" 
    let actionsBlock = 
    {
        "type": "Container",
        "spacing": "Medium",
        "items": [
            {
                "type": "TextBlock",
                "text": actionsBlockText,
                "wrap": true,
                "spacing": "Medium"
            },
            {
                "type": "ActionSet",
                "spacing": "None",
                "actions": actionsBlockActionSet
            },
            {
                "type": "ActionSet",
                "spacing": "None",
                "actions": [
                    {
                        "type": "Action.Submit",
                        "title": "Cancel",
                        "id": "helpDelete",
                        "data": {
                            "formType": "helpDelete",
                            "endpoint": `${process.env.WEBHOOKURL}/submit`,
                            "originalEvoker": trigger.person.id
                        }
                    }
                ]
            }
        ]
    };
    bulletinEvokeBodyBlock.push(actionsBlock);

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

    // Evoker Check
    if (!(await utils.betterCheckEvokerClicked(attachedForm, bot))) { console.log(`Evoker check failed.`); bot.dm(attachedForm.personId, `This is someone else's card! To get started with bulletins, use the 'bulletin' command!`); return; }
    // Evoker Check End

    // formData will contain all information passed through with the submission action of the interacted Adaptive Card, so hopefully i.e formType, formTitle, formId.
    const formData = trigger.attachmentAction.inputs;

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
                        "text": "Create a Bulletin 📜",
                        "wrap": true,
                        "size": "Large",
                        "weight": "Bolder"
                    },
                    {
                        "type": "TextBlock",
                        "text": "Everyone in this Space will automatically be added as viewers.",
                        "wrap": true,
                        "size": "Small",
                        "weight": "Bolder",
                        "spacing": "None"
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
                                "placeholder": "example@cisco.com, example@cisco.com",
                                "label": "Add Editors to your Bulletin by email, separated by comma",
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
                "originalEvoker": trigger.person.id,
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

async function bulletinCreateConfirm(bot, trigger, attachedForm, bulletinId) {
    console.log(`confirming ${bulletinId}`)
    let bulletinCreateConfirmCard = 
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
                        "text": "Your bulletin,",
                        "wrap": true
                    },
                    {
                        "type": "TextBlock",
                        "text": `${await getBulletinNameFromId(bulletinId)}`,
                        "wrap": true,
                        "weight": "Bolder",
                        "size": "Medium",
                        "spacing": "None"
                    },
                    {
                        "type": "TextBlock",
                        "text": "Has successfully been created!",
                        "wrap": true,
                        "spacing": "None"
                    }
                ]
            },
            {
                
                "type": "ActionSet",
                "spacing": "None",
                "actions": [
                    {
                        "type": "Action.Submit",
                        "title": "View Bulletin",
                        "id": "bulletinView",
                        "data": {
                            "formType": "bulletinView",
                            "endpoint": `${process.env.WEBHOOKURL}/submit`,
                            "originalEvoker": trigger.person.id,
                            "bulletinId": bulletinId
                        }
                    },
                    {
                        "type": "Action.Submit",
                        "title": "Add More Items",
                        "id": "addBulletinItemsEvoke",
                        "data": {
                            "formType": "addBulletinItemsEvoke",
                            "endpoint": `${process.env.WEBHOOKURL}/submit`,
                            "originalEvoker": trigger.person.id,
                            "bulletinId": bulletinId
                        }
                    }
                ]
            }
        ]
    }

    try {
        await bot.sendCard(bulletinCreateConfirmCard, "Create Confirmation")
    } catch (e) {
        console.log(e)
    }

}

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
        viewerList: [],
        items: [
            {
                id: utils.generaterandomString(),
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
        const authFileContent = await fs.readFileSync(authFilePath);
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
    await fs.writeFile(bulletinPath, JSON.stringify(bulletinData, null, 2), (err) => {
        if (err) {
            console.error(`Error writing to file: ${err}`);
            return;
        }
        
    });
    console.log(`Bulletin file ${bulletinJson} created successfully.`);
    // Write the updated authorization data to the file.
    await fs.writeFile(authFilePath, JSON.stringify(authData, null, 2), (err) => {
        if (err) {
            console.error(`Error writing to file: ${err}`);
            return;
        }
        
    });
    console.log(`Authorization file ${authFileName} updated successfully.`);
    // Then return the new bulletinId as a success.
    try {
        await bot.censor(attachedForm.messageId);
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

    //console.log(`DEBUG:bulletinEvoke: contents of trigger: ${JSON.stringify(trigger,null,2)}`)


    // Evoker Check
    try {
        if (!(await utils.betterCheckEvokerClicked(attachedForm, bot))) { console.log(`Evoker check failed.`); bot.dm(attachedForm.personId, `This is someone else's card! To get started with bulletins, use the 'bulletin' command!`); return; }
    } catch (e) {
        console.log(e);
    }
    // Evoker Check End

    // formData will contain all information passed through with the submission action of the interacted Adaptive Card, so hopefully i.e formType, formTitle, formId.
    const formData = trigger.attachmentAction.inputs;
    const editEvoker = await utils.getPersonDetails(attachedForm.personId);
    //console.log(`DEBUG: editBulletinEvoke from ${editEvoker.userName}`)

    // Read authorization data
    const authFile = path.join(__dirname, 'authorization', `bulletinAuthorizations.json`);
    let authDataObject = {};
    if (fs.existsSync(authFile)) {
        const authData = fs.readFileSync(authFile);
        authDataObject = await JSON.parse(authData);
    }
    else {
        return;
    }

    // 1. Retrieve every 'bulletinId' that the editEvoker lists as being an "Owner" or "Editor"
    const ownerBulletins = authDataObject.Owner[editEvoker.userName] || [];
    const editorBulletins = authDataObject.Editor[editEvoker.userName] || [];
    const authorizedBulletins = [...new Set([...ownerBulletins, ...editorBulletins])];

    // 2. Sort the 'bulletinIds' in the array from most recently updated to least recently updated
    const sortedAuthorizedBulletins = await authorizedBulletins.sort(async (a, b) => {
        const bulletinAFile = path.join(__dirname, 'bulletins', `${a}.json`);
        const bulletinAData = fs.readFileSync(bulletinAFile);
        const bulletinA = JSON.parse(bulletinAData);

        const bulletinBFile = path.join(__dirname, 'bulletins', `${b}.json`);
        const bulletinBData = fs.readFileSync(bulletinBFile);
        const bulletinB = JSON.parse(bulletinBData);

        return bulletinB.unixLastEdited - bulletinA.unixLastEdited;
    }).reverse(); // reversing the array because I accidentally sorted descending instead of ascending oops
    //console.log(`DEBUG: editBulletinEvoke: Final bulletin array:`+  JSON.stringify(sortedAuthorizedBulletins,null,2));

    // 3.   After that, we want to build the Microsoft Adaptive card. First we should check how many items are in the array, so we know how many ActionSets to push into our body.

    // Build an array of names for the bulletinIds]
    let allActions = []
    let allActionSets = []
    if (!(sortedAuthorizedBulletins.length > 9)) {
        //console.log("DEBUG: editBulletinEvoke: Doing less than 9");
        // Looping for all of the bulletinIds the user has access to
        for (let i = 0; i < sortedAuthorizedBulletins.length; i++) {
            // Making that action with the title of the bulletin, and the required Id in the data
            let singleAction = 
            {
                "type": "Action.Submit",
                "title": `${await getBulletinNameFromId(sortedAuthorizedBulletins[i])}`,
                "id": `${sortedAuthorizedBulletins[i]}`,
                "data": {
                    "formType": "editBulletinId",
                    "endpoint": `${process.env.WEBHOOKURL}/submit`,
                    "originalEvoker": trigger.person.id,
                    "bulletinId": sortedAuthorizedBulletins[i]
                }
            }
            allActions.push(singleAction);
        }
        // Now we insert these actions into their ActionSets, three at a time.
        for (let i = 0; i < allActions.length; i += 3) {
            let actionSet = {
                "type": "ActionSet",
                "spacing": "None",
                "actions": allActions.slice(i, i + 3)
            };
            allActionSets.push(actionSet);
        }
        console.log(`Resulting action sets array: ${JSON.stringify(allActionSets, null, 2)}`);
    }
    // If the user needs more than one page of bulletins
    else {
        //console.log("DEBUG: editBulletinEvoke: Doing more than 9");

        // Looping for all of the bulletinIds the user has access to
        for (let i = 0; i < 9; i++) {
            // Making that action with the title of the bulletin, and the required Id in the data
            let singleAction = 
            {
                "type": "Action.Submit",
                "title": `${await getBulletinNameFromId(sortedAuthorizedBulletins[i])}`,
                "id": `${sortedAuthorizedBulletins[i]}`,
                "data": {
                    "formType": "editBulletinId",
                    "endpoint": `${process.env.WEBHOOKURL}/submit`,
                    "originalEvoker": trigger.person.id,
                    "bulletinId": sortedAuthorizedBulletins[i]
                }
            }
            allActions.push(singleAction);
        }

        // And then we'll push those into the ActionSets.
        for (let i = 0; i < allActions.length; i += 3) {
            let actionSet = {
                "type": "ActionSet",
                "spacing": "None",
                "actions": allActions.slice(i, i + 3)
            };
            allActionSets.push(actionSet);
        }

        sortedAuthorizedBulletins.splice(0, 9).join(',');
        //console.log("DEBUG: editBulletinsEvoke: remaining bulletins: " + sortedAuthorizedBulletins);
        // We first want to create a 'next page' module
        let nextPageModule = {
            "type": "ActionSet",
            "spacing": "Large",
            "actions": [
                {
                    "type": "Action.Submit",
                    "title": `Next Page`,
                    "id": `nextEditViewall`,
                    "data": {
                        "formType": "nextEditViewall",
                        "endpoint": `${process.env.WEBHOOKURL}/submit`,
                        "originalEvoker": trigger.person.id,
                        "remainingBulletins": `${sortedAuthorizedBulletins}`
                    }
                }
            ]
        };

        // Finally, we push the 'Next Page' actionset into the card.
        allActionSets.push(nextPageModule);
    }

    
    let editEvokeCard = 
    {
        "type": "AdaptiveCard",
        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
        "version": "1.3",
        "body": [
            {
                "type": "TextBlock",
                "spacing": "None",
                "text": "Select a Bulletin to Edit 📝",
                "size": "Large",
                "weight": "Bolder"
            },
            {
                "type": "Container",
                "spacing": "Medium",
                "items": allActionSets
            }
        ]
    };

    try {
        await bot.censor(attachedForm.messageId);
        await bot.sendCard(editEvokeCard, "editEvokeCard");
    } catch (e) {
        console.log(e)
    }
}

async function nextEditViewall(bot, trigger, attachedForm) {

    // Evoker Check
    try {
        if (!(await utils.betterCheckEvokerClicked(attachedForm, bot))) { console.log(`Evoker check failed.`); bot.dm(attachedForm.personId, `This is someone else's card! To get started with bulletins, use the 'bulletin' command!`); return; }
    } catch (e) {
        console.log(e)
    }
    // Evoker Check End

    const formData = trigger.attachmentAction.inputs;

    // Already-sorted bulletinIds that the user has access to viewing that just needs to be printed
    let remainingBulletinIds = formData.remainingBulletins;

    console.log(remainingBulletinIds);
    remainingBulletinIds = remainingBulletinIds.split(',')

    let allActions = []
    let allActionSets = []
    if (!(remainingBulletinIds.length > 9)) {
        //console.log("DEBUG: nextEditViewall: Doing less than 9");
        // Looping for all of the bulletinIds the user has access to
        for (let i = 0; i < remainingBulletinIds.length; i++) {
            // Making that action with the title of the bulletin, and the required Id in the data
            let singleAction = 
            {
                "type": "Action.Submit",
                "title": `${await getBulletinNameFromId(remainingBulletinIds[i])}`,
                "id": `${remainingBulletinIds[i]}`,
                "data": {
                    "formType": "editBulletinId",
                    "endpoint": `${process.env.WEBHOOKURL}/submit`,
                    "originalEvoker": trigger.person.id,
                    "bulletinId": remainingBulletinIds[i]
                }
            }
            allActions.push(singleAction);
        }
        // Now we insert these actions into their ActionSets, three at a time.
        for (let i = 0; i < allActions.length; i += 3) {
            let actionSet = {
                "type": "ActionSet",
                "spacing": "None",
                "actions": allActions.slice(i, i + 3)
            };
            allActionSets.push(actionSet);
        }
        console.log(`Resulting action sets array: ${JSON.stringify(allActionSets, null, 2)}`);
    }
    // If the user needs more than one page of bulletins
    else {
        //console.log("DEBUG: nextEditViewall: Doing more than 9");

        // Looping for all of the bulletinIds the user has access to
        for (let i = 0; i < 9; i++) {
            // Making that action with the title of the bulletin, and the required Id in the data
            let singleAction = 
            {
                "type": "Action.Submit",
                "title": `${await getBulletinNameFromId(remainingBulletinIds[i])}`,
                "id": `${remainingBulletinIds[i]}`,
                "data": {
                    "formType": "editBulletinId",
                    "endpoint": `${process.env.WEBHOOKURL}/submit`,
                    "originalEvoker": trigger.person.id,
                    "bulletinId": remainingBulletinIds[i]
                }
            }
            allActions.push(singleAction);
        }

        // And then we'll push those into the ActionSets.
        for (let i = 0; i < allActions.length; i += 3) {
            let actionSet = {
                "type": "ActionSet",
                "spacing": "None",
                "actions": allActions.slice(i, i + 3)
            };
            allActionSets.push(actionSet);
        }

        remainingBulletinIds.splice(0, 9).join(',');
        //console.log("DEBUG: nextEditViewall: remaining bulletins: " + remainingBulletinIds);
        // We first want to create a 'next page' module
        let nextPageModule = {
            "type": "ActionSet",
            "spacing": "Large",
            "actions": [
                {
                    "type": "Action.Submit",
                    "title": `Next Page`,
                    "id": `nextEditViewall`,
                    "data": {
                        "formType": "nextEditViewall",
                        "endpoint": `${process.env.WEBHOOKURL}/submit`,
                        "originalEvoker": trigger.person.id,
                        "remainingBulletins": `${remainingBulletinIds}`
                    }
                }
            ]
        };

        // Finally, we push the 'Next Page' actionset into the card.
        allActionSets.push(nextPageModule);
    }

    let nextEditViewallCard = 
    {
        "type": "AdaptiveCard",
        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
        "version": "1.3",
        "body": [
            {
                "type": "TextBlock",
                "spacing": "None",
                "text": "Select a Bulletin to Edit 📝",
                "size": "Large",
                "weight": "Bolder"
            },
            {
                "type": "Container",
                "spacing": "Small",
                "items": allActionSets
            }
        ]
    };

    try {
        await bot.censor(attachedForm.messageId);
        await bot.sendCard(nextEditViewallCard, "nextEditViewall");
    } catch (e) {
        console.log(e)
    }
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

    // Evoker Check
    try {
        if (!(await utils.betterCheckEvokerClicked(attachedForm, bot))) { console.log(`Evoker check failed.`); bot.dm(attachedForm.personId, `This is someone else's card! To get started with bulletins, use the 'bulletin' command!`); return; }
    } catch (e) {
        console.log (e);
    }
    // Evoker Check End

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
            "size": "Medium",
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
        "title": "Delete This Message",
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
                "authorizedPerson": `${attachedForm.personId}`,
                "originalEvoker": trigger.person.id
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
            },
            {
                "type": "ActionSet",
                "spacing": "Small",
                "actions": viewActions
            }
        ]
    };

    try {
        await bot.censor(attachedForm.messageId);
        await bot.sendCard(viewBulletinCard, "Bulletin");
    } catch (e) {
        console.log(e);
    }

    // And finally, update the person's Unix timestamp in their auth file for this bulletinId.
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

    // Evoker Check
    try {
        if (!(await utils.betterCheckEvokerClicked(attachedForm, bot))) { console.log(`Evoker check failed.`); bot.dm(attachedForm.personId, `This is someone else's card! To get started with bulletins, use the 'bulletin' command!`); return; }
    } catch (e) {
        console.log(e)
    }
    // Evoker Check End

    // Retrieve personal data about the editor
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

    let editBulletinIdItems = []

    // Iterate over the 'items' array and create a toggle box for each item
    for (let i = 0; i < bulletinDataObject.items.length; i++) {
        const singleitem = bulletinDataObject.items[i];
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
                        "text": `Editing Bulletin 📝`,
                        "wrap": true,
                        "size": "Large",
                        "weight": "Bolder"
                    },
                    {
                        "type": "TextBlock",
                        "text": `${bulletinDataObject.title}`,
                        "wrap": true,
                        "spacing": "Medium",
                        "size": "Medium",
                        "weight": "Bolder"
                    }
                ]
            },
            {
                "type": "Container",
                "spacing": "None",
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
                "spacing": "Small",
                "actions": [
                    {
                        "type": "Action.Submit",
                        "title": "Delete Selected Items",
                        "id": "deleteSelectedBulletinItems",
                        "data": {
                            "formType": "deleteSelectedBulletinItems",
                            "endpoint": `${process.env.WEBHOOKURL}/submit`,
                            "originalEvoker": trigger.person.id,
                            "bulletinId": bulletinId
                        }
                    },
                    {
                        "type": "Action.Submit",
                        "title": "Add Items to Bulletin",
                        "id": "addBulletinItemsEvoke",
                        data: {
                            "formType": "addBulletinItemsEvoke",
                            "endpoint": `${process.env.WEBHOOKURL}/submit`,
                            "originalEvoker": trigger.person.id,
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
                            "originalEvoker": trigger.person.id,
                            "bulletinId": bulletinId
                        }
                    }
                ]
            },
            {
                "type": "ActionSet",
                "spacing": "None",
                "actions": [
                    {
                        "type": "Action.Submit",
                        "title": "Cancel",
                        "id": "helpDelete",
                        "data": {
                            "formType": "helpDelete",
                            "endpoint": `${process.env.WEBHOOKURL}/submit`,
                            "originalEvoker": trigger.person.id,
                        }
                    },
                    {
                        "type": "Action.Submit",
                        "title": "Delete this Bulletin",
                        "id": "destroyBulletin",
                        "data": {
                            "formType": "destroyBulletin",
                            "endpoint": `${process.env.WEBHOOKURL}/submit`,
                            "originalEvoker": trigger.person.id,
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

    // Evoker Check
    if (!(await utils.betterCheckEvokerClicked(attachedForm, bot))) { console.log(`Evoker check failed.`); bot.dm(attachedForm.personId, `This is someone else's card! To get started with bulletins, use the 'bulletin' command!`); return; }
    // Evoker Check End

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
                        "text": "Add an Item 📝",
                        "wrap": true,
                        "weight": "Bolder",
                        "size": "Large"
                    },
                    {
                        "type": "TextBlock",
                        "text": `${await getBulletinNameFromId(bulletinId)}`,
                        "wrap": true,
                        "spacing": "Medium",
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
                        "type": "Input.Text",
                        "placeholder": "i.e \"Call 248-434-5508 for a surprise!\"",
                        "label": "Type your new item here:",
                        "id": "newBulletinItem",
                        "isMultiline": true
                    }
                ]
            },
            {
                "type": "ActionSet",
                "spacing": "Medium",
                "actions": [
                    {
                        "type": "Action.Submit",
                        "title": "Cancel",
                        "id": "helpDelete",
                        "data": {
                            "formType": "helpDelete",
                            "endpoint": `${process.env.WEBHOOKURL}/submit`,
                            "originalEvoker": trigger.person.id,
                            "bulletinId": bulletinId
                        }
                    },
                    {
                        "type": "Action.Submit",
                        "title": "Add Item",
                        "id": "submitNewBulletinIdItem",
                        "data": {
                            "formType": "submitNewBulletinIdItem",
                            "endpoint": `${process.env.WEBHOOKURL}/submit`,
                            "originalEvoker": trigger.person.id,
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
                            "originalEvoker": trigger.person.id,
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

    // Evoker Check
    if (!(await utils.betterCheckEvokerClicked(attachedForm, bot))) { console.log(`Evoker check failed.`); bot.dm(attachedForm.personId, `This is someone else's card! To get started with bulletins, use the 'bulletin' command!`); return; }
    // Evoker Check End

    //console.log(`DEBUG insertNewItem: Received form ${JSON.stringify(attachedForm, null, 2)}`);
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
    //console.log(`DEBUG: InsertNewItem: Old Unix Timestamp: ${bulletinDataObject.unixLastEdited}`);
    const tempTimestamp = utils.getUnixTimestamp();
    bulletinDataObject.unixLastEdited = tempTimestamp;
    //console.log(`DEBUG: InsertNewItem: New Unix Timestamp: ${bulletinDataObject.unixLastEdited}`);

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
                            "originalEvoker": trigger.person.id,
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
                            "originalEvoker": trigger.person.id,
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

async function editPermissionsEvoke(bot, trigger, attachedForm) {

    // Evoker Check
    if (!(await utils.betterCheckEvokerClicked(attachedForm, bot))) { console.log(`Evoker check failed.`); bot.dm(attachedForm.personId, `This is someone else's card! To get started with bulletins, use the 'bulletin' command!`); return; }
    // Evoker Check End

    const formData = trigger.attachmentAction.inputs;
    const bulletinId = formData.bulletinId;

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

    
    let bulletinEditors = []

    let editorsList = 
    {
        "type": "Container",
        "items": [
            {
                "type": "TextBlock",
                "text": "Current Editors:"
            },
            {
                "type": "Input.ChoiceSet",
                "spacing": "None",
                "choices": bulletinEditors,
                "isMultiSelect": true,
                "placeholder": "Placeholder text",
                "style": "expanded",
                "id": "bulletinEditorsChoiceSet",
            } 
        ]
    }

    // Iterate over the 'items' array and create a toggle box for each item

    let actionsSetList = []
    console.log(`DEBUG: editPermissionsEvoke: Editors array:`+bulletinDataObject.editors)
    if (bulletinDataObject.editors.length > 0) {
        for (let i = 0; i < bulletinDataObject.editors.length; i++) {
            const singleeditor = bulletinDataObject.editors[i];
            console.log(`DEBUG: editPermissionsEvoke: Found editor in array ${bulletinDataObject.editors[i]}`);
            const toggleOption = {
                "title": bulletinDataObject.editors[i],
                "value": bulletinDataObject.editors[i]
            };
            bulletinEditors.push(toggleOption);
        }
        actionsSetList = 
        [
            {
                "type": "Action.Submit",
                "title": `Add Editors`,
                "data": {
                    "bulletinId": `${bulletinId}`,
                    "formType": `addEditorsEvoke`,
                    "originalEvoker": trigger.person.id,
                }
            },
            {
                "type": "Action.Submit",
                "title": `Remove Selected Editors`,
                "data": {
                    "bulletinId": `${bulletinId}`,
                    "formType": `removeSelectedEditors`,
                    "originalEvoker": trigger.person.id,
                }
            },
            {
                "type": "Action.Submit",
                "title": `Add Viewers`,
                "data": {
                    "bulletinId": `${bulletinId}`,
                    "formType": `addViewersEvoke`,
                    "originalEvoker": trigger.person.id,
                }
            }
        ]
    }
    else {
        editorsList = { "type": "Container", "spacing": "None", "items": [{"type": "TextBlock", "text": "There are currently no additional editors for this Bulletin."}]};
        actionsSetList = 
        [
            {
                "type": "Action.Submit",
                "title": `Add Editors`,
                "data": {
                    "bulletinId": `${bulletinId}`,
                    "formType": `addEditorsEvoke`,
                    "originalEvoker": trigger.person.id,
                }
            },
            {
                "type": "Action.Submit",
                "title": `Add Viewers`,
                "data": {
                    "bulletinId": `${bulletinId}`,
                    "formType": `addViewersEvoke`,
                    "originalEvoker": trigger.person.id,
                }
            }
        ]
    }

    let editPermissionsEvoke = 
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
                        "text": `Edit Permissions 📝`,
                        "wrap": true,
                        "size": "Large",
                        "weight": "Bolder"
                    },
                    {
                        "type": "TextBlock",
                        "text": `${await getBulletinNameFromId(bulletinId)}`,
                        "weight": "Bolder",
                        "size": "Medium",
                        "spacing": "Medium"
                    }
                ]
            },
            editorsList,
            {
                "type": "ActionSet",
                "spacing": "Small",
                "actions": actionsSetList
            }
        ],
        "actions": [
            {
                "type": "Action.Submit",
                "title": `Cancel`,
                "data": {
                    "bulletinId": `${bulletinId}`,
                    "formType": `helpDelete`
                }
            }
        ]
    }

    try {
        await bot.censor(attachedForm.messageId);
        await bot.sendCard(editPermissionsEvoke, "editPermissionsEvoke");
    } catch (e) {
        console.log(e);
    }
}

async function addViewersEvoke(bot, trigger, attachedForm) {

    // Evoker Check
    if (!(await utils.betterCheckEvokerClicked(attachedForm, bot))) { console.log(`Evoker check failed.`); bot.dm(attachedForm.personId, `This is someone else's card! To get started with bulletins, use the 'bulletin' command!`); return; }
    // Evoker Check End

    const formData = trigger.attachmentAction.inputs;
    const bulletinId = formData.bulletinId;

    let addViewersEvokeCard = 
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
                        "text": `Add a Viewer 📝`,
                        "wrap": true,
                        "size": "Large",
                        "weight": "Bolder"
                    },
                    {
                        "type": "TextBlock",
                        "text": `${await getBulletinNameFromId(bulletinId)}`,
                        "wrap": true,
                        "spacing": "Medium",
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
                        "placeholder": "example@cisco.com",
                        "label": "Type your additional viewer\''s Webex email:",
                        "id": "newViewerStringInput"
                    }
                ]
            },
            {
                "type": "ActionSet",
                "spacing": "None",
                "actions": [
                    {
                        "type": "Action.Submit",
                        "title": "Add Viewer",
                        "id": "newViewerString",
                        "data": {
                            "formType": "newViewerString",
                            "endpoint": `${process.env.WEBHOOKURL}/submit`,
                            "originalEvoker": trigger.person.id,
                            "bulletinId": bulletinId
                        }
                    },
                    {
                        "type": "Action.Submit",
                        "title": "Add Viewer and Add Another Viewer",
                        "id": "newViewerStringandContinue",
                        "data": {
                            "formType": "newViewerStringandContinue",
                            "endpoint": `${process.env.WEBHOOKURL}/submit`,
                            "originalEvoker": trigger.person.id,
                            "bulletinId": bulletinId
                        }
                    }
                ]
            }
        ]
    }

    try {
        await bot.censor(attachedForm.messageId);
        await bot.sendCard(addViewersEvokeCard, "Add Viewers Card");
    } catch (e) {
        console.log(e);
    }
}

async function addViewerToBulletin(bot, trigger, attachedForm) {

    // Evoker Check
    if (!(await utils.betterCheckEvokerClicked(attachedForm, bot))) { console.log(`Evoker check failed.`); bot.dm(attachedForm.personId, `This is someone else's card! To get started with bulletins, use the 'bulletin' command!`); return; }
    // Evoker Check End

    const formData = trigger.attachmentAction.inputs;
    const bulletinId = formData.bulletinId;
    const newViewer = formData.newViewerStringInput;
    
    // Add them to the auth file
    // Opening the authorization file
    const authFile = path.join(__dirname, 'authorization', `bulletinAuthorizations.json`);
    let authDataObject = {};
    if (fs.existsSync(authFile)) {
        const authData = fs.readFileSync(authFile);
        authDataObject = await JSON.parse(authData);
    }
    else {
        return;
    }

    // Checking that the inputted viewer is a valid email address
    const isValidEmail = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/g.test(newViewer);
    if (isValidEmail) {
        // If it is, then we push the new object into the auth file.
        let newViewerObject = 
        {
            "bulletinId": bulletinId,
            "lastViewed": utils.getUnixTimestamp()
        };

        if (authDataObject.Viewer[newViewer]) {
            // Check if bulletinId already exists in the array
            const bulletinExists = authDataObject.Viewer[newViewer].some(
                (obj) => obj.bulletinId === bulletinId
            );
            if (bulletinExists) {
                console.log(`The bulletin with ID ${bulletinId} already exists for ${newViewer}`);
                return;
            } else {
                authDataObject.Viewer[newViewer].push(newViewerObject);
                console.log(`The bulletin with ID ${bulletinId} has been added for ${newViewer}`);
            }
        }
        else {
            authDataObject.Viewer[newViewer] = [newViewerObject]
        }
        // Then write back to the file
        try {fs.writeFileSync(authFile, JSON.stringify(authDataObject,null,2));} catch (e) {console.log(e)}
    }
    else {
        bot.say("Sorry! That wasn't a valid email. Please try again. Here's what you typed: " + newViewer);
        return;
    }

    bot.say(`Viewer ${newViewer} successfully added to bulletin!`)
    
}

async function addEditorsEvoke(bot, trigger, attachedForm) {

    // Evoker Check
    try {
        if (!(await utils.betterCheckEvokerClicked(attachedForm, bot))) { console.log(`Evoker check failed.`); bot.dm(attachedForm.personId, `This is someone else's card! To get started with bulletins, use the 'bulletin' command!`); return; }
    } catch (e) {
        console.log(e)
    }
    // Evoker Check End

    const formData = trigger.attachmentAction.inputs;
    const bulletinId = formData.bulletinId;

    let addEditorsEvokeCard = 
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
                        "text": "Add an Editor 📝",
                        "wrap": true,
                        "size": "Large",
                        "weight": "Bolder"
                    },
                    {
                        "type": "TextBlock",
                        "text": `${await getBulletinNameFromId(bulletinId)}`,
                        "wrap": true,
                        "spacing": "Medium",
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
                        "placeholder": "example@cisco.com",
                        "label": "Type your authorized editor\'s Webex email:",
                        "id": "newEditorStringInput"
                    }
                ]
            },
            {
                "type": "ActionSet",
                "spacing": "None",
                "actions": [
                    {
                        "type": "Action.Submit",
                        "title": "Add Editor",
                        "id": "newEditorString",
                        "data": {
                            "formType": "newEditorString",
                            "endpoint": `${process.env.WEBHOOKURL}/submit`,
                            "originalEvoker": trigger.person.id,
                            "bulletinId": bulletinId
                        }
                    },
                    {
                        "type": "Action.Submit",
                        "title": "Add Editor and Add Another Editor",
                        "id": "newEditorStringandContinue",
                        "data": {
                            "formType": "newEditorStringandContinue",
                            "endpoint": `${process.env.WEBHOOKURL}/submit`,
                            "originalEvoker": trigger.person.id,
                            "bulletinId": bulletinId
                        }
                    }
                ]
            }
        ]
    }

    try {
        await bot.censor(attachedForm.messageId);
        await bot.sendCard(addEditorsEvokeCard, "Add Editors Card");
    } catch (e) {
        console.log(e);
    }
}

async function addEditorToBulletin(bot, trigger, attachedForm) {

    // Evoker Check
    if (!(await utils.betterCheckEvokerClicked(attachedForm, bot))) { console.log(`Evoker check failed.`); bot.dm(attachedForm.personId, `This is someone else's card! To get started with bulletins, use the 'bulletin' command!`); return; }
    // Evoker Check End

    const formData = trigger.attachmentAction.inputs;
    const bulletinId = formData.bulletinId;
    const newEditor = formData.newEditorStringInput;

    let bulletinDataObject = {};
    const bulletinFile = path.join(__dirname, 'bulletins', `${bulletinId}.json`);
    if (fs.existsSync(bulletinFile)) {
        const bulletinData = fs.readFileSync(bulletinFile);
        bulletinDataObject = JSON.parse(bulletinData);
    }
    else {
        return;
    }

    const isValidEmail = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/g.test(newEditor);
    if (isValidEmail) {
        if (!bulletinDataObject.editors.includes(newEditor)) {
            bulletinDataObject.editors.push(newEditor);
        }
        else {
            return;
        }
        try {fs.writeFileSync(bulletinFile, JSON.stringify(bulletinDataObject,null,2));} catch (e) {console.log(e)}
    }
    else {
        bot.say("Sorry! That wasn't a valid email. Please try again. Here's what you typed: " + newEditor);
        return;
    }

    // Add them to the auth file as well
    // Opening the authorization file
    const authFile = path.join(__dirname, 'authorization', `bulletinAuthorizations.json`);
    let authDataObject = {};
    if (fs.existsSync(authFile)) {
        const authData = fs.readFileSync(authFile);
        authDataObject = await JSON.parse(authData);
    }
    else {
        return;
    }

    // Append their authorization with this formId
    if (!authDataObject.Editor[newEditor]) {
        authDataObject.Editor[newEditor] = [bulletinId];
    } else {
        authDataObject.Editor[newEditor].push(bulletinId);
    }
    
    // Then write back to the file
    try {fs.writeFileSync(authFile, JSON.stringify(authDataObject,null,2));} catch (e) {console.log(e)}

    
}

async function removeEditorsFromBulletin(bot, trigger, attachedForm) {

    // Evoker Check
    if (!(await utils.betterCheckEvokerClicked(attachedForm, bot))) { console.log(`Evoker check failed.`); bot.dm(attachedForm.personId, `This is someone else's card! To get started with bulletins, use the 'bulletin' command!`); return; }
    // Evoker Check End

    const formData = trigger.attachmentAction.inputs;
    const bulletinId = formData.bulletinId;
    const removeEditorsArray = formData.bulletinEditorsChoiceSet.split(',');

    let bulletinDataObject = {};
    const bulletinFile = path.join(__dirname, 'bulletins', `${bulletinId}.json`);
    if (fs.existsSync(bulletinFile)) {
        const bulletinData = fs.readFileSync(bulletinFile);
        bulletinDataObject = JSON.parse(bulletinData);
    }
    else {
        return;
    }

    bulletinDataObject.editors = bulletinDataObject.editors.filter((editor) => !removeEditorsArray.includes(editor));

    try {fs.writeFileSync(bulletinFile, JSON.stringify(bulletinDataObject,null,2));} catch (e) {console.log(e)}

    // Removing them from the auth file as well
    // Opening the authorization file
    const authFile = path.join(__dirname, 'authorization', `bulletinAuthorizations.json`);
    let authDataObject = {};
    if (fs.existsSync(authFile)) {
        const authData = fs.readFileSync(authFile);
        authDataObject = await JSON.parse(authData);
    }
    else {
        return;
    }

    // Then filtering
    for (let i = 0; i < removeEditorsArray.length; i++) {
        const editorEmail = removeEditorsArray[i];
        if (authDataObject.Editor.hasOwnProperty(editorEmail)) {
          authDataObject.Editor[editorEmail] = authDataObject.Editor[editorEmail].filter((bulletin) => bulletin !== bulletinId);
        }
      }
    
    try {fs.writeFileSync(authFile, JSON.stringify(authDataObject,null,2));} catch (e) {console.log(e)}

}

async function destroyBulletinEvoke(bot, trigger, attachedForm) {

    // Evoker Check
    if (!(await utils.betterCheckEvokerClicked(attachedForm, bot))) { console.log(`Evoker check failed.`); bot.dm(attachedForm.personId, `This is someone else's card! To get started with bulletins, use the 'bulletin' command!`); return; }
    // Evoker Check End

    const formData = trigger.attachmentAction.inputs;
    const bulletinId = formData.bulletinId;
    
    let destroyBulletinEvokeCard =
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
                        "text": "You are attempting to delete the bulletin",
                        "wrap": true
                    },
                    {
                        "type": "TextBlock",
                        "text": `${await getBulletinNameFromId(bulletinId)}`,
                        "wrap": true,
                        "weight": "Bolder",
                        "size": "Medium",
                        "spacing": "None"
                    },
                    {
                        "type": "TextBlock",
                        "text": "Are you sure you want to continue?",
                        "wrap": true,
                        "spacing": "None"
                    }
                ]
            },
            {
                "type": "ActionSet",
                "spacing": "None",
                "actions": [
                    {
                        "type": "Action.Submit",
                        "title": "No, take me back.",
                        "id": "editBulletinId",
                        "data": {
                            "formType": "editBulletinId",
                            "endpoint": `${process.env.WEBHOOKURL}/submit`,
                            "originalEvoker": trigger.person.id,
                            "bulletinId": bulletinId
                        }
                    },
                    {
                        "type": "Action.Submit",
                        "title": "Yes, delete this Bulletin",
                        "id": "nukeBulletin",
                        "data": {
                            "formType": "nukeBulletin",
                            "endpoint": `${process.env.WEBHOOKURL}/submit`,
                            "originalEvoker": trigger.person.id,
                            "bulletinId": bulletinId,
                            "oldBulletinName": `${await getBulletinNameFromId(bulletinId)}`
                        }
                    }
                ]
            }
        ]
    }

    try {
        await bot.censor(attachedForm.messageId);
        await bot.sendCard(destroyBulletinEvokeCard, "destroyBulletinEvokeCard");
    } catch (e) {
        console.log(e);
    }

}

async function nukeBulletin(bot, trigger, attachedForm) {

    // Evoker Check
    if (!(await utils.betterCheckEvokerClicked(attachedForm, bot))) { console.log(`Evoker check failed.`); bot.dm(attachedForm.personId, `This is someone else's card! To get started with bulletins, use the 'bulletin' command!`); return; }
    // Evoker Check End

    // Remove every instance of this BulletinId from the authorization files. This is imperative to be done seamlessly such that the file continues to function seamlessly as if the bulletin never existed.
    const formData = trigger.attachmentAction.inputs;
    const bulletinId = formData.bulletinId;
    const oldBulletinName = formData.oldBulletinName;
    
    const authFile = path.join(__dirname, 'authorization', `bulletinAuthorizations.json`);
    let authDataObject = {};
    if (fs.existsSync(authFile)) {
        const authData = fs.readFileSync(authFile);
        authDataObject = await JSON.parse(authData);
    }
    else {
        return;
    }

    // Remove bulletinId from "Owner" object arrays
    Object.keys(authDataObject.Owner).forEach((user) => {
        authDataObject.Owner[user] = authDataObject.Owner[user].filter((id) => id !== bulletinId);
    });

    // Remove bulletinId from "Editor" object arrays
    Object.keys(authDataObject.Editor).forEach((user) => {
        authDataObject.Editor[user] = authDataObject.Editor[user].filter((id) => id !== bulletinId);
    });

    // Remove bulletinId from "Viewer" object arrays
    Object.keys(authDataObject.Viewer).forEach((user) => {
        authDataObject.Viewer[user] = authDataObject.Viewer[user].map((obj) => {
        if (typeof obj === "string") {
            // If obj is a string, check if it matches the bulletinId to be removed
            return obj === bulletinId ? null : obj;
        } else {
            // If obj is an object, check if it has the bulletinId to be removed
            return obj.bulletinId === bulletinId ? null : obj;
        }
        }).filter((obj) => obj !== null);
    });

    // Write the updated authDataObject to the file
    try {
        fs.writeFileSync(authFile, JSON.stringify(authDataObject, null, 2));
    } catch (e) {
        console.log(e)
    }
    

    // Now to delete the bulletin file
    let bulletinDataObject = {};
    const bulletinFile = path.join(__dirname, 'bulletins', `${bulletinId}.json`);
    if (fs.existsSync(bulletinFile)) {
        try {fs.unlinkSync(bulletinFile)} catch (e) {console.log(e)}
    }
    else {
        return;
    }

    let successfullyDeletedCard = 
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
                        "text": "Your bulletin,",
                        "wrap": true
                    },
                    {
                        "type": "TextBlock",
                        "text": `${oldBulletinName}`,
                        "wrap": true,
                        "weight": "Bolder",
                        "size": "Medium",
                        "spacing": "None"
                    },
                    {
                        "type": "TextBlock",
                        "text": "Has successfully been deleted.",
                        "wrap": true,
                        "spacing": "None"
                    }
                ]
            }
        ]
    }

    try {
        await bot.censor(attachedForm.messageId);
        await bot.sendCard(successfullyDeletedCard, "successfullyDeletedCard");
    } catch (e) {
        console.log(e);
    }
}

async function viewAllBulletinsEvoke(bot, trigger, attachedForm) {

    // Evoker Check
    if (!(await utils.betterCheckEvokerClicked(attachedForm, bot))) { console.log(`Evoker check failed.`); bot.dm(attachedForm.personId, `This is someone else's card! To get started with bulletins, use the 'bulletin' command!`); return; }
    // Evoker Check End

    // formData will contain all information passed through with the submission action of the interacted Adaptive Card, so hopefully i.e formType, formTitle, formId.
    const formData = trigger.attachmentAction.inputs;
    const viewEvoker = await utils.getPersonDetails(attachedForm.personId);

    // Read authorization data
    const authFile = path.join(__dirname, 'authorization', `bulletinAuthorizations.json`);
    let authDataObject = {};
    if (fs.existsSync(authFile)) {
        const authData = fs.readFileSync(authFile);
        authDataObject = await JSON.parse(authData);
    }
    else {
        return;
    }

    // Retrieve bulletinIds for user in Viewer role and sort by lastViewed timestamp
    const viewerBulletins = authDataObject['Viewer'][viewEvoker.userName];
    if (!viewerBulletins) {
        return [];
    }
    const sortedBulletins = viewerBulletins.sort((a, b) => b.lastViewed - a.lastViewed).map((bulletin) => bulletin.bulletinId);

    // Convert the array to a string array of sorted bulletinIds
    const sortedAuthorizedBulletins = sortedBulletins.map((bulletin) => bulletin.toString());

    // Do something with the sortedViewableBulletins array
    console.log("DEBUG: viewAllBulletinsEvoke: Resulting sorted bulletinIds:" + sortedAuthorizedBulletins);
    console.log("DEBUG: viewAllBulletinsEvoke: Number of bulletins attempting to display:" + sortedAuthorizedBulletins.length);

    // TODO:
    /*
        If the amount of bulletins that someone has exceeds 8 bulletins, then we want to: 
        1. Only display 9 bulletins, then
        2. Attach the 'pagesModule' which will have a separator and have the button: 'Next Page'.
        3. When 'nextPageViewall' is sent, then we want to call a function that does the same thing but shows the next 9 bulletins instead.
    */

    // Now we build the actions of the card. The actions will consist of all of the bulletin names that the user has access to, and a 'next page' button if they have more than 9.
    // If the user just needs one page of bulletins

    let allActions = []
    let allActionSets = []
    if (!(sortedAuthorizedBulletins.length > 9)) {
        console.log("DEBUG: viewAllBulletinsEvoke: Doing less than 9");
        // Looping for all of the bulletinIds the user has access to
        for (let i = 0; i < sortedAuthorizedBulletins.length; i++) {
            // Making that action with the title of the bulletin, and the required Id in the data
            let singleAction = 
            {
                "type": "Action.Submit",
                "title": `${await getBulletinNameFromId(sortedAuthorizedBulletins[i])}`,
                "id": `${sortedAuthorizedBulletins[i]}`,
                "data": {
                    "formType": "bulletinView",
                    "endpoint": `${process.env.WEBHOOKURL}/submit`,
                    "originalEvoker": trigger.person.id,
                    "bulletinId": sortedAuthorizedBulletins[i]
                }
            }
            allActions.push(singleAction);
        }
        // Now we insert these actions into their ActionSets, three at a time.
        for (let i = 0; i < allActions.length; i += 3) {
            let actionSet = {
                "type": "ActionSet",
                "spacing": "None",
                "actions": allActions.slice(i, i + 3)
            };
            allActionSets.push(actionSet);
        }
        console.log(`Resulting action sets array: ${JSON.stringify(allActionSets, null, 2)}`);
    }
    // If the user needs more than one page of bulletins
    else {
        console.log("DEBUG: viewAllBulletinsEvoke: Doing more than 9");

        // Looping for all of the bulletinIds the user has access to
        for (let i = 0; i < 9; i++) {
            // Making that action with the title of the bulletin, and the required Id in the data
            let singleAction = 
            {
                "type": "Action.Submit",
                "title": `${await getBulletinNameFromId(sortedAuthorizedBulletins[i])}`,
                "id": `${sortedAuthorizedBulletins[i]}`,
                "data": {
                    "formType": "bulletinView",
                    "endpoint": `${process.env.WEBHOOKURL}/submit`,
                    "originalEvoker": trigger.person.id,
                    "bulletinId": sortedAuthorizedBulletins[i]
                }
            }
            allActions.push(singleAction);
        }

        // And then we'll push those into the ActionSets.
        for (let i = 0; i < allActions.length; i += 3) {
            let actionSet = {
                "type": "ActionSet",
                "spacing": "None",
                "actions": allActions.slice(i, i + 3)
            };
            allActionSets.push(actionSet);
        }

        sortedAuthorizedBulletins.splice(0, 9).join(',');
        console.log("DEBUG: viewAllBulletinsEvoke: remaining bulletins: " + sortedAuthorizedBulletins);
        // We first want to create a 'next page' module
        let nextPageModule = {
            "type": "ActionSet",
            "spacing": "Large",
            "actions": [
                {
                    "type": "Action.Submit",
                    "title": `Next Page`,
                    "id": `nextPageViewall`,
                    "data": {
                        "formType": "nextPageViewall",
                        "endpoint": `${process.env.WEBHOOKURL}/submit`,
                        "originalEvoker": trigger.person.id,
                        "remainingBulletins": `${sortedAuthorizedBulletins}`
                    }
                }
            ]
        };

        // Finally, we push the 'Next Page' actionset into the card.
        allActionSets.push(nextPageModule);
    }

    let viewEvokeCard = 
    {
        "type": "AdaptiveCard",
        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
        "version": "1.3",
        "body": [
            {
                "type": "TextBlock",
                "spacing": "None",
                "text": "Select a Bulletin to View 📜",
                "size": "Large",
                "weight": "Bolder"
            },
            {
                "type": "Container",
                "spacing": "Small",
                "items": allActionSets
            }
        ]
    };

    try {
        await bot.censor(attachedForm.messageId);
        await bot.sendCard(viewEvokeCard, "viewEvokeCard");
    } catch (e) {
        console.log(e)
    }
} 

async function viewAllNextPage(bot, trigger, attachedForm) {

    // Evoker Check
    if (!(await utils.betterCheckEvokerClicked(attachedForm, bot))) { console.log(`Evoker check failed.`); bot.dm(attachedForm.personId, `This is someone else's card! To get started with bulletins, use the 'bulletin' command!`); return; }
    // Evoker Check End

    const formData = trigger.attachmentAction.inputs;

    // Already-sorted bulletinIds that the user has access to viewing that just needs to be printed
    let remainingBulletinIds = formData.remainingBulletins;

    console.log(remainingBulletinIds);
    remainingBulletinIds = remainingBulletinIds.split(',')

    let allActions = []
    let allActionSets = []
    if (!(remainingBulletinIds.length > 9)) {
        console.log("DEBUG: viewAllBulletinsEvoke: Doing less than 9");
        // Looping for all of the bulletinIds the user has access to
        for (let i = 0; i < remainingBulletinIds.length; i++) {
            // Making that action with the title of the bulletin, and the required Id in the data
            let singleAction = 
            {
                "type": "Action.Submit",
                "title": `${await getBulletinNameFromId(remainingBulletinIds[i])}`,
                "id": `${remainingBulletinIds[i]}`,
                "data": {
                    "formType": "bulletinView",
                    "endpoint": `${process.env.WEBHOOKURL}/submit`,
                    "originalEvoker": trigger.person.id,
                    "bulletinId": remainingBulletinIds[i]
                }
            }
            allActions.push(singleAction);
        }
        // Now we insert these actions into their ActionSets, three at a time.
        for (let i = 0; i < allActions.length; i += 3) {
            let actionSet = {
                "type": "ActionSet",
                "spacing": "None",
                "actions": allActions.slice(i, i + 3)
            };
            allActionSets.push(actionSet);
        }
        console.log(`Resulting action sets array: ${JSON.stringify(allActionSets, null, 2)}`);
    }
    // If the user needs more than one page of bulletins
    else {
        console.log("DEBUG: viewAllBulletinsEvoke: Doing more than 9");

        // Looping for all of the bulletinIds the user has access to
        for (let i = 0; i < 9; i++) {
            // Making that action with the title of the bulletin, and the required Id in the data
            let singleAction = 
            {
                "type": "Action.Submit",
                "title": `${await getBulletinNameFromId(remainingBulletinIds[i])}`,
                "id": `${remainingBulletinIds[i]}`,
                "data": {
                    "formType": "bulletinView",
                    "endpoint": `${process.env.WEBHOOKURL}/submit`,
                    "originalEvoker": trigger.person.id,
                    "bulletinId": remainingBulletinIds[i]
                }
            }
            allActions.push(singleAction);
        }

        // And then we'll push those into the ActionSets.
        for (let i = 0; i < allActions.length; i += 3) {
            let actionSet = {
                "type": "ActionSet",
                "spacing": "None",
                "actions": allActions.slice(i, i + 3)
            };
            allActionSets.push(actionSet);
        }

        remainingBulletinIds.splice(0, 9).join(',');
        console.log("DEBUG: viewAllBulletinsEvoke: remaining bulletins: " + remainingBulletinIds);
        // We first want to create a 'next page' module
        let nextPageModule = {
            "type": "ActionSet",
            "spacing": "Large",
            "actions": [
                {
                    "type": "Action.Submit",
                    "title": `Next Page`,
                    "id": `nextPageViewall`,
                    "data": {
                        "formType": "nextPageViewall",
                        "endpoint": `${process.env.WEBHOOKURL}/submit`,
                        "originalEvoker": trigger.person.id,
                        "remainingBulletins": `${remainingBulletinIds}`
                    }
                }
            ]
        };

        // Finally, we push the 'Next Page' actionset into the card.
        allActionSets.push(nextPageModule);
    }

    let viewEvokeCard = 
    {
        "type": "AdaptiveCard",
        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
        "version": "1.3",
        "body": [
            {
                "type": "TextBlock",
                "spacing": "None",
                "text": "Select a Bulletin to View 📜",
                "size": "Large",
                "weight": "Bolder"
            },
            {
                "type": "Container",
                "spacing": "Small",
                "items": allActionSets
            }
        ]
    };

    try {
        await bot.censor(attachedForm.messageId);
        await bot.sendCard(viewEvokeCard, "viewEvokeCard");
    } catch (e) {
        console.log(e)
    }
}

// Helper functions
async function deleteSelectedBulletinItems(bot, trigger, attachedForm) {

    // Evoker Check
    if (!(await utils.betterCheckEvokerClicked(attachedForm, bot))) { console.log(`Evoker check failed.`); bot.dm(attachedForm.personId, `This is someone else's card! To get started with bulletins, use the 'bulletin' command!`); return; }
    // Evoker Check End

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
    deleteSelectedBulletinItems: deleteSelectedBulletinItems,
    editBulletinEvoke: editBulletinEvoke,
    editPermissionsEvoke: editPermissionsEvoke,
    addEditorsEvoke: addEditorsEvoke,
    addEditorToBulletin: addEditorToBulletin,
    removeEditorsFromBulletin: removeEditorsFromBulletin,
    destroyBulletinEvoke: destroyBulletinEvoke,
    nukeBulletin: nukeBulletin,
    viewAllBulletinsEvoke: viewAllBulletinsEvoke,
    bulletinCreateConfirm: bulletinCreateConfirm,
    addViewersEvoke: addViewersEvoke,
    addViewerToBulletin: addViewerToBulletin,
    viewAllNextPage: viewAllNextPage,
    nextEditViewall: nextEditViewall
};