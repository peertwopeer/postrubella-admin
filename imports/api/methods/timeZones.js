import { Meteor }        from 'meteor/meteor';
import { TimeZones }       from '/imports/api/collections/timeZones';
import { check }         from 'meteor/check';



Meteor.methods({

    // timeZones dropdown Options
    'timeZones.dropdownOptions': function (limit,searchParams) {
        check(limit, Number);
        check(searchParams, Object);
       return TimeZones.find(searchParams,{fields:{'_id':1,'zone':1},limit,sort: [['zone', 'asc']]}).fetch();
   },

})