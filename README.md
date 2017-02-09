# Auth0 Slack MFA Extension
The Slack MFA Extension will send Slack messages containing a magic link to your users.  Once the
user clicks the magic link they will complete their login process.


## Installation

## Setting up MongoDB

The Slack MFA extension utilizes MongoDB to store a whitelist of valid JWT's.  Each JWT is a onetime use 
token that is revoked after it is used.  MongoDB manages the whitelist, which is shared by the rule and the extension.

- Setup a collection named: `Token`
- Create a unique index for _id:
```
{
  "v": 1,
  "key": {
    "_id": 1
  },
  "name": "_id_",
  "ns": "<db-name>.Token"
}
```

- Create a TTL Index for the collection:

```
{
  "v": 1,
  "key": {
    "issued": 1
  },
  "name": "token-cleanse",
  "ns": "<db-name>.Token",
  "background": true,
  "expireAfterSeconds": 300
}
```

## Getting a Slack API Token

This key is used to send direct messages to members of your Slack Team.  To acquire and API token you must create a new [custom bot user](https://my.slack.com/services/new/bot) or using an existing one.
It is better to setup a specific bot for this activity.  The MFA magic links will be sent to you users on behalf of the bot.

## Installing the extension

Go to the [Extensions](https://manage.auth0.com/#/extensions) tab of the dashboard.

![](/media/step1-extensions-overview.png)

Click **CREATE EXTENSION** and install the extension from this repository: https://github.com/auth0-extensions/auth0-slack-mfa

![](/media/step2-extension-link.png)

Finally enter your Box and Auth0 settings:

 - `SLACK_API_TOKEN`: Your teams Slack API Key
 - `MONGO_CONNECTION_STRING`: The connection string for you MongoDB instance.

 
 # TODO:
 - [ ] Script out the creation of a mongodb collection and ttl index.
 - [ ] Get assets for logos.
 - [ ] Deploy assets to cdn so help screen is useful
 - [ ] Pull rule's configuration from the extension API instead of hard coding it.
