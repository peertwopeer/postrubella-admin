import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {

  const {
      username,
      password,
      server,
      port,
    } = Meteor.settings.private.smtp;

  process.env.MAIL_URL = `smtp://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${encodeURIComponent(server)}`;
  if (port) {
    process.env.MAIL_URL += `:${encodeURIComponent(port)}`;
  }
  if (Meteor.isDevelopment){
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
  }

});

