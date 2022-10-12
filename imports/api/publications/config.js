import { Meteor } from 'meteor/meteor';



if (Meteor.isServer) {

    import { Config } from '/imports/api/collections/config';
    
    Meteor.publish('config', () => {
        return Config.find({}, {});
    });
  
}

