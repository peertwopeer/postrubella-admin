import { Meteor } from 'meteor/meteor';
import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Session } from 'meteor/session';
import GridItem from "/imports/ui/components/Grid/GridItem.js";
import GridContainer from "/imports/ui/components/Grid/GridContainer.js";
import Card from "/imports/ui/components/Card/Card.js";
import CardHeader from "/imports/ui/components/Card/CardHeader.js";
import CardBody from "/imports/ui/components/Card/CardBody.js";
import Table from "/imports/ui/components/Table/Table.js";
import CardFooter from "/imports/ui/components/Card/CardFooter.js";
import Button from "/imports/ui/components/CustomButtons/Button.js";
import Switch from "@material-ui/core/Switch";
import CustomInput from "/imports/ui/components/CustomInput/CustomInput.js";
import Pagination from '@material-ui/lab/Pagination';
import Dialog from '@material-ui/core/Dialog';
import { makeStyles } from "@material-ui/core/styles";
import moment from 'moment-timezone';
import UserForm from '/imports/ui/pages/forms/UserForm';
import UserConfigForm from '/imports/ui/pages/forms/UserConfigForm.jsx'
import { Box } from '@material-ui/core';
import swal from 'sweetalert';
import styles from "/imports/ui/theme/assets/jss/material-dashboard-react/pages/dataListStyle.js";
var _ = require('lodash');



const useStyles = makeStyles(styles);
const pageLimit = 10;



