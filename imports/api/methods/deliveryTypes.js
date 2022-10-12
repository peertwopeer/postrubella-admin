import { Meteor }  from 'meteor/meteor';
import { DeliveryTypes }  from '/imports/api/collections/deliveryTypes';
import { check } from 'meteor/check';

Meteor.methods({

    // DeliveryTypes dropdown Options
    'deliveryTypes.dropdownOptions': function (clientId=false) {
       check(clientId, String);
       if (!Meteor.user()) throw new Meteor.Error('not authorized to perform this action'); 
       if(clientId) return DeliveryTypes.find({clientId},{fields:{'_id':1,'deliveryTypeName':1},sort: [['deliveryTypeName', 'asc']]}).fetch();
       return DeliveryTypes.find({},{fields:{'_id':1,'deliveryTypeName':1},sort: [['deliveryTypeName', 'asc']]}).fetch();
   },

})