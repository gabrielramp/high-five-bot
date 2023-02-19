// Includes and declarations
require("dotenv").config();
const axios = require ("axios");
var framework = require("webex-node-bot-framework");
var webhook = require("webex-node-bot-framework/webhook");
var express = require("express");
var bodyParser = require("body-parser");
var app = express();
app.use(bodyParser.json());
app.use(express.static("images"));
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

///
/// IMPORTANT INFORMATION:
/// Hello! Thanks for looking at my bot code. There are a lot of things that I'm doing for the first time in code here,
/// including HTTP requests, API interaction, even JavaScript and Node.js! (I usually code in C and Python.)
/// So, if you see any code that could be expressed more efficiently or concisely, please submit a PR!
/// Thank you, Gabe
///

// Configuration
const config = {
  webhookUrl: process.env.WEBHOOKURL,
  token: process.env.BOTTOKEN,
  port: process.env.PORT,
};

// Preconfiguration for Webex API Authorization header
const httpauth = {
  headers: {
    Authorization: `Bearer ${process.env.BOTTOKEN}`,
  },
};

// Initialize Framework
var framework = new framework(config);
framework.start();
console.log("\n\n\n\nStarting framework... ");
framework.on("Initialized, coming online...", () => {
  console.log("Bot is good to go! [Press CTRL-C to quit]");
});

// Perform upon joining a space
framework.on("spawn", (bot, id, actorId) => {
  if (!actorId) {
    // DONT SAY ANYTHING HERE OR WE SPAM EVERY SPACE EVERY RESTART
  } else {
    // actorId present means we've been added to a new space.
    // When added to new space:
    var msg = "*@mention* me and use the command 'help' to see my commands.";
    bot.webex.people
      .get(actorId)
      .then((user) => {
        msg = `Hi! ${msg}`;
      })
      .catch((e) => {
        console.error(
          `${e.message}`
        );
      msg = `Hello there! ${msg}`;
    });
  }
});

// debug command 'devcls'
// Prints empty space into the chat for the purpose of allowing demonstrations without distractions in the chat history
framework.hears (
  "devcls",
  async (bot, trigger) => {
    bot.say("markdown", "\n⠀\n⠀\n⠀\n⠀\n⠀\n⠀\n⠀\n⠀\n⠀\n⠀\n⠀\n⠀\n⠀\n⠀\n⠀\n⠀\n⠀\n⠀\n⠀\n⠀\n⠀\n⠀\n⠀\n⠀\n⠀\n⠀\n⠀\n⠀");
  },
  0
)

// 'about' command
framework.hears(
  "about",
  (bot, trigger) => {
    bot.say("made by Gabe with <3");
  },
  "**about**: Show information about this bot",
  0
);

// 'help' command
framework.hears (
  "help",
  async (bot, trigger) => {
    bot.say("markdown", framework.showHelp());
  },
  "**help**: Show available bot commands.",
  0
)

// Catch-all for unrecognized commands with asterisk as syntax and priority of 99999
framework.hears (
  /.*/,
  async (bot, trigger) => {
    console.log(`Catch-all handler: ${trigger.text}`);
    bot.say(`Sorry, I not sure how to respond to "${trigger.text}".`)
      .then(() => bot.say("markdown", framework.showHelp()))
      .catch((e) =>
        console.error(`Problem in the unexpected command handler: ${e.message}`)
      );
  },
  99998 // Priority
);

// Pull the High Five JSON Card Template
const highfivecard = require('./templates/highfivecard.json');

