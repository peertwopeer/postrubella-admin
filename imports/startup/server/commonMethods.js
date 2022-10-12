import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Match } from "meteor/check";

/*
 Common methods for server-side [Meteor methods]
*/

if (Meteor.isServer) {
  Meteor.methods({
    sendEmail: function (to, from, subject, html, attachments, replyTo) {
      check([to, from, subject, html, replyTo], [String]);
      check(attachments, Match.OneOf(String, null));

      let serverUrl = Meteor.absoluteUrl();
      let liveServers = ["https://admin.postrubella.io"];
      let isLive = liveServers.includes(serverUrl);
      if (!isLive || process.env.NODE_ENV == "dev") {
        let domain = to.split("@")[1];
        let id = to.split("@")[0];
        if (domain !== "org_name.io" && domain !== "loremine.com") {
          to = id + "@org_name.io";
        }
      }
      try {
        //send email
        Email.send({
          to,
          from,
          subject,
          html,
          attachments,
          replyTo,
        });
        //update log
        Meteor.call("outboundEmailLogs.insert", to, subject, html);
      } catch (error) {
        console.error(error);
      }
    },
  });
}
