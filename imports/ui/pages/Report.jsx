import { Meteor } from 'meteor/meteor';
import React from 'react';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/moment';
import moment from 'moment-timezone';
import { withTracker } from 'meteor/react-meteor-data';
import { makeStyles } from "@material-ui/core/styles";
import GridItem from "/imports/ui/components/Grid/GridItem.js";
import GridContainer from "/imports/ui/components/Grid/GridContainer.js";
import Card from "/imports/ui/components/Card/Card.js";
import CardHeader from "/imports/ui/components/Card/CardHeader.js";
import CardBody from "/imports/ui/components/Card/CardBody.js";
import styles from "/imports/ui/theme/assets/jss/material-dashboard-react/pages/reportStyle.js";
import { map } from 'lodash';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Box from '@material-ui/core/Box';

const useStyles = makeStyles(styles);



const Report = props => {
  const classes = useStyles();
  const [postsVolumeByDateFieldValue, setPostsVolumeByDateFieldValue] = React.useState(moment().endOf('day').toDate());
  const [clientsDataVolume,setClientsDataVolume] =  React.useState([]);
  const [postsVolumeByDateData,setPostsVolumeByDateData] =  React.useState({
    "data":[],
    "ready":false,
    "data":[],
    "ready":false
  });

  // component did update
  React.useEffect(() => {
    let unMounted = false;
    Meteor.call('clients.clientsDataVolume',props.selectedClient,function (error,result) {
      if(error) {
        console.error(error);
      }else{
        setClientsDataVolume({"data":result.data,"ready":true});
      }
    });
    return () => unMounted = true ;
  },[props.selectedClient]);

  // component did update
  React.useEffect(() => {
    let unMounted = false;
    Meteor.call('parcels.postsVolumeByDateData',postsVolumeByDateFieldValue,props.selectedClient,function (error,result) {
      if(error) {
        console.error(error);
      }else{
        setPostsVolumeByDateData({"data":result.data,"ready":true});
      }
    });
    return () => unMounted = true ;
  },[postsVolumeByDateFieldValue, props.selectedClient]);

  return(<div>
    <GridContainer>
    <GridItem xs={12} sm={6} md={6}>
    {(clientsDataVolume.ready)?
    <Card>
      <CardHeader color="warning" >
        <p className={classes.cardCategoryWhite}>Clients data volume</p>
      </CardHeader>
        <CardBody className={classes.clientVolumeDataTable}>
              <Table aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell><b>Client Name</b></TableCell>
                    <TableCell><b>Parcels Count</b></TableCell>
                    <TableCell><b>Total Post</b></TableCell>
                    <TableCell><b>Locations Count</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                { map(clientsDataVolume.data,(data)=> (<TableRow key={data.clientId}>
                  <TableCell>{data.clientName}</TableCell>
                  <TableCell>{data.postCount}</TableCell>
                  <TableCell>{data.totalPosts}</TableCell>
                  <TableCell>{data.locationCount}</TableCell>
                  </TableRow>)) }
                </TableBody>
              </Table>
        </CardBody>
    </Card>
    :"Clients data volume details loading..."}
    </GridItem>
    <GridItem xs={12} sm={6} md={6}>
    {(postsVolumeByDateData.ready)?
         <Card>
            <CardHeader color="success">
              <p className={classes.cardCategoryWhite}>Total post by day month year</p>
            </CardHeader>
            <CardBody>
            <Box mt={2} mb={2}>
                <GridContainer>
                <GridItem xs={12} sm={6} md={4}><b>Select Date: </b></GridItem> 
                <GridItem xs={12} sm={6} md={8}>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} placeholder="Select date" value={postsVolumeByDateFieldValue} onChange={() => {}} onAccept={(date) =>{ setPostsVolumeByDateFieldValue(moment(date).endOf('day').toDate())} } maxDate={moment().endOf('day').toDate()} />
                    </MuiPickersUtilsProvider>
                </GridItem>
                </GridContainer>
                </Box>
                {map(postsVolumeByDateData.data,(data)=> (
                  <div key={data.label}><b>{data.label}:</b> {data.value}</div>
                ))}
                
            </CardBody>
          </Card>
          :"Posts data volume details loading..."}
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
  selectedClient:selectedClient
};
})(Report);
