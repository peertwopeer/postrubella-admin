import { Meteor } from 'meteor/meteor';
import React from 'react';
import PropTypes from "prop-types";
import { withTracker } from 'meteor/react-meteor-data';
import GridItem from "/imports/ui/components/Grid/GridItem.js";
import GridContainer from "/imports/ui/components/Grid/GridContainer.js";
import Card from "/imports/ui/components/Card/Card.js";
import CardHeader from "/imports/ui/components/Card/CardHeader.js";
import CardBody from "/imports/ui/components/Card/CardBody.js";
import Table from "/imports/ui/components/Table/Table.js";
import { makeStyles } from "@material-ui/core/styles";
import styles from "/imports/ui/theme/assets/jss/material-dashboard-react/pages/dataListStyle.js";
import moment from 'moment-timezone';
var _ = require('lodash');


const useStyles = makeStyles(styles);



const UsersLoginActivity = props => {

  const classes = useStyles();
  const [loginActivities, setLoginActivities] = React.useState([]);
  const [listReady, setListReady] = React.useState(false);
 
  // component did mount
  React.useEffect(() => {
    let unMounted = false;
    //load users
    Meteor.call('userLoginActivity.list',props.userId,function(error,result){
      if(error){
       console.log(error);
      }else{
         let uList = []
         result.map(function(obj){
           uList.push([
             obj.platform,
             obj.source,
             moment(obj.createdAt).format("DD-MMM-YYYY h:mm:ss a")
           ]);
         });
         setLoginActivities(uList);
         setListReady(true);
      }
    });
    return () => unMounted = true ;
  },[]);


  return(<div>
    <GridContainer>
    <GridItem xs={12} sm={12} md={12}>
        <Card>
          <CardHeader color="primary">
            <p className={classes.cardCategoryWhite}>
              User {(typeof props.user !== 'undefined')? props.user.username : "" } last 10 login activities
            </p>
          </CardHeader>
          <CardBody>
            {(listReady)?
            <Table
            tableHeaderColor="primary"
            tableHead={["Platform","Source","Logged In At"]}
            tableData={loginActivities}
            />
            :"Loading..."}
          </CardBody>
        </Card>
      </GridItem>
      </GridContainer>
      </div>)
}

UsersLoginActivity.propTypes = {
  userId: PropTypes.string
};

export default withTracker((props) => {
return {
  user: Meteor.users.find({"_id":props.userId}).fetch()[0]
};
})(UsersLoginActivity);