// 'highfive' command: Create a High Five card for a user, specified by email
framework.hears(
  "highfive",
  (bot, trigger) => {

    //
    // Trigger start
    //

    // logging for debug weeeee
    console.log
    ("\n\nHigh Five Received:",
    "\nMessage:", trigger.message.text,
    "\nArgs:", trigger.args,
    "\nLength:", trigger.args.length,
    "\nIndex 1:", trigger.args[1],
    "\nDisplay Name:", trigger.person.displayName,
    "\nEmail:", trigger.person.email, "\n");

    // First we'll get a list of users for the space the command has been triggered in.
    bot.webex.memberships.list({ roomId: bot.room.id })
    .then(async (memberships) => {
      // Then, we'll loop through all of the mentioned users (arguments 1 through inf).

      // Congratulate recipients in the chat
      bot.say("Congratulations to our High Five recipients!");

      // Initialize first iterator of trigger list
      console.log("Looping for members mentioned...");
        
      // Then, loop through all members to match the string index
      for (let i = 1; i < trigger.args.length; i++) {
        for (const member of memberships.items) {
          
          console.log(`Current member: ${member.personEmail}, Request: ${trigger.args[i]}`)

          // If a member is found with the specified email
          if (member.personEmail == trigger.args[i]) {

            // Then we'll parse their email to find their username
            cleanedname = member.personEmail.split('@')[0];
            
            // More debug :^)
            console.log("Match found.\nCreating a card for", member.personEmail, "\nID", member.personId, "\nDisplay Name", cleanedname);

            // And now we make the card for them!
            // Finding their image in files...
            personimage = `${config.webhookUrl}/${cleanedname}.jpg`

            // Setting the first text block as person's name
            highfivecard.body[0].columns[0].items[0].text = member.personDisplayName;

            // Setting their CEC image.
            highfivecard.body[0].columns[0].items[1].url = personimage
            ? personimage
            : `${config.webhookUrl}/missing-avatar.jpg`;

            // Emoji for coolness points
            highfivecard.body[0].columns[0].items[2].text = "🎉";

            // Sending the card!
            await bot.sendCard(
              highfivecard,
              // Error message if applicable.
              "[High Five Card]"
            )
            console.log("Sent card. Continuing...\n")
          }
        };
      }; 
      console.log("Exited card loop.");
    });
  },
  "**highfive**: Syntax: [@mention highfive [*recipient-email1*]] (support multiple emails). Creates a High Five card for a user!",
  0 // Command Priority
);

// Birthday Card JSON Template
const birthdaycard = require('./templates/birthdaycard.json');

// 'birthdaycard' command: Create a birthday card for someone! Specified by email.
//
// This command is almost a copy-paste of the highfive command, with the addition of an HTTP request to the Webex API to return a user's details which contains their Webex profile picture URL (among other things but we won't talk about that).
//
framework.hears(
  "birthdaycard",
  (bot, trigger) => {

    // Log received
    console.log("\n\nStarting a birthday card interaction.");
    console.log("Happy Birthday!! You get a special card...");

    // The rest of this is the same as the 'highfive' function. Look up there to see how this works!
    bot.webex.memberships.list({ roomId: bot.room.id })
    .then(async (memberships) => {
      for (let i = 1; i < trigger.args.length; i++) {
        for (const member of memberships.items) {
          if (member.personEmail == trigger.args[i]) {

            cleanedname = member.personEmail.split('@')[0];

            // Here's where it's different. We're using the Axios library to make an HTTP request to the Webex API for a person's details.
            // You can find this specific call here: https://developer.webex.com/docs/api/v1/people/get-person-details
            console.log("\n\nTrying API call with Axios");
            axios.get(`https://webexapis.com/v1/people/${member.personId}?callingData=true`, httpauth)
              // Once we get a response,
              .then(response => {

                // Here we find and put a person's data in these variables. The return is predictable as per the API documentation.
                console.log("Axios HTTP Request:");
                console.log("Avatar URL:", response.data.avatar);
                var firstname = response.data.firstName;
                var avatarurl = response.data.avatar;

                // And then we build the card as usual!
                birthdaycard.body[0].columns[0].items[0].text = firstname;
                birthdaycard.body[0].columns[0].items[1].url = avatarurl
                ? avatarurl
                : `${process.env.WEBHOOKURL}/missing-avatar.jpg`;
                birthdaycard.body[0].columns[0].items[2].text = "HAPPY BIRTHDAY!";
                birthdaycard.body[0].columns[0].items[3].text = "🎂🎂🎂";

                console.log("Attempting to send the card...");

                // Sending the card!
                bot.sendCard(
                  birthdaycard,
                  // Error message if applicable.
                  "[Birthday Card]"
                )
              })
              .catch(error => {
                console.log("ERROR FOUND");
                console.log(error);
              });
            // Once the request is over and we cut the connection, we can't use the data outside of that .then function. So we're out!
            console.log("Sent card. Continuing...\n");
          }
        };
      }; 
      console.log("Exited birthday card loop.");
    });
  },
  "**birthdaycard**: Syntax: [@mention birthdaycard *recipient-email1*]. Highlight the birthday person with a virtual card!",
  0,
)

