import { Meteor } from "meteor/meteor";
import React from "react";
import { withTracker } from "meteor/react-meteor-data";
import { makeStyles } from "@material-ui/core/styles";
import GridItem from "/imports/ui/components/Grid/GridItem.js";
import GridContainer from "/imports/ui/components/Grid/GridContainer.js";
import Card from "/imports/ui/components/Card/Card.js";
import CardHeader from "/imports/ui/components/Card/CardHeader.js";
import styles from "/imports/ui/theme/assets/jss/material-dashboard-react/pages/dashboardStyle.js";

import { Config } from "/imports/api/collections/config";

const useStyles = makeStyles(styles);

const GMDashboard = (props) => {
  const classes = useStyles();

  return (
    <div>
      <GridContainer>
        <GridItem xs={12} sm={6} md={3}>
          {props.configSub ? (
            <Card>
              <CardHeader color="warning" stats icon>
                <p className={classes.cardCategory}>CURRENT APP VERSION:</p>
                <h3 className={classes.cardTitle}>{props.config.version}</h3>
              </CardHeader>
            </Card>
          ) : (
            "App version details loading..."
          )}
        </GridItem>
      </GridContainer>
    </div>
  );
};

export default withTracker(() => {
  return {
    config: Config.find().fetch()[0],
    configSub: Meteor.subscribe("config").ready(),
  };
})(GMDashboard);
