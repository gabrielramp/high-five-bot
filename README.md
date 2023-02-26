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

[getallemails](https://github.com/gabrielramp/high-five-bot#getallemails)

[highfive](https://github.com/gabrielramp/high-five-bot#highfive)

[birthdaycard](https://github.com/gabrielramp/high-five-bot#birthdaycard)

[poll](https://github.com/gabrielramp/high-five-bot#poll)

[freeform](https://github.com/gabrielramp/high-five-bot#freeform)

[gas](https://github.com/gabrielramp/high-five-bot#gas)

### getallemails

Syntax: ``getallemails``

Retrieves all emails in the space that the command is sent and sends the list to the invoker.

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

This command can handle an infinite number of poll answers, separated in the text box by ';' semicolons. This poll can handle multi-select, and toggle between anonymous and non-anonymous poll results. Enabling the 'Other' freeform option will allow the poll takers to submit their answer as 'Other' and specify their choice in a text box.

![image](https://user-images.githubusercontent.com/86631042/221441681-9d0476e6-5130-49de-911a-f4a3fa77f31e.png)

Once submitted, the message is deleted and replaced with the created poll:

![image](https://i.imgur.com/pHG7qYb.gif)

Simultaneously, the evoker is sent a direct message with a card telling them how to view the results of the poll:

![image](https://user-images.githubusercontent.com/86631042/221441908-115d6d85-722c-4afe-b345-1974b4df45ff.png)

Clicking "View Current Results" will message the user with the current results:

![image](https://user-images.githubusercontent.com/86631042/221442225-27aeef1f-9a20-41b8-bb9f-0ec0a3cefe70.png)

### freeform

Syntax: ``freeform``

Much like ``poll``, evoking ``freeform`` will yield a reply from the bot for a question to post. ``freeform`` is meant for feedback-style questions, wherein users of the Space are encouraged to type out submissions with a limit of 500 characters. Only the user that evoked the bot can submit this card. The "Anonymous submissions" checkbox toggles whether the results of the question will display the respective submitter's names with their responses.

![image](https://user-images.githubusercontent.com/86631042/219971666-b28ce430-719e-49fd-bbf6-c48d0bed1327.png)

Once submitting a question, the message is deleted and replaced with a freeform text box for responses:

![image](https://user-images.githubusercontent.com/86631042/219922592-1493c7bd-b6c9-4739-9f44-56b54268117d.png)

Simultaneously, the evoker is sent a direct message with a card telling them how to view the freeform submissions:

![image](https://user-images.githubusercontent.com/86631042/219923284-b9018cbe-428c-48ff-84f2-265df17ef3c8.png)

Clicking "View Current Responses" will message the user with all recorded responses:

![image](https://user-images.githubusercontent.com/86631042/219923013-4ab506f9-7ba1-44bd-9fe2-78afe6eeee90.png)

### gas

Syntax: ``gas`` Only works as a direct message to Highfive.

Gas someone up! Invoking ``gas`` will yield a card to send a recipient an anonymous commendation to which they can reply to once if they wish! This feature is meant to encourage your team to lift each other up!

![image](https://user-images.githubusercontent.com/86631042/220245464-963854ef-5fdc-4945-a4e5-b7067f5af798.png)

After sending your positive message:

![image](https://user-images.githubusercontent.com/86631042/220245730-a051bffe-8021-4183-a315-76ded2b011f6.png)

What the recipient sees:

![image](https://user-images.githubusercontent.com/86631042/220245816-c4360812-b620-4686-bd4f-0cd81261655f.png)

Replying to gas:

![image](https://user-images.githubusercontent.com/86631042/220245865-4fc73340-9137-477f-bd47-1f5239e250fd.png)

Receiving a reply to your gas:

![image](https://user-images.githubusercontent.com/86631042/220245991-70545ab2-13cf-405d-bdf8-8dd0edc8d858.png)

After sending a reply:

![image](https://user-images.githubusercontent.com/86631042/220246037-d7edefe5-e5db-4903-832b-4db57b43863e.png)

## Credits

### Special thanks to Brad, Julianna, and Max for breaking the bot on purpose, and to Victor Algaze for encouraging me :)