// Poll command
framework.hears (
  "poll",
  (bot,trigger) => {
    async function Poll() {
      // Create new ID for this poll
      const newPollId = generaterandomString();

      // Create the 'New Poll' Card
      let newPollCard =
        {
          "type": "AdaptiveCard",
          "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
          "version": "1.3",
          "body": [
              {
                  "type": "TextBlock",
                  "text": "Create a New Poll 🔖",
                  "wrap": true,
                  "size": "Medium",
                  "weight": "Bolder",
              },
              {
                  "type": "Input.Text",
                  "label": "Enter your question here:",
                  "placeholder": "What's everyone's favorite dessert?",
                  "spacing": "Medium",
                  "isRequired": true,
                  "id": "questionBox",
              },
              {
                "type": "Input.Text",
                "label": "Enter your answers here, each separated by a semicolon:",
                "placeholder": "Cookies;Brownies;Cake",
                "spacing": "Medium",
                "isRequired": true,
                "id": "answersBox",
              },
              {
                "type": "Input.Toggle",
                "title": "Anonymous answers",
                "id": "isAnonymous",
                "value": "true"
              }
          ],
          actions: [
            {
              spacing: "Large",
              type: "Action.Submit",
              title: "Create Poll",
              data: {
                "formType": "pollCreate",
                "formId": `${newPollId}`,
                "endpoint": `${process.env.WEBHOOKURL}/submit`,
                "trigger": trigger
              }
            }
          ]
        }

        // Send the card in chat.
        bot.sendCard (
          newPollCard,
          "New Poll Card"
        );
    }
    // Call this function.
    Poll();
  },
  "**poll**: Create a poll! Command inspired by Pollbot, but they're not open-source, though!",
  0
)

// Freeform command
framework.hears (
  // Triggered by mentioning the bot with command 'freeform'
  "freeform",
  (bot, trigger) => {
    async function Freeform() {

      // Creating our new ID
      const newFreeformId = generaterandomString();

      // Creating 'Create Freeform Question' card
      let freeformCreateCard = 
        {
          type: "AdaptiveCard",
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          version: "1.2",
          body: [
              {
                  type: "TextBlock",
                  text: "Create a New Freeform Question 💭",
                  wrap: true,
                  size: "Medium",
                  style: "heading",
                  weight: "Bolder",
              },
              {
                  type: "Input.Text",
                  placeholder: "\"What was your favorite part of this week?\"",
                  isMultiline: true,
                  maxLength: 500,
                  label: "Enter your question here:",
                  spacing: "None",
                  isRequired: true,
                  id: "freeformSubmission"
              },
              {
                "type": "Input.Toggle",
                "title": "Anonymous submissions",
                "id": "isAnonymous",
                "value": "true"
              } 
          ],
          actions: [
            {
              type: "Action.Submit",
              title: "Submit Question",
              data: {
                "formType": "freeformCreate",
                "formId": `${newFreeformId}`,
                "endpoint": `${process.env.WEBHOOKURL}/submit`,
                "trigger": trigger
              }
            }
          ]
        }
        bot.sendCard (
          freeformCreateCard,
          "freeformCreateCard"
        );
    }
    // Call this function.
    Freeform()  
  },
  "**freeform**: Create a freeform question for your Space to answer. Answers have a limit of 500 characters.",
  0
)

