import { Meteor } from "meteor/meteor";
import { Inject } from "meteor/meteorhacks:inject-initial";
import helmet from "helmet";
const permissionsPolicy = require("permissions-policy");
// collections
import "/imports/api/collections/parcels";
import "/imports/api/collections/clients";
import "/imports/api/collections/carriers";
import "/imports/api/collections/recipients";
import "/imports/api/collections/config";
import "/imports/api/collections/outboundEmailLogs";
import "/imports/api/collections/timeZones";
import "/imports/api/collections/defaultCarriers";
import "/imports/api/collections/defaultDeliveryTypes";
import "/imports/api/collections/deliveryTypes";
import "/imports/api/collections/userLoginActivity";
import "/imports/api/collections/clientsGroups";
// publish data
import "/imports/api/publications/config";
// server methods
import "/imports/api/methods/parcels";
import "/imports/api/methods/users";
import "/imports/api/methods/clients";
import "/imports/api/methods/outboundEmailLogs";
import "/imports/api/methods/timeZones";
import "/imports/api/methods/deliveryTypes";
import "/imports/api/methods/userLoginActivity";
import "/imports/api/methods/clientsGroups";
// other components
import "./email.js";
import "./commonMethods.js";
import "./slack";
// run cron jobs
// import './cron';
// insert test data
// import './fixtures';

Meteor.startup(() => {
  // code to run on server at startup
  if (process.env.NODE_ENV === "production") {
    Meteor.call("sendToSlack", "postrubella Admin App server started!");
  } else {
    Meteor.call("sendToSlack", "postrubella Admin App dev server started!");
  }
  //set html header
  Inject.rawHead(
    "header",
    '<head><title>postrubella Admin</title><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1" /><meta name="apple-mobile-web-app-capable" content="yes"></head>'
  );
  // Helmet configuration
  WebApp.connectHandlers.use(helmet.hsts());
  WebApp.connectHandlers.use(helmet.referrerPolicy());
  WebApp.connectHandlers.use(helmet.noSniff());
  WebApp.connectHandlers.use(helmet.ieNoOpen());
  WebApp.connectHandlers.use(helmet.xssFilter());
  WebApp.connectHandlers.use(helmet.frameguard());
  WebApp.connectHandlers.use(helmet.expectCt());
  WebApp.connectHandlers.use(helmet.dnsPrefetchControl());
  WebApp.connectHandlers.use(helmet.permittedCrossDomainPolicies());
  WebApp.connectHandlers.use(helmet.hidePoweredBy());
  // Permissions Policy
  WebApp.connectHandlers.use(
    permissionsPolicy({
      features: {
        fullscreen: ["self"],
        vibrate: ["none"],
        payment: ["self"],
        syncXhr: [],
      },
    })
  );
});
