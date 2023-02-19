# high-five-bot
A Webex Teams bot built to enhance interaction and recognition within the 2023 January - June CXA Co-op experience!

This bot requires a running ngrok server for the Webex API webhook and is built off of the Webex Node.js Framework by the Webex Community. You can view this framework [here](https://github.com/WebexCommunity/webex-node-bot-framework).

Any mention of a "card" or "adaptive card" is a reference to Microsoft Adaptive Cards, which are heavily utilized in this bot. You can find the reference for Microsoft Adaptive Card utilization with Webex bots [here](https://developer.webex.com/docs/api/guides/cards). 

## Features

The bot can be messaged directly to evoke any of the available bot commands!

Within a space, the bot must be mentioned with an accompanied command to receive the interaction.

i.e to evoke the ``poll`` command in a space, type ``@mention poll``.

Here is a list of available commands high-five-bot will handle!

Table of Contents:

[highfive](https://github.com/gabrielramp/high-five-bot/blob/main/README.md#highfive)

[birthdaycard](https://github.com/gabrielramp/high-five-bot/blob/main/README.md#birthdaycard)

[poll](https://github.com/gabrielramp/high-five-bot/blob/main/README.md#poll)

[freeform](https://github.com/gabrielramp/high-five-bot/blob/main/README.md#freeform)

### highfive

Syntax: ``highfive <recipient-email>``

Highlights High Five recipients :) Supports multiple emails.

![highfiveimage](https://user-images.githubusercontent.com/86631042/219921649-a8726b75-4b70-470f-a2ed-1052599cd563.png)

``recipient-email`` is parsed for its string before the '@' to reference a local-storage image to use in './images'.

### birthdaycard

Syntax: ``highfive <recipient-email>``

Highlights birthday person! Uses person's profile picture image available on Webex API.

![birthdayimage](https://user-images.githubusercontent.com/86631042/219921645-5393310d-ec65-462d-946f-c2efd9152b3e.png)

### poll

Syntax: ``poll``

Evokes the bot to post an adaptive card with text inputs for creating a new poll. Only the user that evoked the bot can submit this card.

This command can handle an infinite number of poll answers, separated in the text box by ';' semicolons.

![poll1](https://user-images.githubusercontent.com/86631042/219921639-115e701a-29d0-4584-9c60-cba8c648fc1a.png)

Once submitted, the message is deleted and replaced with the created poll:

![image](https://i.imgur.com/2CQLJQg.gif)

Simultaneously, the evoker is sent a direct message with a card telling them how to view the results of the poll:

![image](https://user-images.githubusercontent.com/86631042/219922173-001e0d25-dd33-4d29-ad5f-80ca81570fe0.png)

Clicking "View Current Results" will message the user with the current results:

![image](https://user-images.githubusercontent.com/86631042/219922228-48b04e3e-ce64-4c18-9d38-38a50cc4bc4a.png)

### freeform

Syntax: ``freeform``

Much like ``poll``, evoking ``freeform`` will yield a reply from the bot for a question to post. ``freeform`` is meant for feedback-style questions, wherein users of the Space are encouraged to type out submissions with a limit of 500 characters. Only the user that evoked the bot can submit this card.

![image](https://user-images.githubusercontent.com/86631042/219922328-1007a209-daf0-45ea-a105-d4b7105bf13f.png)

Once submitting a question, the message is deleted and replaced with a freeform text box for responses:

![image](https://user-images.githubusercontent.com/86631042/219922592-1493c7bd-b6c9-4739-9f44-56b54268117d.png)

Simultaneously, the evoker is sent a direct message with a card telling them how to view the freeform submissions:

![image](https://user-images.githubusercontent.com/86631042/219922599-f5ae94c7-9353-4c5c-8fd0-ad69e20c837e.png)

Clicking "View Current Responses" will message the user with all recorded responses:

![image](https://user-images.githubusercontent.com/86631042/219923013-4ab506f9-7ba1-44bd-9fe2-78afe6eeee90.png)