// attachmentAction handling
//
// Here's our main function where we listen to submission events for polls, freeform submissions, and anything else.
// When a user interacts with an adaptive card sent by the bot, that interaction is handled here.
framework.on('attachmentAction', async (bot, trigger) => {
  // The entirety of the interaction's attached data is within trigger.attachmentAction, so we'll make these variables easy to call here.

  // attachedForm will contain all of the message data, i.e message id, personId, roomId, creation time.
  const attachedForm = trigger.attachmentAction; 

  // formData will contain all information passed through with the submission action of the interacted Adaptive Card, so hopefully i.e formType, formTitle, formId.
  const formData = trigger.attachmentAction.inputs;

  // And here's some debug information that's hopefully commented out (because there's no current problems!)
  //console.log(`Test Parse: \nType: ${trigger.attachmentAction.type}`);
  console.log(`\n\n\nReceived Attachment:\n${JSON.stringify(trigger.attachmentAction, null, 2)}`);

  // Handle POLL SUBMISSIONS (pollRes)
  // Submitted when a user selects an option in a poll and clicks 'Submit'
  if (formData.formType == "pollResponse") {
    // Log the submission
    console.log("Handling 'pollResponse': Poll Selection Submission");
    //bot.say(`${attachedForm.id}, you selected ${selectedOption}! (this is a debug message)`);
    submitPollResponse(formData.formId, attachedForm.personId, formData.polloption);
  }

  // Handle POLL STATUS REQUEST (pollrequest)
  // Submitted when a user with a follow-up DM from the bot clicks 'View Current Results'; See 'pollfollowupcard' for template and logic.
  if (formData.formType == "pollrequest") {

    // choiceTitles is a string array of all possible options in the poll 
    let choiceTitles = formData.choiceTitles;
    // formTitle is the string English title of the original poll
    let formTitle = formData.formTitle;
    // pollId is the hex specifier of the original poll (and name of the JSON file containing its data)
    const pollId = trigger.attachmentAction.inputs.formId;
    // isAnonymous will determine whether the results will be printed with the names of every person who chose that result under them.
    const isAnonymous = formData.isAnonymous;

    // Some logging
    console.log(`Poll status request made for poll ${pollId}.`);
    console.log("\nResults: ");

    // Then we call our handy getPollResults() which will handle gathering all of the data.
    try {
      const results = await getPollResults(pollId, isAnonymous);

      // Here we're going to create our template card for displaying the results of a poll,
      // Starting with dynamicResults, which will be a chunk of Adaptive Card syntax that will contain the options of the poll along with their counts and selectors.
      let dynamicResults = [];
      results.forEach((option) => {
        const count = option.score;
        const selectedOptionTitle = option.selectedOption;
        const selectorNames = option.selectors;
        console.log(`${selectedOptionTitle}: ${count}`);
        console.log(`Selectors: ${selectorNames.join(', ')}`);
        let singleresult =
          {
            type: "TextBlock",
            text: `${selectedOptionTitle}: ${count}`,
            weight: "Bolder",
            spacing: "Small",
            size: "Medium",
          };
        // If the poll is not anonymous, add a text block below the selectedOptionTitle for displaying the selectors.
        if (isAnonymous == "false") {
          const selectorText = selectorNames.join(',');
          const selectorBlock =
            {
              type: "TextBlock",
              text: selectorText,
              weight: "Lighter",
              spacing: "Small",
              size: "Small",
              wrap: true,
            };
          dynamicResults.push(singleresult, selectorBlock);
        } 
        else {
          dynamicResults.push(singleresult);
        }
      });


      // Followed by our actual Adaptive Card template.
      let pollresults =
      {
        type: "AdaptiveCard",
        $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
        version: "1.2",
        body: [
          {
            type: "TextBlock",
            text: `🎉 Here are the current results for your poll, "${formTitle}":`,
            wrap: true,
            size: "Large",
            weight: "Default",
          },
          {
            type: "Container",
            items: dynamicResults,
          },
        ],
        actions: [
          {
            type: "Action.Submit",
            title: "View Updated Results",
            data: {
              "isAnonymous": isAnonymous,
              "choiceTitles": choiceTitles,
              "formTitle": `${formTitle}`,
              "formType": "pollrequest",
              "formId": `${pollId}`,
              "endpoint": `${process.env.WEBHOOKURL}/submit`
            }
          }
        ]
      }

      // Then we send the reponse with the current results of the poll!
      bot.sendCard(
        pollresults,
        // Error message if applicable.
        "pollresults"
      )
    } catch(error) {
      console.log (`There was an error reading the poll results for poll ID ${pollId}.\n` + error);
    }
  }

  // Handle freeformCreate
  // Submitted when a user enters a question into a "Create a freeform response question" card and clicks submit.
  if (formData.formType == "freeformCreate") {
    console.log(`DEBUG: Received freeformCreate type.`);
    // First we'll check if the person that submitted the freeform question also triggered the bot to send it in the first place.
    if (attachedForm.personId == formData.trigger.person.id) {
      // Then we'll deleet the "Create a New Freeform Question" message
      bot.censor(attachedForm.messageId);

      // Anonymous text changes depending on whether the question is anonymous or not
      console.log(`isAnonymous: ${formData.isAnonymous}`);
      let anonText = "";
      let anonFollowupText = "";
      var anonFlag = 1;

      if (formData.isAnonymous == "true") {
        console.log(`if-else isAnonymous: read TRUE`);
        anonText = `This response will be anonymous.`;
        anonFollowupText = `Submissions to your question will be anonymous.`;
      }
      else {
        console.log(`if-else isAnonymous: read FALSE`);
        anonFlag = 0;
        anonText = `This response will NOT be anonymous.`;
        anonFollowupText = `Submissions will not be anonymous.`;
      }

      // And send a new card with their question:
      let freeformResponseCard = 
        {
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          type: "AdaptiveCard",
          version: "1.2",
          body: [
              {
                  type: "TextBlock",
                  text: `From **${formData.trigger.person.firstName}**:`,
                  wrap: true
              },
              {
                  type: "TextBlock",
                  size: "Medium",
                  weight: "Bolder",
                  text: `${formData.freeformSubmission}`,
                  horizontalAlignment: "Center",
                  wrap: true,
                  style: "heading"
              },
              {
                  type: "Input.Text",
                  id: "freeformResponse",
                  maxLength: 500,
                  placeholder: "Enter your response here",
                  label: `${anonText}\nPlease enter your response below:`,
                  isMultiline: true,
              }
          ],
          actions: [
            {
              type: "Action.Submit",
              title: "Submit Response",
              data: {
                "anonFlag": `${anonFlag}`,
                "formType": "freeformResponse",
                "formId": `${formData.formId}`,
                "endpoint": `${process.env.WEBHOOKURL}/submit`,
              }
            }
          ]
        }
      
      // Send the freeform question into the chat
      bot.sendCard (
        freeformResponseCard,
        "freeformResponseCard"
      );

      // Send a card to the creator of the freeform question with a freeform question answer retrieval card
      let freeformFollowupCard = 
        {
          type: "AdaptiveCard",
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          version: "1.0",
          body: [
            {
              type: "TextBlock",
              text: `Hey! Your freeform question, "${formData.freeformSubmission}" is currently taking responses.
                    \nWhen you're ready to see the current submissions, click the button below.
                    \n${anonFollowupText}`,
              wrap: true,
              size: "Large",
              weight: "Default",
            },
            {
              type: "TextBlock",
              text: `Clicking this button will not end the freeform question.`,
              wrap: true,
              size: "Small",
              weight: "Default",
              spacing: "Small",
            },
          ],
          actions: [
            {
              type: "Action.Submit",
              title: "View Current Responses",
              data: {
                "anonFlag": `${anonFlag}`,
                "formType": "freeformRequest",
                "formTitle": `${formData.freeformSubmission}`,
                "formId": `${formData.formId}`,
                "endpoint": `${process.env.WEBHOOKURL}/submit`
              }
            }
          ]
        }

        // Then send it their way!
        bot.dmCard(
          formData.trigger.person.id, 
          freeformFollowupCard, 
          "Freeform Question Followup");
    }
    else {
      // TODO: Put logic here that happens when someone tries to type to the createFreeform who didn't evoke the bot. (DM user to say this isnt theirs and they can make their own)
    }

  }

  // Handle freeformResponse
  // Submitted when a user types into a freeform question card and submits their answer.
  if (formData.formType == "freeformResponse") {
    // Log the submission
    console.log("Handling 'freeformResponse': Freeform Question Response");
    //bot.say(`${attachedForm.id}, you selected ${selectedOption}! (this is a debug message)`);
    submitFreeformResponse(formData.formId, attachedForm.personId, formData.freeformResponse);
  }

  // Handle freeformRequest
  // Submitted when a user clicks the "View Current Responses" button in their follow-up card.
  if (formData.formType == "freeformRequest") {
    // More 'concise'ing
    // formTitle is the string English question from the original poll
    let formTitle = formData.formTitle;
    // freeformId is the hex specifier of the original question (and name of the JSON file containing its data)
    const freeformId = formData.formId;

    var anonFlag = formData.anonFlag;

    // Some logging
    console.log(`DEBUG: Freeform request made for freeform question ${freeformId}.`);

    // We'll retrieve all of the responses to the submission:
    let freeformResponses = await getFreeformResponses(freeformId, anonFlag);
    console.log("DEBUG: Retrieved freeformResponses: " + freeformResponses);
    let freeformResponsesCardText = buildTextFreeformResponsesAnonymous(freeformResponses);

    let freeformResponsesRequestCard =
      {
        type: "AdaptiveCard",
        $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
        version: "1.2",
        body: [
          {
            type: "TextBlock",
            text: `📝 Here are the responses for your freeform response question, "${formData.formTitle}":`,
            wrap: true,
            size: "Large",
            weight: "Default",
          },
          {
            type: "Container",
            items: freeformResponsesCardText,
          },
        ],
        actions: [
          {
            type: "Action.Submit",
            title: "View Updated Submissions",
            data: {
              "anonFlag": `${anonFlag}`,
              "formType": "freeformRequest",
              "formTitle": `${formData.formTitle}`,
              "formId": `${formData.formId}`,
              "endpoint": `${process.env.WEBHOOKURL}/submit`
            }
          }
        ]
      }

    // Delete the previous followup DM
    bot.censor(attachedForm.messageId)
    // Send results
    bot.sendCard(
      freeformResponsesRequestCard,
      // Error message if applicable.
      "freeformResponsesRequestCard"
    )
  }

  // Handle pollCreate
  // Submitted when a user uses @mention poll2 and submits a question and answer for posting.
  if (formData.formType == "pollCreate") {
    console.log(`DEBUG: Received freeformCreate type.\n Trigger data:` + formData.trigger.text);

    let anonFlag = 1;
    let anonText = "";
    let anonFollowupText = "";
    // isAnonymous flag handling
    if (formData.isAnonymous == "true") {
      anonText = `Your choice will be anonymous.`;
      anonFollowupText = `Submissions to your poll will be anonymous.`;
    }
    else {
      anonFlag = 0;
      anonText = `The creator of this poll will see your selection.`;
      anonFollowupText = `Submissions will not be anonymous.`;
    }

    // First we'll check if the person that submitted the freeform question also triggered the bot to send it in the first place.
    if (attachedForm.personId == formData.trigger.person.id) {
      // Parse the answerBox and questionBox fields of the submission
      let pollQuestionTitle = formData.questionBox;

      // Here we do a lot with a little to simultaneously split the string by the semicolons, while also removing whitespace that isn't between any words.
      let pollAnswers = formData.answersBox.split(';').map(word => word.trim()); 

      // Then we'll create the dynamic text for the choices, along with saving the titles for our results card.
      let choiceTitles = [];
      let choices = [];
      for (let i = 0; i < pollAnswers.length; i++) {
        choiceTitles.push(pollAnswers[i]);
        let choice = 
        {
          title: pollAnswers[i],
          value: pollAnswers[i],
        };
        choices.push(choice);
      } 

      // Then we'll deleet the "Create a New Freeform Question" message
      bot.censor(attachedForm.messageId);

      // And send a new card with their question:
      let pollCard = 
        {
          type: "AdaptiveCard",
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          version: "1.0",
          body: [
            {
              type: "TextBlock",
              text: `From **${formData.trigger.person.firstName}**:\n ${pollQuestionTitle}`,
              wrap: true,
              size: "Medium",
              weight: "Default",
            },
            {
              type: "Input.ChoiceSet",
              choices: choices,
              placeholder: "Placeholder text",
              style: "expanded",
              id: "polloption",
            },
            {
              type: "TextBlock",
              text: `${anonText}`,
              wrap: true,
              size: "Small",
              weight: "Default",
              spacing: "Medium",
            },
          ],
          actions: [
            {
              type: "Action.Submit",
              title: "Submit",
              data: {
                "isAnonymous": formData.isAnonymous,
                "choiceTitles": choiceTitles,
                "formType": "pollResponse",
                "formId": `${formData.formId}`,
                "endpoint": `${process.env.WEBHOOKURL}/submit`
              }
            }
          ]
        };

        // Send the new pollinto the chat
        bot.sendCard (
          pollCard,
          "New Poll"
        );

        // This card will contain the sensitive details of the new poll and be DMd to the creator for follow-up.
      let pollfollowupcard = 
        {
          type: "AdaptiveCard",
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          version: "1.0",
          body: [
            {
              type: "TextBlock",
              text: `Hi! Your poll "${formData.questionBox}" is currently running. When you're ready to see results, click the button below.\n${anonFollowupText}`,
              wrap: true,
              size: "Large",
              weight: "Default",
            },
            {
              type: "TextBlock",
              text: `Clicking this button will not end the current poll.`,
              wrap: true,
              size: "Small",
              weight: "Default",
              spacing: "Small",
            },
          ],
          actions: [
            {
              type: "Action.Submit",
              title: "View Current Results",
              data: {
                "isAnonymous": formData.isAnonymous,
                "choiceTitles": choiceTitles,
                "formTitle": `${formData.questionBox}`,
                "formType": "pollrequest",
                "formId": `${formData.formId}`,
                "endpoint": `${process.env.WEBHOOKURL}/submit`
              }
            }
          ]
        }

      try {
        bot.dmCard(
          formData.trigger.person.id, 
          pollfollowupcard, 
          "Poll Creation Followup");
      } catch (error) {
        console.log(`Error DMing the card to ${formData.trigger.person.id}:\n${error}`);
      }

    }
    else {
      // TODO: Put logic here that happens when someone tries to type to the pollCreate who didn't evoke the bot. (DM user to say this isnt theirs and they can make their own)
    } 
  }
});

