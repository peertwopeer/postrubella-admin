import { Meteor } from "meteor/meteor";
import React from "react";
import PropTypes from "prop-types";
import { withTracker } from "meteor/react-meteor-data";
import GridItem from "/imports/ui/components/Grid/GridItem.js";
import GridContainer from "/imports/ui/components/Grid/GridContainer.js";
import Card from "/imports/ui/components/Card/Card.js";
import CardHeader from "/imports/ui/components/Card/CardHeader.js";
import CardBody from "/imports/ui/components/Card/CardBody.js";
import AccountCircleOutlinedIcon from "@material-ui/icons/AccountCircleOutlined";
import Typography from "/imports/ui/components/Typography/Typography.js";
import Button from "/imports/ui/components/CustomButtons/Button.js";
import Loader from "/imports/ui/components/Loader/Loader.js";
import { makeStyles } from "@material-ui/core/styles";
import styles from "/imports/ui/theme/assets/jss/material-dashboard-react/pages/dataListStyle.js";
import { map } from "lodash";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import swal from "sweetalert";

const useStyles = makeStyles(styles);

const ClientsAdminUsers = (props) => {
  const classes = useStyles();
  const [adminUsers, setAdminUsers] = React.useState([]);
  const [listReady, setListReady] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [loginUserId, setLoginUserId] = React.useState(false);
  const [loginUserName, setLoginUserName] = React.useState("");

  handleClickOpen = (userId, userName) => {
    setLoginUserId(userId);
    setLoginUserName(userName);
    setOpen(true);
  };

  handleClose = () => {
    setLoginUserId(false);
    setLoginUserName("");
    setOpen(false);
  };

  loginRemotely = (userId) => {
    if (userId) {
      Meteor.call("users.login-token", userId, function (Error, result) {
        if (Error) {
          swal("", Error.message, "error");
        } else {
          window.open(
            Meteor.settings.public.postrubella_app_url +
              "/login-with-token/" +
              result.token,
            "_blank"
          );
          this.handleClose();
        }
      });
    }
  };

  // component did mount
  React.useEffect(() => {
    let unMounted = false;
    //load users
    Meteor.call(
      "users.adminUsersListForClient",
      props.clientId,
      function (error, result) {
        if (error) {
          console.log(error);
        } else {
          setAdminUsers(result);
          setListReady(true);
        }
      }
    );
    return () => (unMounted = true);
  }, []);

  return (
    <div>
      {/* dialogue box */}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Please confirm login action"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to login to postrubella remotely as user{" "}
            {loginUserName} ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
          <Button
            onClick={() => this.loginRemotely(loginUserId)}
            color="primary"
            autoFocus
          >
            Login
          </Button>
        </DialogActions>
      </Dialog>
      {/* dialogue box end */}
      <GridContainer>
        {listReady ? (
          adminUsers.length == 0 ? (
            <GridItem xs={12} sm={12} md={12}>
              <CardHeader color="danger">No admin users found</CardHeader>
            </GridItem>
          ) : (
            map(adminUsers, (value) => (
              <GridItem key={value._id} xs={12} sm={12} md={4}>
                <Card>
                  <CardHeader color="success">
                    <p className={classes.cardCategoryWhite}>
                      Username: {value.username}
                    </p>
                  </CardHeader>
                  <CardBody>
                    <Typography align="center">
                      <GridItem xs={12} sm={12} md={12}>
                        <AccountCircleOutlinedIcon style={{ fontSize: 70 }} />
                      </GridItem>
                    </Typography>
                    <GridContainer>
                      <GridItem xs={6} sm={6} md={6}>
                        First Name:
                      </GridItem>
                      <GridItem xs={6} sm={6} md={6}>
                        {value.profile.firstname}
                      </GridItem>
                      <GridItem xs={6} sm={6} md={6}>
                        Last Name:
                      </GridItem>
                      <GridItem xs={6} sm={6} md={6}>
                        {value.profile.lastname}
                      </GridItem>
                      <GridItem xs={6} sm={6} md={6}>
                        Role:
                      </GridItem>
                      <GridItem xs={6} sm={6} md={6}>
                        {Array.isArray(value.roles)
                          ? value.roles[0] != "0"
                            ? value.roles[0]
                            : "Not Assigned"
                          : value.roles}
                      </GridItem>
                    </GridContainer>
                    <Button
                      color="warning"
                      fullWidth={true}
                      onClick={() =>
                        this.handleClickOpen(value._id, value.username)
                      }
                    >
                      Login to postrubella app
                    </Button>
                  </CardBody>
                </Card>
              </GridItem>
            ))
          )
        ) : (
          <Loader color="inherit" />
        )}
      </GridContainer>
    </div>
  );
};

ClientsAdminUsers.propTypes = {
  clientId: PropTypes.string,
};

export default withTracker((props) => {
  return {};
})(ClientsAdminUsers);
