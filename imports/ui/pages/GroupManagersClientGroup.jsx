import { Meteor } from "meteor/meteor";
import React from "react";
import GridItem from "/imports/ui/components/Grid/GridItem.js";
import GridContainer from "/imports/ui/components/Grid/GridContainer.js";
import Card from "/imports/ui/components/Card/Card.js";
import CardHeader from "/imports/ui/components/Card/CardHeader.js";
import CardBody from "/imports/ui/components/Card/CardBody.js";
import Loader from "/imports/ui/components/Loader/Loader.js";
import AccountCircleOutlinedIcon from "@material-ui/icons/AccountCircleOutlined";
import Typography from "/imports/ui/components/Typography/Typography.js";
import { makeStyles } from "@material-ui/core/styles";
import styles from "/imports/ui/theme/assets/jss/material-dashboard-react/pages/dataListStyle.js";
import { map } from "lodash";

const useStyles = makeStyles(styles);

const ClientGroupManagers = (props) => {
  const classes = useStyles();
  const [groupManagers, setGroupManagers] = React.useState([]);
  const [listReady, setListReady] = React.useState(false);

  // component did mount
  React.useEffect(() => {
    let unMounted = false;
    //load users
    Meteor.call(
      "clientGroup.ManagersInClientsGroup",
      props.groupManagersIds.split(","),
      function (error, result) {
        if (error) {
          console.log(error);
        } else {
          setGroupManagers(result);
          setListReady(true);
        }
      }
    );
    return () => (unMounted = true);
  }, []);

  return (
    <div>
      <GridContainer>
        {listReady ? (
          groupManagers.length == 0 ? (
            <GridItem xs={12} sm={12} md={12}>
              <CardHeader color="danger">No admin users found</CardHeader>
            </GridItem>
          ) : (
            map(groupManagers, (value) => (
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
                        <AccountCircleOutlinedIcon style={{ fontSize: 65 }} />
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
                          ? value.roles[0]
                          : value.roles}
                      </GridItem>
                    </GridContainer>
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

export default ClientGroupManagers;