// buildTextFreeformResponsesAnonymous takes a string array of freeform responses (without a personId) and returns the text block which displays these responses in an Adaptive Card.
function buildTextFreeformResponsesAnonymous (freeformResponses) {
  let freeformResponsesCardText = []
  for (let i = 0; i < freeformResponses.length; i++) {
    let singleresponse = 
    {
      type: "TextBlock",
      text: `"${freeformResponses[i]}"`,
      spacing: "Large",
      size: "Medium",
    };
    freeformResponsesCardText.push(singleresponse);
  }
  return freeformResponsesCardText;
}

async function getPollResults(pollId, isAnonymous) {
  const filePath = `./submissions/${pollId}.json`;

  try {
    const fileContents = fs.readFileSync(filePath, 'utf-8');
    const pollData = JSON.parse(fileContents);
    const results = [];

    const selectorsByOption = {};
    for (const [personId, selectedOption] of Object.entries(pollData)) {
      if (!selectorsByOption[selectedOption]) {
        selectorsByOption[selectedOption] = {
          selectors: [],
          score: 0,
        };
      }
      selectorsByOption[selectedOption].selectors.push(personId);
      selectorsByOption[selectedOption].score++;
    }

    for (const [selectedOption, selectors] of Object.entries(selectorsByOption)) {
      const selectorNames = await Promise.all(selectors.selectors.map(async (personId) => {
        const personDetails = await getPersonDetails(personId);
        console.log(`Resolved personId ${personId} to firstName ${personDetails.firstName}`);
        return personDetails.firstName;
      }));
      console.log(`Selectors for ${selectedOption}: ${selectorNames.join(', ')}`);
      results.push({
        selectedOption: selectedOption,
        selectors: selectorNames,
        score: selectors.score,
      });
    }

    return results;
  } catch (error) {
    throw error;
  }
}


