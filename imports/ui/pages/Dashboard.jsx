import { Meteor } from 'meteor/meteor';
import React from 'react';
import moment from 'moment-timezone';
import { withTracker } from 'meteor/react-meteor-data';
import ChartistGraph from "react-chartist";
import Chartist from "chartist";
import ChartistTooltip from "chartist-plugin-tooltips-updated";
import { makeStyles } from "@material-ui/core/styles";
import GridItem from "/imports/ui/components/Grid/GridItem.js";
import GridContainer from "/imports/ui/components/Grid/GridContainer.js";
import Card from "/imports/ui/components/Card/Card.js";
import CardHeader from "/imports/ui/components/Card/CardHeader.js";
import CardBody from "/imports/ui/components/Card/CardBody.js";
import styles from "/imports/ui/theme/assets/jss/material-dashboard-react/pages/dashboardStyle.js";
//api
import { Config } from '/imports/api/collections/config';

const useStyles = makeStyles(styles);


const Dashboard = props => {

  const classes = useStyles();
  const [twoWeeksPostsVolumeChart,setTwoWeeksPostsVolumeChart] = React.useState({
    "labels":[],
    "series":[[]],
    "high":100,
    "ready":false
  });
  const twoWeeksPostsVolumeChartToDate = moment(new Date()).subtract(1, 'day').format('YYYY-MMMM-DD');
  const twoWeeksPostsVolumeChartFromDate =  moment(new Date()).subtract(2, 'week').format('YYYY-MMMM-DD');

  // component did update
  React.useEffect(() => {
    let unMounted = false;
    Meteor.call('parcels.twoWeeksPostsVolumeChart',props.selectedClient,function (error,result) {
      if(error) {
        console.error(error);
      }else{
        setTwoWeeksPostsVolumeChart({"labels":result.labels,"series":result.series,"ready":true,"high":Math.max(...result.series[0])+1});
      }
    });
    return () => unMounted = true ;
  },[props.selectedClient]);

  return(<div>
    <GridContainer>
    <GridItem xs={12} sm={6} md={3}>
    {(props.configSub)?
          <Card>
            <CardHeader color="warning" stats icon>
              <p className={classes.cardCategory}>CURRENT APP VERSION:</p>
              <h3 className={classes.cardTitle}>{props.config.version}</h3>
            </CardHeader>
          </Card>
    :"App version details loading..."}
    </GridItem>
    <GridItem xs={12} sm={12} md={12}>
    {(twoWeeksPostsVolumeChart.ready)?
    <Card chart>
        <CardHeader color="primary">
              <ChartistGraph
                className="ct-chart"
                data={{ "labels":twoWeeksPostsVolumeChart.labels,"series":twoWeeksPostsVolumeChart.series }}
                type="Line"
                options={{
                  lineSmooth: Chartist.Interpolation.cardinal({
                    tension: 0
                  }),
                  low: 0,
                  high: twoWeeksPostsVolumeChart.high,
                  plugins: [
                    ChartistTooltip({
                      transformTooltipTextFnc: (value) => value,
                      appendToBody: false,
                      class: "default-tooltip",
                      anchorToPoint: true
                    })
                  ],
                  chartPadding: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                  }
                }}
              />
        </CardHeader>
        <CardBody>
              <h4 className={classes.cardTitle}>Total post over the last 2 weeks ( From: {twoWeeksPostsVolumeChartFromDate} To: {twoWeeksPostsVolumeChartToDate} )</h4>
        </CardBody>
    </Card>
    :"Line chart loading..."}
    </GridItem>
    </GridContainer>
  </div>)
}

export default withTracker(() => {
  var selectedClient = false;
  if(Session.get("selectedClient")){
    selectedClient = Session.get("selectedClient");
  }
return {
  config: Config.find().fetch()[0],
  configSub: Meteor.subscribe('config').ready(),
  selectedClient:selectedClient
 };
})(Dashboard);
