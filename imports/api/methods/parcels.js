import { Meteor }        from 'meteor/meteor';
import { Parcels }       from '/imports/api/collections/parcels';
import { ClientsGroups } from "/imports/api/collections/clientsGroups";
import { ParcelLogs }       from '/imports/api/collections/parcelLogs';
import { S3, spacesFolderBarcode, spacesFolderSignatures }   from '/imports/api/components/S3';
import { check }         from 'meteor/check';
import { Match }         from 'meteor/check';



Meteor.methods({

    // Line chart summary data - past 2 weeks , clientId by default false
    'parcels.twoWeeksPostsVolumeChart': async function (clientId=false) {
      check(clientId, Match.OneOf(String, Boolean));
      if (!Meteor.user()) throw new Meteor.Error('not authorized to perform this action');
      var result = await fetch(Meteor.settings.public.api_service.url+'/api/admin/line-chart-past-2-weeks',{method: 'POST',headers: {'Accept': 'application/json','Content-Type': 'application/json'}, body:JSON.stringify({clientId})}).then(response => response.text()).then(json => {                    
        return JSON.parse(json);
        }).catch(error => { console.log(error) });
       return Promise.resolve(result);
    },


    // Volume of post by day month year search, clientId by default false
    'parcels.postsVolumeByDateData': async function (date,clientId=false) {
      check(clientId, Match.OneOf(String, Boolean));
      check(date, Date);
      if (!Meteor.user()) throw new Meteor.Error('not authorized to perform this action');
      var result = await fetch(Meteor.settings.public.api_service.url+'/api/admin/volumes-post-by-date',{method: 'POST',headers: {'Accept': 'application/json','Content-Type': 'application/json'}, body:JSON.stringify({"date":date,clientId})}).then(response => response.text()).then(json => {                    
        return JSON.parse(json);
        }).catch(error => { console.log(error) });
       return Promise.resolve(result);
    },
    // Get parcel details  
    "parcels.getParcelDetails": function (parcelId) {
      check(parcelId, String);
      if (!Meteor.user())
        throw new Meteor.Error("not authorized to perform this action");
      return Parcels.find(parcelId, {
        fields: {
          owner: 0,
          senderId: 0,
          locationId: 0,
          destinationId: 0,
          locationClientId: 0,
          deliveredByOwner: 0,
        },
      }).fetch()[0];
    },
    // Get parcel logs  
    'parcels.getParcelLogs': function (parcelId) {
      check(parcelId, String);
      if (!Meteor.user()) throw new Meteor.Error('not authorized to perform this action');
        return ParcelLogs.find({parcelId}).fetch()[0];
    },
   // Total parcels count  
   "parcels.totalCount": async function (searchParams) {
    check(searchParams, Object);

    const user = Meteor.user();
    if (!user) throw new Meteor.Error("not authorized to perform this action");

    if (Roles.userIsInRole(user._id, ["group-admin"])) {
      const clientGroup = await ClientsGroups.find(
        { clients: user.profile.clientId },
        { fields: { clients: 1 } }
      ).fetch();
      if (Array.isArray(clientGroup) && clientGroup.length) {
        searchParams = {
          ...searchParams,
          clientId: { $in: clientGroup[0].clients },
        };
      }
    }
    return Parcels.find(searchParams).count();
    },
 
    // Parcel list  
    "parcels.list": async function (limit, page, searchParams) {
      check([limit, page], [Number]);
      check(searchParams, Object);
      const user = Meteor.user();
      if (!user) throw new Meteor.Error("not authorized to perform this action");
      let skip = 0;
      if (page !== 1) {
        skip = limit * (page - 1);
      }
      if (Roles.userIsInRole(user._id, ["group-admin"])) {
        const clientGroup = await ClientsGroups.find(
          { clients: user.profile.clientId },
          { fields: { clients: 1 } }
        ).fetch();
        if (Array.isArray(clientGroup) && clientGroup.length) {
          searchParams = {
            ...searchParams,
            clientId: { $in: clientGroup[0].clients },
          };
        }
      }
      return Parcels.find(searchParams, {
        fields: {
          owner: 0,
          senderId: 0,
          clientId: 0,
          updatedAt: 0,
          locationId: 0,
          destinationId: 0,
          locationClientId: 0,
          deliveredByOwner: 0,
        },
        limit,
        skip,
        sort: [["createdAt", "desc"]],
      }).fetch();
    },
    // Delete parcel  
    'parcel.delete': function (parcelId) {
      check(parcelId, String);
      if (!Meteor.user()) throw new Meteor.Error('not authorized to perform this action');
      let parcel = Parcels.find({"_id":parcelId}).fetch()[0];
      if(parcel){
        if(parcel.qrcode){
          let qrcodeBucket = spacesFolderBarcode+"/"+parcel.qrcode.split("/barcodes/").pop();
          let qrcodeKey = qrcodeBucket.split("/");
          qrcodeKey = qrcodeKey[qrcodeKey.length - 1];
          qrcodeBucket = qrcodeBucket.replace(qrcodeKey,"");
          qrcodeBucket = qrcodeBucket.slice(0, -1);
          // delete QR code
          S3.deleteObject({ Key: qrcodeKey, Bucket: `${qrcodeBucket}` }, (err, data) => {
            if (err) console.log(err, err.stack);
          });
        }
        if(parcel.recipientSignatureImage){
          //Delete signature if not used in other parcels
          if(Parcels.find({"recipientSignatureImage":parcel.recipientSignatureImage}).count() == 1){
            let signatureBucket = spacesFolderSignatures+"/"+parcel.recipientSignatureImage.split("/signatures/").pop();
            let signatureKey = signatureBucket.split("/");
            signatureKey = signatureKey[signatureKey.length - 1];
            signatureBucket = signatureBucket.replace(signatureKey,"");
            signatureBucket = signatureBucket.slice(0, -1);
            // delete Signature
            S3.deleteObject({ Key: signatureKey, Bucket: `${signatureBucket}` }, (err, data) => {
              if (err) console.log(err, err.stack);
            });
          }
        }
        Parcels.remove(parcelId);
      }
      return true;
    },
  
})