const Users = props => {

  const classes = useStyles();
  const [openView, setOpenView] = React.useState(false);
  const [openConfigView, setopenConfigView] = React.useState(false);
  const [enableAmend, setEnableAmend] = React.useState(false);
  const [enableCreate, setEnableCreate] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState({});
  const [users, setUsers] = React.useState([]);
  const [usersReady, setUsersReady] = React.useState(false);
  const [searchParams, SetSearchParams] = React.useState({});
  const [currentPage, SetCurrentPage] = React.useState(1);
  const [totalPages, SetTotalPages] = React.useState(0);
 

  // component did update
  React.useEffect(() => {
    let unMounted = false;
    setUsersReady(false);
    // Set client id
    if(props.selectedClient) {
      searchParams["profile.clientId"] = props.selectedClient;
    }else{
      delete searchParams["profile.clientId"];
    }
    //set total count
    Meteor.call('users.totalCount',searchParams,function(error,result){
      if(error) {
        console.log(error);
      }else{
        SetTotalPages(Math.ceil(result / pageLimit));
      }
    });
    //load users
    Meteor.call('users.list',pageLimit,currentPage,searchParams,function(error,result){
      if(error){
       console.log(error);
      }else{
         let uList = []
         result.map(function(obj){
           uList.push([
            <Switch label="disabled" onChange={() => { this.enableDisableUser(obj._id,obj.disabled) }}  checked={!obj.disabled}/>,
             obj.username,obj.emails[0].address,
             <Button color="primary" size="sm" onClick={() => { this.viewUser(obj) }}>view / amend</Button>,
             <Button color="primary" size="sm" onClick={() => { this.configUser(obj) }}>config</Button>,
             <Button color="primary" size="sm" onClick={() => { FlowRouter.go('UsersLoginActivity',{userId:obj._id}) }}>Login Activity</Button>,
             <Button color="danger" size="sm" onClick={() => { this.deleteUser(obj._id) }}>delete</Button>,
           ]);
         });
         setUsers(uList);
         setUsersReady(true);
      }
    });
    return () => unMounted = true ;
  },[searchParams,currentPage,props.selectedClient]);


  changePage = (page) => {
    SetCurrentPage(page);
  }


  setSearchQuery = (key,value) => {
    let params = searchParams;
    if(value == ""){
      delete params[key];
    }else{
      params[key] = {$regex: value+"*",$options:"i"};
    }
    let cleanParams = _.pickBy(params, function(v, k) {
      return !(v === undefined || v === "");
    });
    SetSearchParams(cleanParams);
  }
  
  viewUser = (user) => {
  // fetch client details and set user
  Meteor.call('clients.getClientDetails',user.profile.clientId,function(error,result){
      if(error) {
        console.error(error);
      }else{
        user.clientName = result.clientName;
        let defaultLanguageLabel = "";
        result.optionalLanguages.map((lang)=>{
          if(user.profile.language == lang.value) defaultLanguageLabel = lang.label;
        });
        user.defaultLanguageLabel = defaultLanguageLabel;
        setSelectedUser(user);
        setOpenView(true);
      }
    });
  }
  configUser = (user) => {
   
    // fetch client details and set user
    Meteor.call('clients.getClientDetails',user.profile.clientId,function(error,result){
    if(error) {
      console.error(error);
    }else{
      let optionalLanguages = [];
      let optionalTimeZones = [];
      if (result.optionalLanguages !== 'undefined'){
        optionalLanguages = result.optionalLanguages;
      }
     if((result.optionalTimeZones !== 'undefined')){
      result.optionalTimeZones.map((timezone) => { 
        optionalTimeZones.push({value:timezone.value,label:timezone.label}) 
        } )
     } 
      user.languageList = optionalLanguages;
      user.timezoneList = optionalTimeZones;
      setSelectedUser(user);
      setopenConfigView(true);
    }
  });
  }
  deleteUser = (userId) => {
    if (confirm('Are you sure you want to delete this user?')) {
      Meteor.call('users.delete',userId,function(error,result){
        if (result) {
          swal("", "user deleted", "success");
          // to refresh DOM without the need of reloading
          let searchParamsCurrentValue = searchParams;
          SetSearchParams({_id:null});
          SetSearchParams(searchParamsCurrentValue);
        }
      });
    }
  }
  enableDisableUser = (userId,currentStatus) => {
    if (confirm(`Are you sure you want to ${currentStatus? "Enable" : "Disable"} this user?`)) {
      Meteor.call('users.enableDisable',userId,function(error,result){
        if (result) {
          swal('', `User ${currentStatus? "Enable" : "Disable"}d.`,'success');
          // to refresh DOM without the need of reloading
          let searchParamsCurrentValue = searchParams;
          SetSearchParams({_id:null});
          SetSearchParams(searchParamsCurrentValue);

        }

      });
    }
  }

  handleCloseView = async () => {
    setOpenView(false);
    setopenConfigView(false);
    setSelectedUser({});
    setEnableAmend(false);
    setEnableCreate(false);
    let searchParamsCurrentValue = searchParams;
    await SetSearchParams({_id:null});
    await SetSearchParams(searchParamsCurrentValue);
  }



  return(<div>
    <GridContainer>
    <GridItem xs={12} sm={12} md={12}>
        <Card>
          <CardHeader color="primary">
            <h4 className={classes.cardTitleWhite}>Users</h4>
            <p className={classes.cardCategoryWhite}>
              Manage users
            </p>
          </CardHeader>
          <CardBody>
            <GridContainer>
              <GridItem xs={4}>
                {/* search fields  */}
                <CustomInput
                formControlProps={{
                }}
                inputProps={{
                  placeholder: "Search by username/email",
                  inputProps: {
                    "aria-label": "Search",
                    onChange: e => {setSearchQuery( "username", e.target.value); SetCurrentPage(1);}
                  }
                }}
              />
              </GridItem>
              <GridItem>
             {/* actions  */}
             <Button color="info" onClick={() => { setEnableCreate(true); setOpenView(true); }}>create</Button>
              </GridItem>
            </GridContainer>

            {(usersReady)?
            <Table
            tableHeaderColor="primary"
            tableHead={["Enable/Disable","Username","Email","Actions","","",""]}
            tableData={users}
            />
            :"Loading..."}
          </CardBody>
          <CardFooter>
            <Pagination page={currentPage} count={totalPages} onChange={(event,page)=> this.changePage(page) } color="primary" />
          </CardFooter>
        </Card>
      </GridItem>
      </GridContainer>
      {/* dialog  */}
      <Dialog onClose={ this.handleCloseView } aria-labelledby="simple-dialog-title" open={openView}>
        {/* Create */}
        {(enableCreate)? (<Card>
          <CardHeader color="primary">
          <p className={classes.cardCategoryWhite}>Create New User</p>
          </CardHeader>
          <CardBody><UserForm user={{username:"",email:""}} action="CREATE" selectedClient={props.selectedClient} closeDialog={this.handleCloseView} /></CardBody>
            <CardFooter>
              <Button color="primary" fullWidth={true} onClick={this.handleCloseView} >Close</Button>
            </CardFooter>
        </Card>) :
           //View and amend
           (!_.isEmpty(selectedUser))?
            <Card>
              <CardHeader color="primary">
                <p className={classes.cardCategoryWhite}>
                  User: {(typeof selectedUser.username !== 'undefined')? selectedUser.username : "" }
                </p>
              </CardHeader>
            <CardBody>
    
              { (enableAmend)? (<UserForm user={selectedUser} action="AMEND" selectedClient={selectedUser.profile.clientId} closeDialog={this.handleCloseView} />) : (<GridContainer>
              <GridItem xs={6} sm={6} md={6}>Username:
               </GridItem><GridItem xs={6} sm={6} md={6}>{(typeof selectedUser.username !== 'undefined')? selectedUser.username : "" }</GridItem>
              <GridItem xs={6} sm={6} md={6}>Email:
               </GridItem><GridItem xs={6} sm={6} md={6}>{(typeof selectedUser.emails[0].address !== 'undefined')? selectedUser.emails[0].address : "" }</GridItem>
              <GridItem xs={6} sm={6} md={6}>First Name:
               </GridItem><GridItem xs={6} sm={6} md={6}>{(typeof selectedUser.profile.firstname !== 'undefined')? selectedUser.profile.firstname : "" }</GridItem>
              <GridItem xs={6} sm={6} md={6}>Last Name:
               </GridItem><GridItem xs={6} sm={6} md={6}>{(typeof selectedUser.profile.lastname !== 'undefined')? selectedUser.profile.lastname : "" }</GridItem>
              <GridItem xs={6} sm={6} md={6}>Role:
               </GridItem><GridItem xs={6} sm={6} md={6}>{(typeof selectedUser.roles == 'string')? selectedUser.roles : selectedUser.roles[0] }</GridItem>
              <GridItem xs={6} sm={6} md={6}>Client:
               </GridItem><GridItem xs={6} sm={6} md={6}>{(typeof selectedUser.clientName !== 'undefined')? selectedUser.clientName : "" }</GridItem>
              <GridItem xs={6} sm={6} md={6}>Language:
               </GridItem><GridItem xs={6} sm={6} md={6}>{(typeof selectedUser.profile.language !== 'undefined')? selectedUser.defaultLanguageLabel : "" }</GridItem>
               <GridItem xs={6} sm={6} md={6}>Timezone:
               </GridItem><GridItem xs={6} sm={6} md={6}>{(typeof selectedUser.profile.timezone !== 'undefined')? selectedUser.profile.timezone : "" }</GridItem>
              <GridItem xs={6} sm={6} md={6}>Created At:
               </GridItem><GridItem xs={6} sm={6} md={6}>{(typeof selectedUser.createdAt !== 'undefined')? moment(selectedUser.createdAt).format("DD-MMM-YYYY") : "" }</GridItem>
              <GridItem xs={12} sm={12} md={12}> <Button color="info" fullWidth={true} onClick={() => { setEnableAmend(true) }}>amend</Button></GridItem>
              </GridContainer>)
              }
    
            </CardBody>
            <CardFooter>
              <Button color="primary" fullWidth={true} onClick={this.handleCloseView} >Close</Button>
            </CardFooter>
            </Card> 
            :"User data not available."
        }
      </Dialog>
        {/* dialog-config */}
        <Dialog onClose={ this.handleCloseView } aria-labelledby="simple-dialog-title" open={openConfigView}>
        {(!_.isEmpty(selectedUser))?  
         <Box p={2}>
           <UserConfigForm user={selectedUser} closeDialog={this.handleCloseView} />
         </Box>
        :"User data not available."}
      </Dialog>
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
})(Users);