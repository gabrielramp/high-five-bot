// Includes and declarations
require("dotenv").config();
const axios = require ("axios");
var framework = require("webex-node-bot-framework");
var webhook = require("webex-node-bot-framework/webhook");
var express = require("express");
var bodyParser = require("body-parser");
var app = express();
const fs = require('fs');
const crypto = require('crypto');
app.use(bodyParser.json());
app.use(express.static("images"));



/*                                                             
*                          ?&B.                          .B&?                  
*                          5@@^                          ^@@5                  
*                  .7J:    5@@^    !J~            ^J!    ^@@5    :J7.          
*                  ~@@J    5@@^   .&@G            G@&.   ^@@5    J@@~          
*           7P?    ~@@J    5@@^   .&@G    :55:    G@&.   ^@@5    J@@~    ?P7   
*           #@&.   ~@@Y    5@@^   .&@G    7@@7    G@&.   ^@@5    Y@@~    &@#   
*           5&P    ^#&7    5@@^   .G&Y    ~##~    Y&G.   ^@@5    7&#^    P&5             
*            ^      ^^     :@@:     ^      ^^      ^     :&@:     ^^      ^    
*                                                                              
*                                                                              
*                   :!?JJ?:   !7!     ~?JJ?^'    .~?JJ?^     ^7JJ?!:           
*                 :P&@&##&!   B@&.  :B@@P5G?   .Y&@@##&J   !B@@##&@&5:         
*                .B@@?^       B@#.  ^@@&J^     P@@Y       !@@G^   '@@B.        
*                :@@&:        B@#.   :?PB@@G: .#@@^       J@@J     O@@:        
*                 J@@#Y77J^   B@&.     2!#@@~  7&@&Y77J!  :G@@P?@J#@@?         
*                   ^YG#&&#~  P#G.  ~####BP!    :JG#&&&7    !5#&&#GY^          
*                                                                                
*                                                                                
*  ██╗  ██╗██╗ ██████╗ ██╗  ██╗███████╗██╗██╗   ██╗███████╗    ██████╗  ██████╗ ████████╗
*  ██║  ██║██║██╔════╝ ██║  ██║██╔════╝██║██║   ██║██╔════╝    ██╔══██╗██╔═══██╗╚══██╔══╝
*  ███████║██║██║  ███╗███████║█████╗  ██║██║   ██║█████╗      ██████╔╝██║   ██║   ██║   
*  ██╔══██║██║██║   ██║██╔══██║██╔══╝  ██║╚██╗ ██╔╝██╔══╝      ██╔══██╗██║   ██║   ██║              
*  ██║  ██║██║╚██████╔╝██║  ██║██║     ██║ ╚████╔╝ ███████╗    ██████╔╝╚██████╔╝   ██║   
*  ╚═╝  ╚═╝╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝  ╚═══╝  ╚══════╝    ╚═════╝  ╚═════╝    ╚═╝   
*
*                                  IMPORTANT INFORMATION:
*     Hello! Thanks for looking at my bot code. There are a lot of things that I'm doing for the  
*   first time in code here, including HTTP requests, API interaction, even JavaScript and Node.js!
*   So, if you see any code that could be expressed more efficiently or concisely, please submit a PR.
*                 
*     Thank you, 
*                Gabe :)
*/

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

/* End intro, begin
*                                                _     
*                                               | |    
*   ___ ___  _ __ ___  _ __ ___   __ _ _ __   __| |___ 
*  / __/ _ \| '_ ` _ \| '_ ` _ \ / _` | '_ \ / _` / __|
* | (_| (_) | | | | | | | | | | | (_| | | | | (_| \__ \
*  \___\___/|_| |_| |_|_| |_| |_|\__,_|_| |_|\__,_|___/
*
*/                     

let dummycard = 
{
  type: "AdaptiveCard",
  $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
  version: "1.0",
  body: [
    {
      type: "TextBlock",
      text: `From **Gabe**:\n Sample Poll`,
      wrap: "true",
      size: "Medium",
      weight: "Default",
    },
    {
      type: "Input.ChoiceSet",
      choices: [
        {
            title: "Option 1",
            value: "Option 1"
        },
        {
            title: "Option 2",
            value: "Option 2"
        },
        {
          title: "Other",
          value: "Other"
        }
    ],
      isMultiselect: "true",
      style: "expanded",
      id: "polloption",
    },
    {
      type: "Input.Text",
      placeholder: "Please specify",
      spacing: "None"
    },
    {
      type: "TextBlock",
      text: `Your choices will be anonymous.`,
      wrap: "true",
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
        "formType": "pollResponse",
        "formId": `test`,
        "endpoint": `test`
      }
    }
  ]
};