// This function will find all of the data points in a specific JSON specified by its pollId, and fetch all of the choices made by each user.
/*function getPollResults(pollId, isAnonymous) {
  // Assuming the JSON files are stored in a directory called 'polls'
  const filePath = `./submissions/${pollId}.json`;

  try {
    // Read the contents of the JSON file
    const fileContents = fs.readFileSync(filePath, 'utf-8');

    // Parse the contents of the file into a JavaScript object
    const pollData = JSON.parse(fileContents);

    // Create an object to store the results
    const results = {};

    // Loop through each person's poll selection and add it to the results object
    Object.keys(pollData).forEach((personId) => {
      const selectedOption = pollData[personId];
      results[personId] = selectedOption;
    });

    return results;
  } catch (error) {
    throw error;
    return null;
  }
}*/

// This logic here is where we take items from a poll response and organize the data.
// From a poll submission, that poll's ID, that person's ID, and their selected option is taken and put into a JSON.
// Organized by filename being the pollID.
// TODO: Change all of this to use SQL instead of JSONs.
function submitPollResponse(pollId, personId, selectedOption) {
  const submissionPath = `./submissions/${pollId}.json`;

  let submissions = {};

  // Check if submission file exists, if not, create an empty object
  if (fs.existsSync(submissionPath)) {
    submissions = JSON.parse(fs.readFileSync(submissionPath));
  }

  // Update person's selected option or add new person's selection
  submissions[personId] = selectedOption;

  // Write updated submission to file
  fs.writeFileSync(submissionPath, JSON.stringify(submissions));
}

