import React from "react";
import { Meteor } from "meteor/meteor";
import { mount } from "react-mounter";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
//layouts
import Admin from "/imports/ui/layouts/Admin";
import App from "/imports/ui/layouts/App";
//views
import Dashboard from "/imports/ui/pages/Dashboard";
import GMDashboard from "/imports/ui/pages/GMDashboard";
import Login from "/imports/ui/pages/Login";
import Users from "/imports/ui/pages/Users";
import Clients from "/imports/ui/pages/Clients";
import Parcels from "/imports/ui/pages/Parcels";
import Report from "/imports/ui/pages/Report";
import OutBoundEmailLogs from "/imports/ui/pages/OutBoundEmailLogs";
import Profile from "/imports/ui/pages/Profile";
import UsersLoginActivity from "/imports/ui/pages/UsersLoginActivity";
import ClientsAdminUsers from "/imports/ui/pages/ClientsAdminUsers";
import ClientGroups from "/imports/ui/pages/ClientGroups";
import ClientsInClientsGroup from "/imports/ui/pages/ClientsInClientsGroup.jsx";
import TrackParcel from "/imports/ui/pages/TrackParcel.jsx";
import GroupManagersClientGroup from "/imports/ui/pages/GroupManagersClientGroup.jsx";

Meteor.startup(() => {});

// Routes
FlowRouter.route("/login", {
  action() {
    mount(App, {
      content: <Login />,
      title: "Login",
    });
  },
  name: "Login",
});
FlowRouter.route("/", {
  triggersEnter: [ensureSignedIn, ensureIsAdmin, isGroupAdmin],
  action() {
    mount(Admin, {
      content: <Dashboard />,
      title: "Dashboard",
    });
  },
  name: "Dashboard",
});
FlowRouter.route("/group-manager-dashboard", {
  triggersEnter: [ensureSignedIn, ensureIsAdmin],
  action() {
    mount(Admin, {
      content: <GMDashboard />,
      title: "Client Group Manager",
    });
  },
  name: "GMDashboard",
});
FlowRouter.route("/users", {
  triggersEnter: [ensureSignedIn, ensureIsAdmin, ensureIsSuperAdmin],
  action() {
    mount(Admin, {
      content: <Users />,
      title: "Users",
    });
  },
  name: "Users",
});
FlowRouter.route("/clients", {
  triggersEnter: [ensureSignedIn, ensureIsAdmin, ensureIsSuperAdmin],
  action() {
    mount(Admin, {
      content: <Clients />,
      title: "Clients",
    });
  },
  name: "Clients",
});
FlowRouter.route("/parcels", {
  triggersEnter: [ensureSignedIn, ensureIsAdmin],
  action() {
    mount(Admin, {
      content: <Parcels />,
      title: "Parcels",
    });
  },
  name: "Parcels",
});
FlowRouter.route("/report", {
  triggersEnter: [ensureSignedIn, ensureIsAdmin, ensureIsSuperAdmin],
  action() {
    mount(Admin, {
      content: <Report />,
      title: "Report",
    });
  },
  name: "Report",
});
FlowRouter.route("/outbound-email-logs", {
  triggersEnter: [ensureSignedIn, ensureIsAdmin, ensureIsSuperAdmin],
  action() {
    mount(Admin, {
      content: <OutBoundEmailLogs />,
      title: "Outbound Emails",
    });
  },
  name: "Outbound Emails",
});
FlowRouter.route("/client-groups", {
  triggersEnter: [ensureSignedIn, ensureIsAdmin, ensureIsSuperAdmin],
  action() {
    mount(Admin, {
      content: <ClientGroups />,
      title: "Client Groups",
    });
  },
  name: "Client Groups",
});
FlowRouter.route("/group-clients/:clientIds", {
  triggersEnter: [ensureSignedIn, ensureIsAdmin, ensureIsSuperAdmin],
  action(params) {
    mount(Admin, {
      content: <ClientsInClientsGroup clientIds={params.clientIds} />,
      title: "Group Clients",
    });
  },
  name: "ClientsInClientsGroup",
});
FlowRouter.route("/client-group-managers/:groupManagersIds", {
  triggersEnter: [ensureSignedIn, ensureIsAdmin, ensureIsSuperAdmin],
  action(params) {
    mount(Admin, {
      content: (
        <GroupManagersClientGroup groupManagersIds={params.groupManagersIds} />
      ),
      title: "Client Group Managers",
    });
  },
  name: "ManagersInClientsGroup",
});
FlowRouter.route("/profile", {
  triggersEnter: [ensureSignedIn, ensureIsAdmin],
  action() {
    mount(Admin, {
      content: <Profile />,
      title: "Profile",
    });
  },
  name: "Profile",
});
FlowRouter.route("/user-login-activity/:userId", {
  triggersEnter: [ensureSignedIn, ensureIsAdmin, ensureIsSuperAdmin],
  action(params) {
    mount(Admin, {
      content: <UsersLoginActivity userId={params.userId} />,
      title: "Users Login Activities",
    });
  },
  name: "UsersLoginActivity",
});
FlowRouter.route("/clients-admin-users/:clientId", {
  triggersEnter: [ensureSignedIn, ensureIsAdmin, ensureIsSuperAdmin],
  action(params) {
    mount(Admin, {
      content: <ClientsAdminUsers clientId={params.clientId} />,
      title: "Clients Admin Users",
    });
  },
  name: "ClientsAdminUsers",
});
FlowRouter.route("/parcel-status/:parcelId", {
  triggersEnter: [ensureSignedIn, ensureIsAdmin],
  action(params) {
    mount(Admin, {
      content: <TrackParcel parcelId={params.parcelId} />,
      title: "Parcel Status",
    });
  },
  name: "TrackParcel",
});

//middleware functions
function ensureSignedIn() {
  if (Meteor.userId() == null) FlowRouter.go("/Login");
}
function ensureIsAdmin() {
  Meteor.call("auth.admin", Meteor.userId(), function (error, result) {
    if (result === false) {
      Meteor.logout();
      FlowRouter.go("/Login");
    }
  });
}
function ensureIsSuperAdmin() {
  Meteor.call("auth.superAdmin", Meteor.userId(), function (error, result) {
    if (result === false) {
      Meteor.logout();
      FlowRouter.go("/Login");
    }
  });
}
function isGroupAdmin() {
  Meteor.call("auth.GroupAdmin", function (error, result) {
    if (result === true) {
      FlowRouter.go("/group-manager-dashboard");
    }
  });
}
