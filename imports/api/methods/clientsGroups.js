import { Meteor } from "meteor/meteor";
import { ClientsGroups } from "/imports/api/collections/clientsGroups";
import { Clients } from "/imports/api/collections/clients";

import { check } from "meteor/check";

Meteor.methods({
  // Create clients group
  "clientsGroup.create": function (clientGroup) {
    check(clientGroup, Object);

    if (!Meteor.user())
      throw new Meteor.Error("not authorized to perform this action");

    let name = clientGroup.groupName;
    let clients = clientGroup.selectedClients;
    let groupManagers = clientGroup.groupManagersId;

    return ClientsGroups.insert({
      name,
      clients,
      groupManagers,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  },

  // Update clients group
  "clientsGroup.update": function (groupId, clientGroup) {
    check(groupId, String);
    check(clientGroup, Object);
    try {
      if (!Meteor.user())
        throw new Meteor.Error("not authorized to perform this action");

      let name = clientGroup.groupName;
      let clients = clientGroup.selectedClients;
      let groupManagers = clientGroup.groupManagersId;

      let result = ClientsGroups.update(groupId, {
        $set: {
          name,
          clients,
          groupManagers,
          updatedAt: new Date(),
        },
      });

      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  //set groupID in clients
  "clientsGroup.setGroupIds": function (clientIds) {
    check(clientIds, Object);

    if (!Meteor.user()) {
      throw new Meteor.Error("not authorized to perform this action");
    }
    return Clients.update(
      { _id: { $in: clientIds.selectedClients } },
      { $set: { clientGroupId: clientIds.groupId } },
      { multi: true }
    );
  },
  
  // unset groupID in clients
  "clientsGroup.unSetGroupIds": function (clientIds) {
    check(clientIds, Object);
    if (!Meteor.user()) {
      throw new Meteor.Error("not authorized to perform this action");
    }
    return Clients.update(
      { _id: { $in: clientIds.clientIds } },
      { $unset: { clientGroupId: "" } },
      { multi: true }
    );
  },

  // Delete clients group
  "clientsGroup.delete": function (groupId) {
    check(groupId, String);
    if (!Meteor.user()) {
      throw new Meteor.Error("not authorized to perform this action");
    }
    return ClientsGroups.remove(groupId);
  },

  //get client groups count
  "clientGroups.totalCount": function (searchParams) {
    check(searchParams, Object);
    return ClientsGroups.find(searchParams).count();
  },
  "clientGroups.list": function (limit, page, searchParams) {
    check([limit, page], [Number]);
    check(searchParams, Object);
    if (!Meteor.user())
      throw new Meteor.Error("not authorized to perform this action");
    let skip = 0;
    if (page !== 1) {
      skip = limit * (page - 1);
    }
    return ClientsGroups.find(searchParams, {
      limit,
      skip,
      sort: [["createdAt", "desc"]],
    }).fetch();
  },
  "clientGroup.clientsInClientsGroup": function (clientIds) {
    check(clientIds, Array);
    if (!Meteor.user()) {
      throw new Meteor.Error("not authorized to perform this action");
    }
    return Clients.find({ _id: { $in: clientIds } }).fetch();
  },
  "clientGroup.ManagersInClientsGroup": function (userIds) {
    check(userIds, Array);
    if (!Meteor.user()) {
      throw new Meteor.Error("not authorized to perform this action");
    }
    return Meteor.users.find({ _id: { $in: userIds } }).fetch();
  },
});