// submitFreeformResponse will take a question response and put it into a file associated with its formId.
function submitFreeformResponse(freeformId, personId, freeformResponse) {
  const submissionPath = `./submissions/${freeformId}.json`;

  let submissions = {};

  // Check if submission file exists, if not, create an empty object
  if (fs.existsSync(submissionPath)) {
    submissions = JSON.parse(fs.readFileSync(submissionPath));
  }

  // This big pain in the ass will insert a newline character after every 50 characters while ALSO avoiding splitting words by checking for whitespaces.
  let responseWithNewlines = '';
  let lastNewlineIndex = 0;
  for (let i = 50; i < freeformResponse.length; i += 50) {
    let currentChar = freeformResponse.charAt(i);

    if (currentChar !== ' ' && freeformResponse.charAt(i - 1) !== ' ') {
      // If the current character is not a space and the previous character is not a space,
      // find the last whitespace before the current index to insert the newline after
      let lastWhitespaceIndex = freeformResponse.lastIndexOf(' ', i);
      if (lastWhitespaceIndex === -1) {
        // If there are no whitespaces before the current index, insert the newline after the current index
        responseWithNewlines += freeformResponse.substring(lastNewlineIndex, i) + '\n';
      } else {
        responseWithNewlines += freeformResponse.substring(lastNewlineIndex, lastWhitespaceIndex) + '\n';
        i = lastWhitespaceIndex + 1; // skip over the whitespace character
      }
    } else {
      // If the current character is a space or the previous character is a space, insert the newline after the current index
      responseWithNewlines += freeformResponse.substring(lastNewlineIndex, i) + '\n';
    }
    lastNewlineIndex = i;
  }
  responseWithNewlines += freeformResponse.substring(lastNewlineIndex);

  // Update person's selected option or add new person's selection
  submissions[personId] = responseWithNewlines;

  // Write updated submission to file
  fs.writeFileSync(submissionPath, JSON.stringify(submissions));
}

