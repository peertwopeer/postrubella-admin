import { Meteor } from 'meteor/meteor';
import './useraccounts-configuration';
import './router';



Meteor.startup(() => {
  // code to run on client at startup
  console.log('client started');
});

