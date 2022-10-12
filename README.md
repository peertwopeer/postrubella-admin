# org_name postrubella - Admin Application

Admin site for support staff.

## Introduction

The admin site for postrubella is a place where the support staffs can view all users, user data, clients, log in to clients with a click, generate reports and add/remove/amend client profiles and users. Admin staff will be able to generate client reports(CSV) from the site and be able to make changes to and add new users, locations, recipients etc for clients remotely from the admin site as well as create logins/ instantly login to clients. Also they will be able to view :

- Volumes of post per client.
- Total volume of post by day month year search.
- Display last time client logged in.
- Activation date for client.
- Number of locations/ companies per client.

## Settings

Saved the file as JSON on the source code directory, you can find this at `/.deploy/` folder

#### Example setting file

```
{
  "public": {
    "cdn": "[s3-url]",
    "api_service": {
      "url": "[report-app-url]"
    }
  },
  "private": {
    "smtp": {
     "username": "[username]",
     "password": "[password]",
     "server": "[server]",
     "email": "[email-id]"
   },
   "spaces": {
     "ACCESS_KEY": "[key]",
     "SECRET_KEY": "[secrete]"
   },
   "slack": {
     "webhookUrl": "https://hooks.slack.com/services/xxxxxx/xxxxxx/xxxxxxxxx",
     "username": "[username]",
     "channel": "[channel]"
   }
  }
}
```

## Quick Start

- Install maildev package and run the command `maildev --incoming-user 'devuser' --incoming-pass 'password'`
- Configure the local smtp user and host in the `settings-local.json` file.
- Use `yarn start:local`command to run the app locally.

See `package.json` for more useful scripts.

---

## Commands in Detail

- 1. start:local
  - This script will run the postrubella-admin app on http://localhost:3000
    - Run `yarn start:local`

## Local server setup inscrutctions

```
$ git clone git@bitbucket.org/org_namedev/postrubella-admin.git
$ cd postrubella-admin
$ git checkout master
$ yarn install
$ yarn start:local
```

This should start postrubella on http://localhost:3000

## Author

org_name
