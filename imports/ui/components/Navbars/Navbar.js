import React from "react";
import classNames from "classnames";
import PropTypes from "prop-types";
import { Session } from 'meteor/session';
import { withTracker } from 'meteor/react-meteor-data';
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Hidden from "@material-ui/core/Hidden";
import AsyncSelect from 'react-select/async';
// @material-ui/icons
import Menu from "@material-ui/icons/Menu";
// core components
import Button from "/imports/ui/components/CustomButtons/Button.js";
import AdminNavbarLinks from "/imports/ui/components/Navbars/AdminNavbarLinks.js";
import styles from "/imports/ui/theme/assets/jss/material-dashboard-react/components/headerStyle.js";
import selectComponents from "/imports/ui/theme/assets/jss/material-dashboard-react/components/selectStyle.js";


const useStyles = makeStyles(styles);
const useSelectStyles = makeStyles(selectComponents);

function Header(props) {


  const classes = useStyles();
  const selectClass = useSelectStyles();
  
  const { color } = props;
  const appBarClasses = classNames({
    [" " + classes[color]]: color
  });
  
  const [clientsList,setClientsList] = React.useState([]);
  const [clientsListReady,setClientsListReady] = React.useState(false);

  // component did mount
  React.useEffect(async () => {
    let unMounted = false;
    Meteor.call('clients.dropdownOptions',{},function (error,result) {
      if(error) {
        console.error(error);
      }else{
        let cList = [];
        result.map((value) => {  
          cList.push({value:value._id,label:value.clientName})
        } );
        setClientsList(cList);
        setClientsListReady(true);
      }
    });
    return () => unMounted = true ;
  },[]);


  switchClient = (selectedOption) => {
    if(selectedOption == null){
      Session.set("selectedClient",false);
    }else{
      Session.set("selectedClient",selectedOption.value);
    }
  }

  return (
    <AppBar className={classes.appBar + appBarClasses}>
      <Toolbar className={classes.container}>
        <div className={classes.flex}>
          {/* Here we create navbar brand, based on route name */}
          <Button color="transparent" href="#" className={classes.title}>
           { props.pageTitle }
          </Button>
        </div>
        {[
          "Parcel Status",
          "Group Clients",
          "Client Groups",
          "Client Group Manager",
          "Client Group Managers",
          "Outbound Emails"
        ].indexOf(props.pageTitle) > -1 || !props.ShowswitchClient ? (
          ""
        ) : (
          <div style={{ width: "200px" }}>
            <AsyncSelect
               cacheOptions={false}
               placeholder={ "SWITCH CLIENT" }
               classNamePrefix="custom-async-select"
               className={selectClass.customAsyncSelectMainClass}
               isClearable={true}
               isSearchable ={true}
               isLoading = {!clientsListReady}
               loadOptions={(inputValue,callback) => {
                if(inputValue !== ""){
                  setClientsListReady(false);
                  Meteor.call('clients.dropdownOptions',{"clientName":{$regex: inputValue,$options:"i"}},function (error,result) {
                    if(error) {
                      console.error(error);
                    }else{
                      let cList = [];
                      result.map((value) => {  
                        cList.push({value:value._id,label:value.clientName})
                      } );
                      callback(cList.filter( i => i ));
                      setClientsListReady(true);
                    }
                  });
                }
               }}
               defaultOptions={clientsList}
               onChange={(selectedOption)=> {  this.switchClient(selectedOption); } }
            />
        </div>)}
          
        <Hidden smDown implementation="css">
           <AdminNavbarLinks
           logoutUser={props.logoutUser}
            />
        </Hidden>
        
        <Hidden mdUp implementation="css">
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={props.handleDrawerToggle}
          >
            <Menu />
          </IconButton>
        </Hidden>
      </Toolbar>
    </AppBar>
  );
}

Header.propTypes = {
  color: PropTypes.oneOf(["primary", "info", "success", "warning", "danger"]),
  handleDrawerToggle: PropTypes.func,
  pageTitle: PropTypes.string,
  ShowswitchClient:PropTypes.bool,
  logoutUser: PropTypes.func
};



export default withTracker(() => {
return {};
})(Header);