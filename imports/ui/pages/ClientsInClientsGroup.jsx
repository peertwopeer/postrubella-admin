import { Meteor } from "meteor/meteor";
import React from "react";
import GridItem from "/imports/ui/components/Grid/GridItem.js";
import GridContainer from "/imports/ui/components/Grid/GridContainer.js";
import Card from "/imports/ui/components/Card/Card.js";
import CardHeader from "/imports/ui/components/Card/CardHeader.js";
import CardBody from "/imports/ui/components/Card/CardBody.js";
import Loader from "/imports/ui/components/Loader/Loader.js";
import SupervisedUserCircleIcon from "@material-ui/icons/SupervisedUserCircle";
import { makeStyles } from "@material-ui/core/styles";
import styles from "/imports/ui/theme/assets/jss/material-dashboard-react/pages/dataListStyle.js";
import { map } from "lodash";

const useStyles = makeStyles(styles);

const ClientsInClientsGroup = (props) => {
  const classes = useStyles();
  const [clients, setClients] = React.useState([]);
  const [listReady, setListReady] = React.useState(false);

  // component did mount
  React.useEffect(() => {
    let unMounted = false;
    //load clients
    Meteor.call(
      "clientGroup.clientsInClientsGroup",
      props.clientIds.split(","),
      function (error, result) {
        if (error) {
          console.log(error);
        } else {
          setClients(result);
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
          clients.length == 0 ? (
            <GridItem xs={12} sm={12} md={12}>
              <CardHeader color="danger">No Clients found</CardHeader>
            </GridItem>
          ) : (
            map(clients, (value) => (
              <GridItem key={value._id} xs={12} sm={12} md={4} align="center">
                <Card>
                  <CardHeader color="success">
                    <p className={classes.cardCategoryWhite}>
                      {value.clientName}
                    </p>
                  </CardHeader>
                  <CardBody>
                    <GridItem xs={12} sm={12} md={12}>
                      {value.logo ? (
                        <a>
                          <img
                            src={value.logo}
                            alt="logo"
                            className="introImg"
                          />
                        </a>
                      ) : (
                        <SupervisedUserCircleIcon
                          style={{
                            fontSize: 100,
                            width: "100px",
                            height: "100px",
                          }}
                        />
                      )}
                    </GridItem>
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

export default ClientsInClientsGroup;