// getFreeformResponses will find a file associated with a formId and return a string array of all of the responses.
async function getFreeformResponses(freeformId, anonFlag) {
  // Find the JSON file associated with the freeformId
  const submissionPath = `./submissions/${freeformId}.json`;

  // Return empty array if file doesn't exist
  if (!fs.existsSync(submissionPath)) {
    return [];
  }

  // Parse the file into an Object array for easy reading
  const submissions = JSON.parse(fs.readFileSync(submissionPath));

  // Responses will be our string array of responses from the file
  let responses = [];

  // Now we'll populate Responses
  try {
    // Declaring Promises in case our anonFlag is set to 1
    const promises = [];

    // Now we'll loop for every personId in the submissions object array
    for (const personId in submissions) {
      //console.log(`DEBUG getFreeformResponses: getting submissions[personId]: ${submissions[personId]}`);
      // Take the current response
      let response = submissions[personId];

      // If these responses are to not be anonymous
      if (anonFlag == 0) {

        // Then we get the persondetails associated with that personId
        const promise = getPersonDetails(personId)
          .then(personData => {

            // And get their name
            const name = personData.firstName;
            //console.log(`DEBUG getFreeformResponses: anonFlag: ${anonFlag}; Pushing response data ${name}: ${submissions[personId]}`);
            //console.log(`DEBUG getFreeformResponses: Responses right after pushing: ${submissions[personId]}`);

            // And push their name into the responses array along with their response!
            responses.push(`${name}: ${submissions[personId]}`);
          })
          .catch(error => {
            console.log(`DEBUG getFreeformResponses: Error retrieving person details for personId: ${personId}`);
            console.log(error);
          });

        // We take this current promise and push it into our promise array.
        promises.push(promise);
      }
      
      // If our responses ARE anonymous, then we just skip finding the name associated with that personId entirely.
      else {
        console.log(`DEBUG getFreeformResponses: anonFlag: ${anonFlag}; Pushing response ${response}`);
        responses.push(response);
      }
    }

    // At the end, we resolve all of our promises so that we can continue using the data.
    await Promise.all(promises);
  } catch (error) {
    console.log("Error retrieving person details on non-anon" + error)
  }

  // and return the responses.
  console.log(`DEBUG getFreeformResponses: Final responses: ${responses}`);
  return responses;
}

// getPersonDetails will take a personId, then call the Webex API to return a person's details.
async function getPersonDetails(personId) {
  try {
    // Make a request to the Webex API and return the response
    const response = await axios.get(`https://webexapis.com/v1/people/${personId}?callingData=true`, httpauth);
    return response.data;
  } catch (error) {
    console.log(`Error retrieving person details for personId: ${personId}` + error);
    return null;
  }
}

///
///
/// Down here is where I keep all of my small cogs that keep the machine working. All of these are critical!
///
///

// API Setup Start
// We set up our webhook on the Webex API to be able to send and receive data like submissions from a poll.
// Here's the 'firehose', which will just tell the API that we want to send and receive anything possible.
const firehose = {
  name: 'Gabe\'s Awesome Bot Webhook Firehose',
  targetUrl: `${process.env.WEBHOOKURL}`,
  resource: 'all',
  event: 'all',
};

// And then we make the POST request to have our webhook available for data.
axios.post('https://webexapis.com/v1/webhooks', firehose, httpauth)
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.log(error);
});
// API Setup End

// Function for creating a random string
function generaterandomString() {
  return crypto.randomBytes(5).toString('hex');
}

// Smol log handler
framework.on("log", (msg) => {
  console.log(msg);
});

// Health Check
app.get("/", (req, res) => {
  res.send(`I'm alive.`);
});

// Here's where our webhook is listening for requests and data.
app.post("/", webhook(framework));
app.post("/submit", webhook(framework));

// Here we specify which port we're listening to.
app.listen(config.port, () => {
  framework.debug("Framework listening on port %s", config.port);
});

// Shutdown procedure (CTRL-C in terminal)
process.on("SIGINT", () => {
  framework.debug("Shutting down...");
  server.close();
  framework.stop().then(() => {
    process.exit();
  });
});
