import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import React from "react";
import { withTracker } from "meteor/react-meteor-data";
import { MuiThemeProvider } from "@material-ui/core/styles";
import { makeStyles } from "@material-ui/core/styles";
import AppTheme from "/imports/ui/theme/AppTheme";
import Sidebar from "/imports/ui/components/Sidebar/Sidebar";
import Navbar from "/imports/ui/components/Navbars/Navbar";
import Footer from "/imports/ui/components/Footer/Footer";
import styles from "/imports/ui/theme/assets/jss/material-dashboard-react/layouts/adminStyle";
import Person from "@material-ui/icons/Person";
import Dashboard from "@material-ui/icons/Dashboard";
import AssessmentIcon from "@material-ui/icons/Assessment";
import MailIcon from '@material-ui/icons/Mail';
import PeopleIcon from "@material-ui/icons/People";
import DynamicFeedIcon from "@material-ui/icons/DynamicFeed";
import SupervisedUserCircleIcon from "@material-ui/icons/SupervisedUserCircle";

const useStyles = makeStyles(styles);
const publicDir = `${Meteor.settings.public.cdn}/public`;

const Admin = (props) => {
  // styles
  const classes = useStyles();
  // ref to help us initialize PerfectScrollbar on windows devices
  const mainPanel = React.createRef();
  // states and functions
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [dashboardRoutes, setDashboardRoutes] = React.useState([]);

  // set current user data
  React.useEffect(() => {
    if (props.currentUser != undefined) {
      if (Roles.userIsInRole(props.currentUser._id, ["super-admin"])) {
        setDashboardRoutes([
          {
            path: "/",
            name: "Dashboard",
            icon: <Dashboard />,
          },
          {
            path: "/users",
            name: "Users",
            icon: <PeopleIcon />,
          },
          {
            path: "/clients",
            name: "Clients",
            icon: <Person />,
          },
          {
            path: "/parcels",
            name: "Parcels",
            icon: <DynamicFeedIcon />,
          },
          {
            path: "/report",
            name: "Report",
            icon: <AssessmentIcon />,
          },
          {
            path: "/reports",
            name: "Client Groups",
            icon: <SupervisedUserCircleIcon />,
          },
          {
            path: "/outbound-email-logs",
            name: "Outbound Emails",
            icon: <MailIcon />,
          },
        ]);
      }
      if (Roles.userIsInRole(props.currentUser._id, ["group-admin"])) {
        setDashboardRoutes([
          {
            path: "/parcels",
            name: "Parcels",
            icon: <DynamicFeedIcon />,
          },
        ]);
      }
    }
  }, [props.currentUser]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const logoutUser = () => {
    Meteor.logout(function (err) {
      if (!err) {
        FlowRouter.go("Login");
      } else {
        console.error("Logout error:" + err);
      }
    });
  };

  return (
    <MuiThemeProvider theme={AppTheme}>
      <div className={classes.wrapper}>
        <Sidebar
          open={mobileOpen}
          color={"blue"}
          logo={`${publicDir}/svg/logo-admin-app.png`}
          routes={dashboardRoutes}
          handleDrawerToggle={handleDrawerToggle}
          logoutUser={logoutUser}
        />
        <div className={classes.mainPanel} ref={mainPanel}>
          <Navbar
            routes={dashboardRoutes}
            handleDrawerToggle={handleDrawerToggle}
            logoutUser={logoutUser}
            pageTitle={props.title}
            ShowswitchClient={dashboardRoutes.length > 1}
          />
          <div className={classes.content}>
            <div className={classes.container}>{props.content}</div>
          </div>
          <Footer />
        </div>
      </div>
    </MuiThemeProvider>
  );
};

export default withTracker(() => {
  return {
    currentUser: Meteor.user(),
  };
})(Admin);
