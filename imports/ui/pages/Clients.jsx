import { Meteor } from 'meteor/meteor';
import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import GridItem from "/imports/ui/components/Grid/GridItem.js";
import GridContainer from "/imports/ui/components/Grid/GridContainer.js";
import Card from "/imports/ui/components/Card/Card.js";
import CardHeader from "/imports/ui/components/Card/CardHeader.js";
import CardBody from "/imports/ui/components/Card/CardBody.js";
import Table from "/imports/ui/components/Table/Table.js";
import CardFooter from "/imports/ui/components/Card/CardFooter.js";
import Button from "/imports/ui/components/CustomButtons/Button.js";
import CustomInput from "/imports/ui/components/CustomInput/CustomInput.js";
import Loader from "/imports/ui/components/Loader/Loader.js";
import Pagination from '@material-ui/lab/Pagination';
import Dialog from '@material-ui/core/Dialog';
import { makeStyles } from "@material-ui/core/styles";
import moment from 'moment-timezone';
import ClientForm from '/imports/ui/pages/forms/ClientForm';
import ClientConfigForm from '/imports/ui/pages/forms/ClientConfigForm';
import styles from "/imports/ui/theme/assets/jss/material-dashboard-react/pages/dataListStyle.js";
import { Box } from '@material-ui/core';
import swal from 'sweetalert';

var _ = require('lodash');


const useStyles = makeStyles(styles);
const pageLimit = 10;