// 'help' command
framework.hears (
  "testcard",
  (bot) => {
    bot.sendCard(testcard, "test card");
  },
  0
)
                   
                     
// 'help' command
framework.hears (
  "help",
  async (bot) => {
    highfivehelp(bot);
  },
  0
)

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
// Displays normal information about the bot
framework.hears(
  "about",
  (bot, trigger) => {
    bot.say(`made by Gabe with <3
            \nhttps://www.youtube.com/watch?v=9JnGuLUvE4A
            \nSpecial Thanks to Brad, Max, and Julianna for testing the bot!`);
  },
  "**about**: Show information about this bot",
  0
);

// 'getallemails' command
// Returns all emails in the space as a DM to the invoker
framework.hears(
  "getallemails",
  (bot, trigger) => {
    bot.webex.memberships.list({ roomId: bot.room.id })
    .then(async (memberships) => {
      let allemails = [];
        for (const member of memberships.items) {
          allemails.push(member.personEmail)
        }
      let allemailsstring = allemails.join('\n');
      console.log(`${allemailsstring} to ${trigger.person.email}`);
      bot.dm(trigger.personId, {"markdown": 'Here are your emails from Space ' + bot.room.title + ':\n' + allemailsstring});
    });
  },
  "**getallemails**: Retrieve the emails of every person in the Space.",
  0
);

// 'hi highfive' command
// Just a hello command. Useful for demonstrations.
framework.hears (
  "Hi Highfive!",
  async (bot, trigger) => {
    bot.say("markdown", `Hey ${trigger.person.firstName}!`);
  },
  0
)

