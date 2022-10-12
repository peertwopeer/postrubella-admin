import { Meteor } from "meteor/meteor";
import { Clients } from "/imports/api/collections/clients";
import { Carriers } from "/imports/api/collections/carriers";
import { Recipients } from "/imports/api/collections/recipients";
import { DeliveryTypes } from "/imports/api/collections/deliveryTypes";
import { DefaultCarriers } from "/imports/api/collections/defaultCarriers";
import { DefaultDeliveryTypes } from "/imports/api/collections/defaultDeliveryTypes";
import { S3, spacesFolderLogo } from "/imports/api/components/S3";
import { check } from "meteor/check";
import { Match } from "meteor/check";

Meteor.methods({
  // Get client details
  "clients.getClientDetails": function (clientId) {
    check(clientId, String);
    if (!Meteor.user())
      throw new Meteor.Error("not authorized to perform this action");
    return Clients.find(clientId).fetch()[0];
  },

  // Total clients count
  "clients.totalCount": function (searchParams) {
    check(searchParams, Object);
    return Clients.find(searchParams).count();
  },

  // clients dropdown Options
  "clients.dropdownOptions": function (searchParams) {
    check(searchParams, Object);
    if (!Meteor.user())
      throw new Meteor.Error("not authorized to perform this action");

    return Clients.find(searchParams, {
      fields: { _id: 1, clientName: 1 },
      sort: [["clientName", "asc"]],
    }).fetch();
  },
  // clients dropdown Options
  "clients.asyncDropdownOptions": function (limit, searchParams) {
    check(limit, Number);
    check(searchParams, Object);
    if (!Meteor.user())
      throw new Meteor.Error("not authorized to perform this action");

    return Clients.find(searchParams, {
      fields: { _id: 1, clientName: 1 },
      limit,
      sort: [["clientName", "asc"]],
    }).fetch();
  },

  // Clients Data Volume, clientId by default false
  "clients.clientsDataVolume": async function (clientId = false) {
    check(clientId, Match.OneOf(String, Boolean));
    if (!Meteor.user())
      throw new Meteor.Error("not authorized to perform this action");
    var result = await fetch(
      Meteor.settings.public.api_service.url + "/api/admin/clients-data-volume",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clientId }),
      }
    )
      .then((response) => response.text())
      .then((json) => {
        return JSON.parse(json);
      })
      .catch((error) => {
        console.log(error);
      });
    return Promise.resolve(result);
  },

  // Create client
  "clients.create": function (client) {
    check(client, Object);
    if (!Meteor.user())
      throw new Meteor.Error("not authorized to perform this action");

    const user = Meteor.user();

    if (Clients.findOne({ clientEmail: client.clientEmail }))
      throw new Meteor.Error("email id already exists");

    let clientName = client.clientName;
    let clientEmail = client.clientEmail;
    let clientBarcodeId = client.clientBarcodeId;
    let defaultLanguage = client.defaultLanguage;
    let defaultTimeZone = client.defaultTimeZone;
    let optionalTimeZones = client.optionalTimeZones;
    let optionalLanguages = client.optionalLanguages;
    let clientBarcodeNumber = 10000;

    check([clientName, clientEmail, clientBarcodeId], [String]);
    check(clientBarcodeNumber, Number);

    let result = Clients.insert({
      clientName,
      clientEmail,
      clientBarcodeId,
      clientBarcodeNumber,
      defaultLanguage,
      defaultTimeZone,
      optionalLanguages,
      optionalTimeZones,
      createdAt: new Date(),
      owner: user._id,
      username: user.username,
    });

    return result;
  },

  // Update client
  "clients.update": function (clientId, client) {
    check(clientId, String);
    check(client, Object);
    if (!Meteor.user())
      throw new Meteor.Error("not authorized to perform this action");
    if (
      Clients.find(clientId).fetch()[0]["clientEmail"] !== client.clientEmail
    ) {
      if (Clients.findOne({ clientEmail: client.clientEmail }))
        throw new Meteor.Error("Email id already exists");
    }

    let clientName = client.clientName;
    let clientEmail = client.clientEmail;
    let clientBarcodeId = client.clientBarcodeId;
    let defaultLanguage = client.defaultLanguage;
    let defaultTimeZone = client.defaultTimeZone;
    let optionalTimeZones = client.optionalTimeZones;
    let optionalLanguages = client.optionalLanguages;

    check([clientName, clientEmail, clientBarcodeId], [String]);

    let result = Clients.update(clientId, {
      $set: {
        clientName,
        clientEmail,
        clientBarcodeId,
        defaultLanguage,
        defaultTimeZone,
        optionalTimeZones,
        optionalLanguages,
        updatedAt: new Date(),
      },
    });

    return result;
  },

  // Delete client
  "clients.delete": function (clientId) {
    check(clientId, String);
    if (!Meteor.user())
      throw new Meteor.Error("not authorized to perform this action");
    Clients.remove(clientId);
    return true;
  },

  // Clients list
  "clients.list": function (limit, page, searchParams) {
    check(page, Number);
    check(limit, Number);
    check(searchParams, Object);
    if (!Meteor.user())
      throw new Meteor.Error("not authorized to perform this action");
    let skip = 0;
    if (page !== 1) {
      skip = limit * (page - 1);
    }
    return Clients.find(searchParams, {
      limit,
      skip,
      sort: [["createdAt", "desc"]],
    }).fetch();
  },

  // Upload logo
  "clients.uploadLogo": async function (clientId, logo) {
    check([clientId, logo], [String]);
    if (!Meteor.user())
      throw new Meteor.Error("not authorized to perform this action");

    let cllient = Clients.find({ _id: clientId }).fetch()[0];
    if (!cllient) throw new Meteor.Error("Client not found");

    let clientEmail = cllient.clientEmail;

    if (typeof logo !== "undefined" && logo !== "") {
      let formattedUserId = clientEmail.replace(/@/g, "-").replace(/\./g, "-");
      var logoName = `${formattedUserId}-logo.png`;
      var buf = Buffer.from(
        logo.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      );
      // params for s3 upload logo image
      let paramsLogo = {
        Body: buf,
        Bucket: `${spacesFolderLogo}`,
        Key: `${logoName}`,
        ContentEncoding: "base64",
        ContentType: "image/jpeg",
        ACL: "public-read",
      };
      // Add file to s3 Space
      const uploadPromise = await S3.upload(paramsLogo).promise();
      if (uploadPromise.Location) {
        Meteor.bindEnvironment(
          Clients.update(
            { clientEmail },
            {
              $set: {
                logo: uploadPromise.Location,
              },
            }
          )
        );
        return Promise.resolve(uploadPromise.Location);
      } else {
        return Promise.resolve(uploadPromise.Error);
      }
    } else {
      return false;
    }
  },
  // Remove logo
  "clients.removeLogo": function (clientId) {
    check(clientId, String);
    if (!Meteor.user())
      throw new Meteor.Error("not authorized to perform this action");

    let logoUrl = Clients.find({ _id: clientId }).fetch()[0].logo;
    let logoName = logoUrl.substring(
      logoUrl.lastIndexOf("/") + 1,
      logoUrl.length
    );

    S3.deleteObject(
      { Key: logoName, Bucket: `${spacesFolderLogo}` },
      (err, data) => {
        if (err) console.log(err, err.stack);
      }
    );

    Clients.update(
      { _id: clientId },
      {
        $set: {
          logo: "",
        },
      }
    );
    return true;
  },
  // Load default carriers
  "clients.loadDefaultCarriers": function (clientId) {
    check(clientId, String);
    if (!Meteor.user())
      throw new Meteor.Error("not authorized to perform this action");

    let user = Meteor.user();
    let countCarriers = Carriers.find(
      { clientId: clientId },
      { limit: 2 }
    ).count();
    if (countCarriers > 1) {
      throw new Meteor.Error("Carriers already exist");
    }

    let carrierData = DefaultCarriers.find({}).fetch();
    carrierData.forEach((carrier) => {
      Carriers.insert({
        carrierName: carrier.carrierName,
        clientId: clientId,
        owner: user._id,
        username: user.username,
        createdAt: new Date(),
      });
    });
    return true;
  },
  // Load default Delivery Types
  "clients.loadDefaultDeliveryTypes": function (clientId) {
    check(clientId, String);
    if (!Meteor.user())
      throw new Meteor.Error("not authorized to perform this action");

    let user = Meteor.user();
    let countDeliveryTypes = DeliveryTypes.find(
      { clientId: clientId },
      { limit: 2 }
    ).count();
    if (countDeliveryTypes > 1) {
      throw new Meteor.Error("Delivery Types already exist");
    }

    let deliveryTypesData = DefaultDeliveryTypes.find({}).fetch();
    deliveryTypesData.forEach((deliveryType) => {
      DeliveryTypes.insert({
        deliveryTypeName: deliveryType.DeliveryTypeName,
        clientId: clientId,
        owner: user._id,
        username: user.username,
        createdAt: new Date(),
      });
    });
    return true;
  },
  // Upload Recipients Data
  "clients.loadRecipientsData": function (clientId, recipientData) {
    if (!Meteor.user())
      throw new Meteor.Error("not authorized to perform this action");

    check(recipientData, Array);
    check(clientId, String);
    recipientData.forEach((recipient) => {
      key = Object.keys(recipient);
      recipient["recipientName"] = recipient[key]; // Assign new key
      delete recipient[key]; // Delete old key
      if (
        Recipients.findOne({
          recipientName: recipient.recipientName,
          clientId: clientId,
        })
      )
        return;
      Recipients.insert({
        recipientName: recipient.recipientName,
        createdAt: new Date(),
        owner: this.userId,
        username: Meteor.users.findOne(this.userId).username,
        clientId,
      });
    });
    return true;
  },
  // update Default Values
  "clients.updateDefaultValues": function (clientId, defaultValues) {
    check(clientId, String);
    check(defaultValues, Object);
    if (!Meteor.user())
      throw new Meteor.Error("not authorized to perform this action");

    Clients.update(clientId, {
      $set: {
        deliveryType: defaultValues.defaultDeliveryTpe,
        deliveryUser: defaultValues.defaultAssignAction,
        receiveUser: defaultValues.defaultReceivingAction,
        customEmail: defaultValues.customEmail,
        updatedAt: new Date(),
      },
    });

    return true;
  },
});
