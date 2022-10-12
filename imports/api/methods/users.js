import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Match } from "meteor/check";

Meteor.methods({
  // Admin authentication
  "auth.admin": function (userId) {
    check(userId, String);
    return Roles.userIsInRole(userId, ["super-admin", "group-admin"]);
  },

  // Super admin authentication
  "auth.superAdmin": function (userId) {
    check(userId, String);
    return Roles.userIsInRole(userId, ["super-admin"]);
  },

  // Group Manager authentication
  "auth.GroupAdmin": function () {
    let user = Meteor.user();
    if (!user) throw new Meteor.Error("not authorized to perform this action");

    return Roles.userIsInRole(user._id, ["group-admin"]);
  },

  // Total users count
  "users.totalCount": function (searchParams) {
    check(searchParams, Object);
    return Meteor.users.find(searchParams).count();
  },

  // Users dropdown options
  "users.dropdownOptions": function (clientId = false, searchParams = {}) {
    check(clientId, String);
    check(searchParams, Object);
    if (clientId) searchParams["profile.clientId"] = clientId;
    if (!Meteor.user())
      throw new Meteor.Error("not authorized to perform this action");
    return Meteor.users
      .find(searchParams, {
        fields: { _id: 1, username: 1 },
        sort: [["username", "asc"]],
      })
      .fetch();
  },

  // add user role
  "users.addToRoles": function (userId, role) {
    check([userId, role], [String]);
    if (!Meteor.user())
      throw new Meteor.Error("not authorized to perform this action");
    return Meteor.users.update({ _id: userId }, { $set: { roles: role } });
  },

  // verify email
  "users.verifyEmail": function (userId) {
    check(userId, String);
    if (!Meteor.user())
      throw new Meteor.Error("not authorized to perform this action");
    return Meteor.users.update(
      { _id: userId },
      { $set: { "emails.0.verified": true } }
    );
  },

  // Create user
  "users.create": function (user) {
    check(user, Object);
    if (!Meteor.user())
      throw new Meteor.Error("not authorized to perform this action");
    check([user.profile.clientId], [String]);
    return Accounts.createUser(user);
  },

  // Send registration details to users email
  "users.sendRegistrationEmail": function (userId, password) {
    check([userId, password], [String]);
    if (!Meteor.user())
      throw new Meteor.Error("not authorized to perform this action");

    const user = Meteor.users.find({ _id: userId }).fetch()[0];
    const { email } = Meteor.settings.private.smtp;
    let urlForEmail = Meteor.absoluteUrl().includes(
      "https://admin.postrubella.io"
    )
      ? "https://postrubella.org_name.io"
      : "https://dev.postrubella.org_name.io";
    const text =
      `${
        "<div>" +
        "<div>" +
        '<div style="margin-bottom:20px"><img width="300" height="80" alt="logo" src="https://postrubella.ams3.digitaloceanspaces.com/public/img/logo_large.png"/></div>' +
        '<div style="margin-bottom:20px">Hi '
      }${
        user.profile.firstname
      },<br/><br/>Your login credentials for the postrubella. Visit <a href=${urlForEmail}>${urlForEmail}</a> to login.</div>` +
      `<div style="clear:both;"><b style="width:110px; display:block; float:left;">Username: </b>${user.username}</div>` +
      `<div style="clear:both;"><b style="width:110px; display:block; float:left;">Password: </b>${password}</div>` +
      '<div style="margin-top:20px">Yours sincerely,' +
      '<div style="margin-bottom:20px">The postrubella team.' +
      "</div>" +
      "</div>";
    //send email
    Meteor.call(
      "sendEmail",
      user.emails[0].address,
      `org_name postrubella ${email}`,
      "Welcome to the postrubella.",
      text,
      null,
      `org_name postrubella ${email}`
    );
  },

  // Delete user
  "users.delete": function (userId) {
    check(userId, String);
    if (!Meteor.user())
      throw new Meteor.Error("not authorized to perform this action");
    Meteor.users.remove(userId);
    return true;
  },

  // Update user
  "users.update": function (userId, user) {
    check(userId, String);
    check(user, Object);

    if (!Meteor.user())
      throw new Meteor.Error("not authorized to perform this action");

    const currentUserData = Meteor.users.find({ _id: userId }).fetch()[0];

    if (currentUserData["username"] !== user.username) {
      if (Meteor.users.findOne({ username: user.username }))
        throw new Meteor.Error("username already exists");
    }
    if (currentUserData["emails"][0]["address"] !== user.email) {
      if (Meteor.users.findOne({ "emails.0.address": user.email }))
        throw new Meteor.Error("Email id already exists");
    }

    const currentUserrole = Array.isArray(currentUserData.roles)
      ? currentUserData.roles[0]
      : currentUserData.roles;
    if (userId) {
      Meteor.users.update(
        {
          _id: userId,
        },
        {
          $set: {
            username: user.username,
            "emails.0.address": user.email,
            "profile.firstname": user.profile.firstname,
            "profile.lastname": user.profile.lastname,
            "profile.clientId": user.profile.clientId,
            roles:
              typeof user.roles !== "undefined"
                ? [user.roles]
                : [currentUserrole],
            updatedAt: new Date(),
          },
        }
      );

      if (user.password !== "" && typeof user.password !== "undefined")
        Accounts.setPassword(userId, user.password);
    }
    return true;
  },

  // List users
  "users.list": function (limit, page, searchParams) {
    check([limit, page], [Number]);
    check(searchParams, Object);
    if (!Meteor.user())
      throw new Meteor.Error("not authorized to perform this action");

    let skip = 0;
    if (page !== 1) {
      skip = limit * (page - 1);
    }
    let username = searchParams.username;
    delete searchParams.username;
    return Meteor.users
      .find(
        {
          $and: [
            { $or: [{ username: username }, { "emails.0.address": username }] },
            searchParams,
          ],
        },
        { limit, skip, sort: [["createdAt", "desc"]] }
      )
      .fetch();
  },
  "users.usersByClientIds": function (selectedClientIds, limit, searchParams) {
    check(selectedClientIds, Array);
    check(limit, Number);
    check(searchParams, Object);
    if (!Meteor.user())
      throw new Meteor.Error("not authorized to perform this action");

    return Meteor.users
      .find(
        {
          $and: [
            { "profile.clientId": { $in: selectedClientIds } },
            { roles: "group-admin" },
            searchParams,
          ],
        },
        { limit, sort: [["createdAt", "desc"]] }
      )
      .fetch();
  },

  // List admin users for a client
  "users.adminUsersListForClient": function (clientId) {
    check(clientId, String);
    if (!Meteor.user())
      throw new Meteor.Error("not authorized to perform this action");

    return Meteor.users
      .find({ "profile.clientId": clientId }, { sort: [["createdAt", "desc"]] })
      .fetch();
  },

  // Update user configuration
  "users.updateConfiguration": function (userId, configuration) {
    if (!Meteor.user())
      throw new Meteor.Error("not authorized to perform this action");

    check(configuration, Object);
    check(userId, String);

    if (userId) {
      Meteor.users.update(
        {
          _id: userId,
        },
        {
          $set: {
            "profile.language": configuration.language,
            "profile.timezone": configuration.timezone,
            twoFactorEnabled: configuration.twoFactorEnabled,
            updatedAt: new Date(),
          },
        }
      );
    }
    return true;
  },

  // Generate user login token
  "users.login-token": function (userId) {
    check(userId, String);
    const stampedLoginToken = Accounts._generateStampedLoginToken();
    Accounts._insertLoginToken(userId, stampedLoginToken);
    return stampedLoginToken;
  },
  // enable/disable user
  "users.enableDisable": function (userId) {
    check(userId, String);
    if (!Meteor.user())
      throw new Meteor.Error("not authorized to perform this action");
    let user = Meteor.users.find({ _id: userId }).fetch()[0];
    if (user.disabled === true) {
      Meteor.users.update({ _id: userId }, { $set: { disabled: false } });
    } else {
      Meteor.users.update(
        { _id: userId },
        { $set: { disabled: true, "services.resume.loginTokens": [] } }
      );
    }
    return true;
  },
  // login with password
  "user.loginWithPassword": function (userId, password) {
    check([userId, password], [String]);
    let user = Meteor.users
      .find({ $or: [{ username: userId }, { "emails.0.address": userId }] })
      .fetch()[0];
    if (user) {
      // Check user is disabled
      if (user.disabled == true) throw new Meteor.Error("User disabled");
      let auth = Accounts._checkPassword(user, password);
      if (auth.error) {
        throw new Meteor.Error(auth.error.reason);
      } else {
        return true;
      }
    } else {
      throw new Meteor.Error("User not found");
    }
  },
});

// Action before add a new user
Accounts.onCreateUser((options, user) => {
  if (options.profile) {
    user.profile = options.profile;
  }
  if (options.roles) {
    user.roles = options.roles;
  }
  // Enable two-factor auth
  user.twoFactorEnabled = true;
  return user;
});