const Clients = props => {

  const classes = useStyles();
  const [openView, setOpenView] = React.useState(false);
  const [openConfigView, setopenConfigView] = React.useState(false);
  const [enableAmend, setEnableAmend] = React.useState(false);
  const [enableCreate, setEnableCreate] = React.useState(false);
  const [selectedClient, setSelectedClient] = React.useState({});
  const [clients, setClients] = React.useState([]);
  const [clientsReady, setClientsReady] = React.useState(false);
  const [searchParams, SetSearchParams] = React.useState({});
  const [currentPage, SetCurrentPage] = React.useState(1);
  const [totalPages, SetTotalPages] = React.useState(0);
  

   // component did update
   React.useEffect(() => {
    let unMounted = false;
    setClientsReady(false);
    // Set client id
    if(props.selectedClient) {
      searchParams["_id"] = props.selectedClient;
    }else{
      delete searchParams["_id"];
    }
    //set total count
    Meteor.call('clients.totalCount',searchParams,function(error,result){
      if(error) {
        console.error(error);
      }else{
        SetTotalPages(Math.ceil(result / pageLimit));
      }
    });
    //load clients
    Meteor.call('clients.list',pageLimit,currentPage,searchParams,function(error,result){
      if(error){
       console.log(error);
      }else{
        let cList = []
        result.map(function(obj){
         cList.push([obj.clientName, obj.clientEmail, moment(obj.createdAt).format("DD-MMM-YYYY"),
            <Button color="primary" size="sm" onClick={() => { this.viewClient(obj) }}>view / amend</Button>,
            <Button color="primary" size="sm" onClick={() => { FlowRouter.go('ClientsAdminUsers',{clientId:obj._id}) }}>Admin Users</Button>,
            <Button color="primary" size="sm" onClick={() => { this.configClient(obj) }}>config</Button>,
            <Button color="danger" size="sm" onClick={() => { this.deleteClient(obj._id) }}>delete</Button>
          ]);
        });
        setClients(cList);
        setClientsReady(true);
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
  configClient = (client) => {
    setSelectedClient(client);
    setopenConfigView(true);
  }
  viewClient = (client) => {
      let optionalLanguagesString = "";
      let optionalTimezonesString = "";
      client.optionalLanguages.map((value,key) => { 
        if(value.value == client.defaultLanguage) client.defaultLanguageLabel = value.label;
        optionalLanguagesString = optionalLanguagesString+value.label+"," 
      });
      client.optionalTimeZones.map((value,key) => { 
        optionalTimezonesString = optionalTimezonesString+value.label+"," 
      });
      client.optionalLanguagesString = optionalLanguagesString.slice(0, -1);
      client.optionalTimezonesString = optionalTimezonesString.slice(0, -1);
      setSelectedClient(client);
      setOpenView(true);
  }

  handleCloseView = async () => {
    setOpenView(false);
    setopenConfigView(false);
    setSelectedClient({});
    setEnableAmend(false);
    setEnableCreate(false);
    let searchParamsCurrentValue = searchParams;
    SetSearchParams({_id:null});
    SetSearchParams(searchParamsCurrentValue);
  }

  deleteClient = (clientId) => {
    if (confirm('Are you sure you want to delete this client?')) {
      Meteor.call('clients.delete',clientId,function(error,result){
        if (result) {
          swal("", "client deleted.","success");
          let searchParamsCurrentValue = searchParams;
          SetSearchParams({_id:null});
          SetSearchParams(searchParamsCurrentValue);
        }
      });
    }
  }

  return(<div>
    <GridContainer>
    <GridItem xs={12} sm={12} md={12}>
        <Card>
          <CardHeader color="primary">
            <h4 className={classes.cardTitleWhite}>Clients</h4>
            <p className={classes.cardCategoryWhite}>
              Manage clients
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
                placeholder: "Search by client name",
                inputProps: {
                  "aria-label": "Search",
                  onChange: e => {setSearchQuery( "clientName", e.target.value); SetCurrentPage(1);}
                }
              }}
            />
          </GridItem>
          <GridItem>
           {/* actions  */}
           <Button color="info" onClick={() => { setEnableCreate(true); setOpenView(true); }}>create</Button>
          </GridItem>
          </GridContainer>
            
            {(clientsReady)?
            <Table
            tableHeaderColor="primary"
            tableHead={["Client Name","Client Email","Activated Date","Actions","","",""]}
            tableData={clients}
            />
            :<Loader color="inherit" />}
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
          <p className={classes.cardCategoryWhite}>Create New Client</p>
          </CardHeader>
          <CardBody><ClientForm client={{}} action="CREATE" closeDialog={this.handleCloseView} /></CardBody>
          <CardFooter>
              <Button color="primary" fullWidth={true} onClick={this.handleCloseView} >Close</Button>
          </CardFooter>
        </Card>) :
        //View and amend
        (!_.isEmpty(selectedClient))?
        <Card>
          <CardHeader color="primary">
            <p className={classes.cardCategoryWhite}>
              Client: {(typeof selectedClient.clientName !== 'undefined')? selectedClient.clientName : "" }
            </p>
          </CardHeader>
        <CardBody>
         { (enableAmend)? (<ClientForm client={selectedClient} action="AMEND" closeDialog={this.handleCloseView} />) : (<GridContainer>
          <GridItem xs={6} sm={6} md={6}>Client Name:
           </GridItem><GridItem xs={6} sm={6} md={6}>{(typeof selectedClient.clientName !== 'undefined')? selectedClient.clientName : "" }</GridItem>
          <GridItem xs={6} sm={6} md={6}>Client Email:
           </GridItem><GridItem xs={6} sm={6} md={6}>{(typeof selectedClient.clientEmail !== 'undefined')? selectedClient.clientEmail : "" }</GridItem>
          <GridItem xs={6} sm={6} md={6}>Client Barcode Id:
           </GridItem><GridItem xs={6} sm={6} md={6}>{(typeof selectedClient.clientBarcodeId !== 'undefined')? selectedClient.clientBarcodeId : "" }</GridItem>
          <GridItem xs={6} sm={6} md={6}>Client Barcode Number:
           </GridItem><GridItem xs={6} sm={6} md={6}>{(typeof selectedClient.clientBarcodeNumber !== 'undefined')? selectedClient.clientBarcodeNumber : "" }</GridItem>
          <GridItem xs={6} sm={6} md={6}> Default Language:
           </GridItem><GridItem xs={6} sm={6} md={6}>{(typeof selectedClient.defaultLanguageLabel !== 'undefined')? selectedClient.defaultLanguageLabel : "" }</GridItem>
          <GridItem xs={6} sm={6} md={6}> Default Timezone:
           </GridItem><GridItem xs={6} sm={6} md={6}>{(typeof selectedClient.defaultTimeZone !== 'undefined')? selectedClient.defaultTimeZone : "" }</GridItem>
          <GridItem xs={6} sm={6} md={6}> Optional Languages:
           </GridItem><GridItem xs={6} sm={6} md={6}>{(typeof selectedClient.optionalLanguagesString !== 'undefined')? selectedClient.optionalLanguagesString : "" }</GridItem>
           <GridItem xs={6} sm={6} md={6}> Optional Timezones:
           </GridItem><GridItem xs={6} sm={6} md={6}>{(typeof selectedClient.optionalTimezonesString !== 'undefined')? selectedClient.optionalTimezonesString : "" }</GridItem>
          <GridItem xs={6} sm={6} md={6}>Activated Date:
           </GridItem><GridItem xs={6} sm={6} md={6}>{(typeof selectedClient.createdAt !== 'undefined')? moment(selectedClient.createdAt).format("DD-MMM-YYYY") : "" }</GridItem>
           <GridItem xs={12} sm={12} md={12}> <Button color="info" fullWidth={true} onClick={() => { setEnableAmend(true) }}>amend</Button></GridItem>
         </GridContainer>)
         }
        </CardBody>
        <CardFooter>
              <Button color="primary" fullWidth={true} onClick={this.handleCloseView} >Close</Button>
        </CardFooter>
        </Card> 
        :"Client data not available."
        }
      </Dialog>
       {/* dialog-config */}
       <Dialog onClose={()=>{this.handleCloseView()}} aria-labelledby="simple-dialog-title" open={openConfigView}>
        {(!_.isEmpty(selectedClient))?
         <Box p={2}>
           <ClientConfigForm client={selectedClient} closeDialog={()=>{this.handleCloseView()}} />
         </Box>
        :"Client data not available."}
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
})(Clients);
