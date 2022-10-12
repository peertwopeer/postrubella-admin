import { Meteor }        from 'meteor/meteor';
import { UserLoginActivity }  from '/imports/api/collections/userLoginActivity';
import { check }         from 'meteor/check';

Meteor.methods({

  // List user LoginActivity
  'userLoginActivity.list': function (userId) {
    check(userId, String);
    if (!Meteor.user()) throw new Meteor.Error('not authorized to perform this action');
    return UserLoginActivity.find({userId},{limit:10, sort: [['createdAt', 'desc']]}).fetch();
  },

 

})