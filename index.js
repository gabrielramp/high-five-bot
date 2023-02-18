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
    console.log(`Startup Space: ${bot.room.title}`);
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

// 'about' command
framework.hears(
  "about",
  (bot, trigger) => {
    bot.say("made by Gabe with <3");
  },
  "**about**: Show information about this bot",
  0
);

// Catch-all for unrecognized commands with asterisk as syntax and priority of 99999
framework.hears (
  /.*/,
  (bot, trigger) => {
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
  "**highfive**: Creates a High Five card for a user. Syntax: 'highfive user@cisco.com' (unlimited arguments)",
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
  "Highlight the birthday person with a virtual card!",
  0,
)

// 'poll' starts a poll that creates a poll, with arguments separated by quotation marks
// User should enter first the title, then every poll option in quotation marks i.e ("Favorite Dessert" "Cookies" "Brownies" "Milk")
// Alrighty, this is the first command that will be handled by another function: submissions to this poll will be handled by our friendly framework.on('attachmentAction') handler function below.
// TODO: Replace initial message syntax with instead just giving an adaptive card that offers text boxes for input
framework.hears (
  // Triggered by mentioning the bot with command 'poll'
  "poll",
  (bot, trigger) => {
    async function pollcreate() {
    // Initializing our variables for parsing the text.
    const input = trigger.message.text;
    console.log(`TRIGGER PERSON: ${trigger.person.id}`)
    const followupperson = trigger.person.id;
    const parts = [];
    let inQuotes = false;
    let start = 0;
    
    // 
    // Temporary poll creation process start
    //
    // The idea of this temporary poll creation process is that we'll take the example message ' "@CX poll "Name of my poll" "Option 1" "Option 2" ',
    // and parse it such that "Name of my poll" becomes the title of the poll, and the "Option 1" and "Option 2" become the options for the poll.
    // Ideally, this process will be replaced by an Adaptive Card that takes text input for these.

    // Loop for every character in the message
    for (let i = 0; i < input.length; i++) {
      // If the current text is a quotation mark
      if (input.charAt(i) === '"') {
        // Then we'll flip the "inQuotes" flag, which just toggles on and off.
        inQuotes = !inQuotes;
      } 
      else if (input.charAt(i) === ' ' && !inQuotes) {
        // If the current character is a whitespace and it's not inside quotes,
        if (start !== i) {
          // And it's not empty
          const part = input.substring(start, i);
          // Then push that character into the array replacing it with nothing.
          parts.push(part.replace(/"/g, ''));
        }
        // Then update the character iterator.
        start = i + 1;
      }
    }

    // Add the final part of the input string to the parts array, if there is one
    if (start < input.length) {
      const part = input.substring(start);
      parts.push(part.replace(/"/g, ''));
    }   

    // And we finish up by removing the first argument of the array, which we know will always be "poll", so it's useless.
    parts.shift();

    // If we're in a Space, then the first argument will be the mention. We'll remove the "poll" arg here.
    if (parts[0] == 'poll')
      parts.shift();

    // Now we set up for the JSON
    // Choices will be our 'JSON' array of buttons to be appended into our 'pollcard' Adaptive Card template below.
    let choices = [];
    for (let i = 1; i < parts.length; i++) {
      let choice = 
      {
        title: parts[i],
        value: parts[i],
      };
      choices.push(choice);
    }

    // choiceTitles will be a string array of the poll option titles and will be passed to our follow-up cards to be used to display the results of the polls.
    let choiceTitles = [];
    for (const part of parts) {
      choiceTitles.push(part);
    }

    //
    // Temporary poll creation process end
    // 

    // Here we create a random string to identify our new poll.
    const newpollId = generaterandomString();

    // Here's our pollcard which we'll be changing for the specifications of this poll.
    // Fairly simple, it'll just have a title and some buttons for submission.
    let pollcard = 
    {
      type: "AdaptiveCard",
      $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
      version: "1.0",
      body: [
        {
          type: "TextBlock",
          text: `From **${trigger.person.firstName}**:\n ${parts[0]}`,
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
      ],
      actions: [
        {
          type: "Action.Submit",
          title: "Submit",
          data: {
            "formType": "pollitem",
            "formId": `${newpollId}`,
            "endpoint": `${process.env.WEBHOOKURL}/submit`
          }
        }
      ]
    };

    // This card will contain the sensitive details of the new poll and be DMd to the creator for follow-up.
    let pollfollowupcard = 
    {
      type: "AdaptiveCard",
      $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
      version: "1.0",
      body: [
        {
          type: "TextBlock",
          text: `Hi! Your poll "${parts[0]}" is currently running. When you're ready to see results, click the button below.`,
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
            "choiceTitles": choiceTitles,
            "formTitle": `${parts[0]}`,
            "formType": "pollrequest",
            "formId": `${newpollId}`,
            "endpoint": `${process.env.WEBHOOKURL}/submit`
          }
        }
      ]
    }

    // Send the poll into the Webex Space it was requested in.
    await bot.sendCard(
      pollcard,
      // Error message if applicable.
      "pollcard"
    )

    console.log(`Dming ${followupperson} with the follow-up card: ${pollfollowupcard}.`);

    try {
      bot.dmCard(followupperson, pollfollowupcard, "This is fallback text if the client can't render this card.");
    } catch (error) {
      console.log(`Error DMing the card to ${followupperson}:\n${error}`);
    }

    console.log(
      "Poll Created:", parts
      );
    }
    // Call this function.
    pollcreate();
  },
  "poll",
  0
)

//
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
  console.log(`Received Attachment:\n${JSON.stringify(trigger.attachmentAction, null, 2)}`);

  // Handle POLL SUBMISSIONS (pollitem)
  // Submitted when a user selects an option in a poll and clicks 'Submit'
  if (formData.formType == "pollitem") {
    // Log the submission
    console.log("Handling 'pollitem': Poll Selection Submission");
    //bot.say(`${attachedForm.id}, you selected ${selectedOption}! (this is a debug message)`);
    submitPollResponse(formData.formId, attachedForm.personId, formData.polloption);
  }

  // Handle POLL STATUS REQUEST (pollrequest)
  // Submitted when a user with a follow-up DM from the bot clicks 'View Current Results'; See 'pollfollowupcard' for template and logic.
  if (formData.formType == "pollrequest") {

    // More 'concise'ing
    // choiceTitles is a string array of all possible options in the poll 
    let choiceTitles = formData.choiceTitles;
    // formTitle is the string English title of the original poll
    let formTitle = formData.formTitle;
    // pollId is the hex specifier of the original poll (and name of the JSON file containing its data)
    const pollId = trigger.attachmentAction.inputs.formId;

    // Some logging
    console.log(`Poll status request made for poll ${pollId}.`);
    console.log("\nResults: ");

    // Then we call our handy getPollResults() which will handle gathering all of the data.
    let failedGetPollResults = 0;
    try {
      const results = getPollResults(pollId);
      

      // Then here, we'll count how many times each option was selected.
      // tallycount will contain a key-pair of an 'selectedOptionTitle': 'count'
      const tallyCount = {};
      Object.keys(results).forEach((personId) => {
        const selectedOptionTitle = results[personId];
        console.log(`${personId}: ${selectedOptionTitle}`);
        if (selectedOptionTitle in tallyCount) {
          tallyCount[selectedOptionTitle]++;
        }
        else {
          tallyCount[selectedOptionTitle] = 1;
        }
      });

      // Then we're going to fill in the rest of the possible results; if the choice doesn't exist in the tallyCount then we'll just give it a 0.
      for (let i = 1; i < choiceTitles.length; i++) {
        if (!(choiceTitles[i] in tallyCount)) {
          tallyCount[choiceTitles[i]] = 0;
        }
      }
      
      // Display the counts in console by looping for the amount of selectedOptionTitles there are in tallyCount.
      console.log(`Tally for poll ${pollId}:`);
      Object.entries(tallyCount).forEach(([selectedOptionTitle, count]) => {
        console.log(`${selectedOptionTitle}: ${count}`);
      });

      // Here we're going to create our template card for displaying the results of a poll,
      // Starting with dynamicResults, which will be a chunk of Adaptive Card syntax that will contain the options of the poll along with their counts.
      let dynamicResults = [];
      Object.entries(tallyCount).forEach(([selectedOptionTitle, count]) => {
        console.log(`fitting ${selectedOptionTitle}`);
        console.log(`specifying ${count}`);
        let singleresult =
          {
            type: "TextBlock",
            text: `${selectedOptionTitle}: ${count}`,
            weight: "Bolder",
            spacing: "Small",
            size: "Medium",
          };
        dynamicResults.push(singleresult);
      });

      // debug
      // console.log(`Dynamic Results::: \n\n${dynamicResults}\n\n`);

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
});

// This function will find all of the data points in a specific JSON specified by its pollId, and fetch all of the choices made by each user.
function getPollResults(pollId) {
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
}

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


framework.hears (
  "retrievepoll",
  (bot, trigger) => {
    console.log("retrievepoll");
  },
  "retrievepoll",
  0
)

///
///
/// Down here is where I keep all of my small cogs that keep the machine working. All of these are critical!
///
///

// API Setup Start
// We set up our webhook on the Webex API to be able to send and receive data like submissions from a poll.
// Here's the 'firehose', which will just tell the API that we want to send and receive anything possible.
const firehose = {
  name: 'Gabe\'sAwesome Bot Webhook Firehose',
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