// 'highfivecard' command: Create a High Five card for a user, specified by email
// Pull the High Five JSON Card Template
const highfivecard = require('./templates/highfivecard.json');
framework.hears(
  "highfivecard",
  (bot, trigger) => {

    // Logging for debug weeeee
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
  "**highfivecard**: Syntax: [@mention highfive [*recipient-email1*]] (support multiple emails). Creates a High Five card for a user!",
  0 // Command Priority
);

// 'birthdaycard' command: Create a birthday card for someone! Specified by email.
// This command is almost a copy-paste of the highfive command, with the addition of an HTTP request to the Webex API to return a user's details which contains their Webex profile picture URL.
const birthdaycard = require('./templates/birthdaycard.json');
framework.hears(
  "birthdaycard",
  (bot, trigger) => {

    // The rest of this is the same as the 'highfive' function except the HTTP GET. Look up there to see how this works!
    bot.webex.memberships.list({ roomId: bot.room.id })
    .then(async (memberships) => {
      for (let i = 1; i < trigger.args.length; i++) {
        for (const member of memberships.items) {
          if (member.personEmail == trigger.args[i]) {

            // Getting the name of email without the domain
            cleanedname = member.personEmail.split('@')[0];

            // Here's where it's different. We're using the Axios library to make an HTTP request to the Webex API for a person's details.
            // You can find this specific call here: https://developer.webex.com/docs/api/v1/people/get-person-details
            console.log("\n\nTrying API call with Axios");
            axios.get(`https://webexapis.com/v1/people/${member.personId}?callingData=true`, httpauth)
              // Once we get a response,
              .then(response => {

                // Here we find and put a person's data in these variables. The return is predictable as per the API documentation.
                //console.log(`Axios HTTP Request: ${JSON.stringify(response.data, null, 2)}`);
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
// Creates a newPollCard and sends it in the chat for the user.
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
              },
              {
                "type": "Input.Toggle",
                "title": "Enable Multi-select",
                "id": "isMultiselect",
                "value": "false"
              },
              {
                "type": "Input.Toggle",
                "title": "Create \"Other\" freeform option",
                "id": "hasOther",
                "value": "false"
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
  "**poll**: Create a poll! Command inspired by Pollbot--they're not open-source, though!",
  0
)

// Freeform command
// Creates a freeformCreateCard and sends it in the chat.
framework.hears (
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

// Gas command
// Creates a newGas card and sends it in the chat (only works in a DM).
framework.hears (
  "gas",
  (bot,trigger) => {
    
    // gas function
    async function newGas() {
      // Create new ID for this interaction
      const newGasId = generaterandomString();

      // Create the gas card
      let newGasCard =
        {
          "type": "AdaptiveCard",
          "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
          "version": "1.3",
          "body": [
              {
                "type": "TextBlock",
                "text": "Gas someone up! 🔥",
                "wrap": true,
                "size": "Large",
                "weight": "Bolder",
              },
              {
                "type": "Input.Text",
                "label": "Enter your recipient's email here:",
                "placeholder": "example@cisco.com",
                "spacing": "Medium",
                "isRequired": true,
                "id": "gasRecipient",
              },
              {
                "type": "Input.Text",
                "label": "Enter your message here:",
                "placeholder": "You delivered your presentation really well!",
                "spacing": "Medium",
                "isRequired": true,
                "id": "gasMessage",
              },
              {
                "type": "TextBlock",
                "text": "Your message will be anonymous.\nThe recipient will be able to reply to your message.",
                "spacing": "Medium",
                "size": "Small"
              }
          ],
          actions: [
            {
              spacing: "Large",
              type: "Action.Submit",
              title: "Gas them up 🔥",
              data: {
                "formType": "newGasMessage",
                "formId": `${newGasId}`,
                "endpoint": `${process.env.WEBHOOKURL}/submit`,
                "trigger": trigger
              }
            }
          ]
        }

        // Send the card in the chat.
        bot.sendCard (
          newGasCard,
          "newGasCard"
        );
    }

    // First we check if we're in DMs by counting the amount of users in the room.
    // Unfortunately, there's not a way to discern a Space from a Room without doing this that I know of.
    var gasFlag = 0;
    bot.webex.memberships.list({ roomId: bot.room.id })
    .then(async (memberships) => {
      let memberCounter = 0;
      // Count the amount of people that are currently in the Space
      for (const member of memberships.items) {

        // Once the counter gets to 3, bail and send fallback message
        if (memberCounter >= 3) 
        {
          bot.say("If you want to use the 'gas' command, please DM me the word 'gas'!");
          gasFlag = 1;
          return;
        } else {
          memberCounter++;
          continue;
        }

      }

        // New gas if only 2 members, return if greater than 2
        if (!gasFlag) {
          newGas(); 
        }
        else
          return;
    });

  },
  "**gas**: Compliment someone anonymously! Only works in direct messages with this bot.",
  0
)

/* End Commands, begin
*        _   _             _                                _    ___       _   _             
*       | | | |           | |                              | |  / _ \     | | (_)            
*   __ _| |_| |_ __ _  ___| |__   __ _ _ __ ___   ___ _ __ | |_/ /_\ \ ___| |_ _  ___  _ __  
*  / _` | __| __/ _` |/ __| '_ \ / _` | '_ ` _ \ / _ \ '_ \| __|  _  |/ __| __| |/ _ \| '_ \ 
* | (_| | |_| || (_| | (__| | | | (_| | | | | | |  __/ | | | |_| | | | (__| |_| | (_) | | | |
*  \__,_|\__|\__\__,_|\___|_| |_|\__,_|_| |_| |_|\___|_| |_|\__\_| |_/\___|\__|_|\___/|_| |_|
*                                                                                           
*  Here's our main function where we listen to submission events for polls, freeform submissions, and anything else.
*  When a user interacts with an adaptive card sent by the bot, that interaction is handled here.
*/

framework.on('attachmentAction', async (bot, trigger) => {
  // attachedForm will contain all of the message data, i.e message id, personId, roomId, creation time.
  const attachedForm = trigger.attachmentAction; 

  // formData will contain all information passed through with the submission action of the interacted Adaptive Card, so hopefully i.e formType, formTitle, formId.
  const formData = trigger.attachmentAction.inputs;

  // Log the submission data
  console.log(`\n\n\nReceived Attachment:\n${JSON.stringify(trigger.attachmentAction, null, 2)}`);

  // Handle helpDelete
  // Submitted when a user clicks 'Delete this message' in the help command
  if (formData.formType == "helpDelete") {
    bot.censor(attachedForm.messageId);
  }

  // Handle POLL SUBMISSIONS (pollResponse)
  // Submitted when a user selects an option in a poll and clicks 'Submit'
  if (formData.formType == "pollResponse") {
    console.log("Handling 'pollResponse': Poll Selection Submission");

    // Submit the response to have it saved
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

    console.log(`Poll status request made for poll ${pollId}.`);
    console.log("\nResults: ");

    // Then we call our handy getPollResults() which will handle gathering all of the data.
    try {
      // Retrieve the poll results from the JSON.
      const results = await getPollResults(pollId, isAnonymous);

      // allOptions is a Set which contains all of the titles of each choice. We remove these titles to use the remaining ones.
      const allOptions = new Set(choiceTitles);

      // dynamicResults will contain the Microsoft Adaptive Card format of all the information we retrieved.
      let dynamicResults = [];

      // Now we're going to loop for each option present in the results (options that have not been 'voted for' are not in this object array.).
      results.forEach((option) => {
        // How many voted for this option
        const count = option.score;

        // Title of the option
        const selectedOptionTitle = option.selectedOption;

        // List of names who voted for this option
        const selectorNames = option.selectors;

        // debug
        console.log(`${selectedOptionTitle}: ${count}`);
        console.log(`Selectors: ${selectorNames.join(', ')}`);

        // Create a single 'block' of text for this 
        let singleresult =
          {
            type: "TextBlock",
            text: `${selectedOptionTitle}: ${count}`,
            weight: "Bolder",
            spacing: "Small",
            size: "Medium",
          };
        
        // If the 'isAnonymous' flag is set to false, add a text box to display the names of the selectors
        if (isAnonymous == false) {
          // Bring all names into one string separated by comma
          let selectorText = selectorNames.join(', ');

          // Textblock of selectors
          const selectorBlock = 
          {
            type: "TextBlock",
            text: `${selectorText}`,
            wrap: true,
            spacing: "Small",
            size: "Small",
          };

          // Push singleresult and selectorBlock
          dynamicResults.push(singleresult, selectorBlock);
        }
        // If not anonymous, just push results
        else {
          dynamicResults.push(singleresult);
        }

        // Remove the selected option from the list of all options, so that we can find the remaining options
        allOptions.delete(selectedOptionTitle);
      });

      // Loop through the remaining options and add them to the dynamicResults array, with a count of 0
      allOptions.forEach(option => {
        let singleresult =
          {
            type: "TextBlock",
            text: `${option}: 0`,
            weight: "Bolder",
            spacing: "Small",
            size: "Medium",
          };
        
        dynamicResults.push(singleresult);
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
      bot.censor(attachedForm.messageId);
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

      if (formData.isAnonymous == true) {
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
      bot.dm(attachedForm.personId, "Sorry! This freeform Create card is reserved. If you'd like to start your own freeform response question, use the command 'freeform'.")
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
    // First we'll check if the person that submitted the freeform question also triggered the bot to send it in the first place.
    if (attachedForm.personId == formData.trigger.person.id) {
      console.log(`DEBUG: Received pollCreate type`);
    
      // isMultiselect means users can select multiple answers. This value goes right into the card.
      const isMultiselect = formData.isMultiselect;
      // hasOther means that the poll will have an 'other' option that has a freeform response in it. We make a new block for this.
      const hasOther = formData.hasOther;
  
      let anonText = "";
      let anonFollowupText = "";
      // isAnonymous flag handling
      if (formData.isAnonymous == true) {
        anonText = `Your choice will be anonymous.`;
        anonFollowupText = `Submissions to your poll will be anonymous.`;
      }
      else {
        anonText = `The creator of this poll will see your selection.`;
        anonFollowupText = `Submissions will not be anonymous.`;
      }

      // Parse the answerBox and questionBox fields of the submission
      let pollQuestionTitle = formData.questionBox;

      // Here we do a lot with a little to simultaneously split the string by the semicolons, while also doing sanitization.
      // First we remove any escape characters 
      let cleanedAnswersBox = formData.answersBox.replace(/\\/g, '');
      // Then we remove any adjacent semicolons (i.e ";;;;;;" becomes ";")
      cleanedAnswersBox = cleanedAnswersBox.replace(/;;+/g, ';');
      // Then if the first or last characters are semicolons, remove them
      if (cleanedAnswersBox.slice(-1) === ';') {
        cleanedAnswersBox = cleanedAnswersBox.slice(0, -1);
      }
      if (cleanedAnswersBox.charAt(0) === ';') {
        cleanedAnswersBox = cleanedAnswersBox.slice(1);
      }
      // Then we remove unnecessary whitespace.
      let pollAnswers = cleanedAnswersBox.split(';').map(word => word.trim()); 

      // Now we'll create the dynamic text for the choices, along with saving the titles for our results card.
      // choiceTitles will be an array of the names of the options in this poll for parsing later.
      let choiceTitles = [];
      // choices will be the block of options within the card's "Input.ChoiceSet" option.
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
              isMultiselect: `${isMultiselect}`,
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
      bot.dm(attachedForm.personId, "Sorry! This poll create card is reserved. If you'd like to start your own freeform response question, use the command 'poll'.")
    } 
  }

  // Handle a gas create
  // Submitted when a user clicks 'send' on a Gas creation form
  if (formData.formType == "newGasMessage") {
    console.log(`DEBUG: Handling new gas message from ${formData.trigger.person.userName} to "${formData.gasRecipient}"`);
    // Gas ID
    const gasId = formData.formId;

    // Email of the sender
    const gasSender = formData.trigger.person.userName;

    // Email of the recipient
    const gasReceiver = formData.gasRecipient;

    // Initial Gas message
    const gasMessage = formData.gasMessage;

    // Delete the gas creation card
    bot.censor(attachedForm.messageId);

    let youGotGasCard = 
    {
      type: "AdaptiveCard",
      $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
      version: "1.2",
      body: [
          {
              type: "TextBlock",
              text: "You've got Gas! 🔥",
              wrap: true,
              size: "Large",
              weight: "Bolder"
          },
          {
              type: "TextBlock",
              text: "Someone has decided to anonymously gas you up!\nHere's what they said.",
              wrap: true,
              size: "Small",
              spacing: "Small"
          },
          {
              type: "Container",
              items: [
                  {
                      "type": "TextBlock",
                      "text": `${gasMessage}`,
                      "wrap": true,
                      "size": "Medium",
                      "spacing": "None"
                  }
              ],
              spacing: "Medium"
          },
          {
            type: "TextBlock",
            text: "You can click this button to reply to this person.",
            wrap: true,
            size: "Small",
            spacing: "Medium"
          },
      ],
      actions: [
        {
          type: "Action.Submit",
          title: "Reply to this gas",
          data: {
            "originalTriggerPerson": `${formData.trigger.person.userName}`,
            "originalGas": `${gasMessage}`,
            "formType": "gasReplyRequest",
            "formId": `${formData.formId}`,
            "endpoint": `${process.env.WEBHOOKURL}/submit`
          }
        }
      ]
    };

    // if the recipient is the bot
    if (formData.gasRecipient.toLowerCase() == "cxhighfivebot@webex.bot") {
      bot.say ("Thanks for the gas!");
      return;
    }

    // Try to send the message to the reciever.
    try {
      await bot.dmCard(formData.gasRecipient, youGotGasCard, "You got Gas!");
    } catch(error) {
      // If there's an error sending the card to the recipient, then let the sender know.
      bot.say(`Hmm. There was an error sending your gas.\nPlease ensure you typed in the right email address and try again. Here was your message: \n\nTo ${formData.gasRecipient}:\n${gasMessage}`);
      return;
    }

    let gasSentConfirmationCard = 
    {
      type: "AdaptiveCard",
      $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
      version: "1.2",
      body: [
          {
              type: "TextBlock",
              text: "Gas sent!🔥",
              wrap: true,
              size: "Large",
              weight: "Bolder"
          },
          {
              type: "TextBlock",
              text: "Your gas recipient has successfully received their gas. If they reply, you'll receive a message letting you know.",
              wrap: true,
              size: "Medium"
          },
          {
            type: "TextBlock",
            text: "Here's what you sent:",
            wrap: true,
            size: "Small"
          },
          {
            type: "Container",
            items: [
                {
                    "type": "TextBlock",
                    "text": `${gasMessage}`,
                    "wrap": true,
                    "size": "Small",
                    "spacing": "None"
                }
            ],
            spacing: "Small"
          },
      ],
    }

    // Send confirmation card
    bot.sendCard(gasSentConfirmationCard, "Gas sent.");
  }

  // Handle gas reply REQUEST
  // Submitted when a user clicks "Reply" after receiving a gas.
  if (formData.formType == "gasReplyRequest") {
    // Original gas message
    const originalGas = formData.originalGas;

    // Original sender
    const originalTriggerPerson = formData.originalTriggerPerson;

    bot.censor(attachedForm.messageId);

    let gasReplyRequestCard =
        {
          "type": "AdaptiveCard",
          "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
          "version": "1.3",
          "body": [
              {
                "type": "TextBlock",
                "text": "Reply to your Gas! 🔥",
                "wrap": true,
                "size": "Large",
                "weight": "Bolder",
              },
              {
                "type": "TextBlock",
                "text": "The original gas:",
                "spacing": "Medium",
                "size": "Small"
              },
              {
                type: "Container",
                items: [
                    {
                        "type": "TextBlock",
                        "text": `${originalGas}`,
                        "wrap": true,
                        "size": "Small",
                        "spacing": "Small"
                    }
                ],
                spacing: "Small"
              },
              {
                "type": "Input.Text",
                "label": "Enter your reply here:",
                "placeholder": "Thank you, stranger!",
                "spacing": "Medium",
                "isRequired": true,
                "id": "gasReplyMessage",
              }
          ],
          actions: [
            {
              spacing: "Large",
              type: "Action.Submit",
              title: "Reply 🔥",
              data: {
                "originalGas": `${originalGas}`,
                "originalTriggerPerson": originalTriggerPerson,
                "formType": "gasReply",
                "endpoint": `${process.env.WEBHOOKURL}/submit`,
              }
            }
          ]
        }

    bot.sendCard(gasReplyRequestCard, "Reply to your gas!");
  }

  // Handle gasReply
  // Submitted when a user clicks 'send' on a reply to a gas.
  if (formData.formType == "gasReply") {
    // Original gas message
    const originalGas = formData.originalGas;

    // Original sender
    const originalTriggerPerson = formData.originalTriggerPerson;

    const gasReply = formData.gasReplyMessage;

    // get name
    const replyName = await getFirstName(attachedForm.personId);

    console.log(`DEBUG: getting reply name after call then: ${replyName}`);

    bot.censor(attachedForm.messageId);

    let gasReplyCard =
        {
          "type": "AdaptiveCard",
          "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
          "version": "1.3",
          "body": [
              {
                "type": "TextBlock",
                "text": "You've received a reply to your gas! 🔥",
                "wrap": true,
                "size": "Large",
                "weight": "Bolder",
                "spacing": "Small",
              },
              {
                "type": "TextBlock",
                "text": `Here's what ${replyName} said:`,
                "wrap": true,
                "size": "Medium",
                "spacing": "Medium"
              },
              {
                type: "Container",
                items: [
                    {
                        "type": "TextBlock",
                        "text": `${gasReply}`,
                        "wrap": true,
                        "size": "Medium",
                        "spacing": "None",
                    }
                ]
              },
              {
                "type": "TextBlock",
                "text": "The original gas:",
                "spacing": "Medium",
                "size": "Small"
              },
              {
                type: "Container",
                items: [
                    {
                        "type": "TextBlock",
                        "text": `${originalGas}`,
                        "wrap": true,
                        "size": "Small",
                        "spacing": "None"
                    }
                ],
                spacing: "Small"
              }
          ]
        }
    bot.dmCard(originalTriggerPerson, gasReplyCard, "Your gas received a reply!");

    let gasReplyConfirmationCard = 
    {
      type: "AdaptiveCard",
      $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
      version: "1.2",
      body: [
          {
              type: "TextBlock",
              text: "Gas reply sent!🔥",
              wrap: true,
              size: "Large",
              weight: "Bolder"
          },
          {
            type: "TextBlock",
            text: `Here's the original gas:`,
            wrap: true,
            size: "Small"
          },
          {
            type: "Container",
            items: [
                {
                    "type": "TextBlock",
                    "text": `${originalGas}`,
                    "wrap": true,
                    "size": "Small",
                    "spacing": "Small"
                }
            ],
            spacing: "Small"
          },
      ],
    }
    bot.sendCard(gasReplyConfirmationCard, "Gas Reply Confirmation");
  }
});

/* End attachmentAction handling, begin
*  _   _      _                    __                  _   _                 
* | | | |    | |                  / _|                | | (_)                
* | |_| | ___| |_ __   ___ _ __  | |_ _   _ _ __   ___| |_ _  ___  _ __  ___ 
* |  _  |/ _ \ | '_ \ / _ \ '__| |  _| | | | '_ \ / __| __| |/ _ \| '_ \/ __|
* | | | |  __/ | |_) |  __/ |    | | | |_| | | | | (__| |_| | (_) | | | \__ \
* \_| |_/\___|_| .__/ \___|_|    |_|  \__,_|_| |_|\___|\__|_|\___/|_| |_|___/
*              | |                                                           
*              |_|                                                           
*/

// Helper function to replace the framework default function
// This helper function requires MANUAL update of the function to accomodate new commands. (but it's way prettier and worth it)
function highfivehelp(bot) {
  const helpcard = {
      "type": "AdaptiveCard",
      "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
      "version": "1.0",
      "body": [
          {
              "type": "Container",
              "items": [
                  {
                      "type": "TextBlock",
                      "text": "Available Commands 🤖",
                      "wrap": true,
                      "size": "Large",
                      "weight": "Bolder"
                  },
                  {
                      "type": "RichTextBlock",
                      "inlines": [
                          {
                              "type": "TextRun",
                              "text": "Don't forget to mention me when using a command in a Space.\ni.e",
                              "size": "Small"
                          },
                          {
                              "type": "TextRun",
                              "text": " @Highfive poll",
                              "fontType": "Monospace",
                              "size": "Small",
                              "color": "Accent"
                          }
                      ],
                      "spacing": "None"
                  },
                  {
                      "type": "ColumnSet",
                      "columns": [
                          {
                              "type": "Column",



                              "items": [
                                  {
                                      "type": "RichTextBlock",
                                      "inlines": [
                                          {
                                              "type": "TextRun",
                                              "text": "📃 freeform",
                                              "fontType": "Monospace",
                                              "weight": "bolder"
                                          }
                                      ]
                                  },
                                  {
                                      "type": "RichTextBlock",
                                      "inlines": [
                                          {
                                              "type": "TextRun",
                                              "text": "Create a freeform question for your Space to answer. Answers have a limit of 500 characters."
                                          }
                                      ],
                                      "spacing": "None"
                                  },
                                  {
                                      "type": "RichTextBlock",
                                      "inlines": [
                                          {
                                              "type": "TextRun",
                                              "text": "🔖 poll",
                                              "fontType": "Monospace",
                                              "weight": "bolder"
                                          }
                                      ]
                                  },
                                  {
                                      "type": "RichTextBlock",
                                      "inlines": [
                                          {
                                              "type": "TextRun",
                                              "text": "Create a poll! Command inspired by Pollbot--they're not open-source, though!"
                                          }
                                      ],
                                      "spacing": "None"
                                  },
                                  {
                                      "type": "RichTextBlock",
                                      "inlines": [
                                          {
                                              "type": "TextRun",
                                              "text": "🔥 gas",
                                              "fontType": "Monospace",
                                              "weight": "bolder"
                                          }
                                      ]
                                  },
                                  {
                                      "type": "RichTextBlock",
                                      "inlines": [
                                          {
                                              "type": "TextRun",
                                              "text": "Commend someone anonymously! Only works in direct messages with this bot."
                                          }
                                      ],
                                      "spacing": "None"
                                  },
                                  {
                                      "type": "RichTextBlock",
                                      "inlines": [
                                          {
                                              "type": "TextRun",
                                              "text": "✋ highfivecard [recipient-email]",
                                              "fontType": "Monospace",
                                              "weight": "bolder"
                                          }
                                      ]
                                  },
                                  {
                                      "type": "RichTextBlock",
                                      "inlines": [
                                          {
                                              "type": "TextRun",
                                              "text": "Creates High Five recognition cards for users in chat! Supports multiple emails."
                                          }
                                      ],
                                      "spacing": "None"
                                  },
                                  {
                                      "type": "RichTextBlock",
                                      "inlines": [
                                          {
                                              "type": "TextRun",
                                              "text": "🎉 birthdaycard [recipient-email]",
                                              "fontType": "Monospace",
                                              "weight": "bolder"
                                          }
                                      ]
                                  },
                                  {
                                      "type": "RichTextBlock",
                                      "inlines": [
                                          {
                                              "type": "TextRun",
                                              "text": "Highlight a birthday person in chat! Supports multiple emails."
                                          }
                                      ],
                                      "spacing": "None"
                                  },
                                  {
                                      "type": "RichTextBlock",
                                      "inlines": [
                                          {
                                              "type": "TextRun",
                                              "text": "📧 getallemails",
                                              "fontType": "Monospace",
                                              "weight": "bolder"
                                          }
                                      ]
                                  },
                                  {
                                      "type": "RichTextBlock",
                                      "inlines": [
                                          {
                                              "type": "TextRun",
                                              "text": "Receive a list of all emails in this space."
                                          }
                                      ],
                                      "spacing": "None"
                                  },
                                  {
                                      "type": "RichTextBlock",
                                      "inlines": [
                                          {
                                              "type": "TextRun",
                                              "text": "🦮 help",
                                              "fontType": "Monospace",
                                              "weight": "bolder"
                                          }
                                      ]
                                  },
                                  {
                                      "type": "RichTextBlock",
                                      "inlines": [
                                          {
                                              "type": "TextRun",
                                              "text": "Show this card."
                                          }
                                      ],
                                      "spacing": "None"
                                  },
                                  {
                                      "type": "RichTextBlock",
                                      "inlines": [
                                          {
                                              "type": "TextRun",
                                              "text": "🐸 about",
                                              "fontType": "Monospace",
                                              "weight": "bolder"
                                          }
                                      ]
                                  },
                                  {
                                      "type": "RichTextBlock",
                                      "inlines": [
                                          {
                                              "type": "TextRun",
                                              "text": "Display information about this bot."
                                          }
                                      ],
                                      "spacing": "None"
                                  }
                              ]



                          }
                      ],
                      "style": "emphasis"
                  }
              ]
          }
      ],
      "actions": [
          {
              "type": "Action.Submit",
              "title": "Delete this message",
              "data": {
                  "formType": "helpDelete",
                  "endpoint": `${process.env.WEBHOOKURL}/submit`
              }
          }
      ]
  };
  bot.sendCard(helpcard, "Help Card");
}

// This function will get a person's first name by first calling getPersonDetails.
async function getFirstName(personId) {
  // Try to retrieve person's details
  try {
    const personData = await getPersonDetails(personId);
    const replyName = personData.firstName;
    // Return the person's first name.
    return replyName;
  } catch (error) {
    console.log(`DEBUG getFreeformResponses: Error retrieving person details for personId: ${personId}`);
    console.log(error);
  }
}

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

// This function will find all of the data points in a specific JSON specified by its pollId, and fetch all of the choices made by each user.
async function getPollResults(pollId, isAnonymous) {

  // Find the file
  const filePath = `./submissions/${pollId}.json`;

  try {
    // Read the contents of  the JSON and parse it into JavaScript object
    const fileContents = fs.readFileSync(filePath, 'utf-8');
    const pollData = JSON.parse(fileContents);
    const results = [];

    // Create object to store selectors by option, with each option storing a score count and a string array of the peopleIds that selected it
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

    // Then, for each option, resolve personId to their name and create object for result.
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

// submitPollResponse will take a poll response and put it into a file associated with its pollId.
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
    console.log(`Response: ${response.data}`);
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

// Catch-all for unrecognized commands
framework.hears (
  /.*/,
  async (bot, trigger) => {
    console.log(`Catch-all handler: ${trigger.text}`);
    bot.say(`Sorry, I not sure how to respond to "${trigger.text}".`)
      .then((highfivehelp(bot)))
      .catch(e =>
        console.error(`Problem in the unexpected command handler: ${e.message}`)
      );
  },
  99998 // Priority
);

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

/*
// Health Check
app.get("/", (req, res) => {
  res.send(`I'm alive.`);
}); */

// Here's where our webhook is listening for requests and data.
app.post("/", webhook(framework));
app.post("/submit", webhook(framework));
app.listen(config.port, () => {
  framework.debug('Framework listening on port %s', config.port);
});