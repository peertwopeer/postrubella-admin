import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { OutboundEmailLogs } from "/imports/api/collections/outboundEmailLogs";

Meteor.methods({
  // Insert Email Logs
  "outboundEmailLogs.insert": function (to, subject, body) {
    check(to, String);
    check(subject, String);
    check(body, String);

    OutboundEmailLogs.insert({
      to,
      subject,
      body,
      createdAt: new Date(),
    });
  },
  "outboundEmailLogs.list": function (searchParams, limit, offset) {
    check(searchParams, Object);
    check([limit, offset], [Number]);

    if (!Meteor.user())
      throw new Meteor.Error("not authorized to perform this action");

    let result = OutboundEmailLogs.find(searchParams, {
      sort: [["createdAt", "desc"]],
      limit: limit,
      skip: offset,
    }).fetch();

    let total = OutboundEmailLogs.find(searchParams).count();
    return { result, total };
  },
});
