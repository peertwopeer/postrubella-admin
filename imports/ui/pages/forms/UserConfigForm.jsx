import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from "prop-types";
import { map } from 'lodash';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Button from "/imports/ui/components/CustomButtons/Button.js";
import GridItem from "/imports/ui/components/Grid/GridItem.js";
import GridContainer from "/imports/ui/components/Grid/GridContainer.js";
import Card from "/imports/ui/components/Card/Card.js";
import CardHeader from "/imports/ui/components/Card/CardHeader.js";
import CardFooter from "/imports/ui/components/Card/CardFooter.js";
import CardBody from "/imports/ui/components/Card/CardBody.js";
import Typography from "/imports/ui/components/Typography/Typography.js"
import { Box, Grid, Switch} from '@material-ui/core';
import { makeStyles } from "@material-ui/core/styles";
import selectComponents from "/imports/ui/theme/assets/jss/material-dashboard-react/components/selectStyle.js";


const useSelectStyles = makeStyles(selectComponents);



const UserConfigForm = props => {

  const selectClass = useSelectStyles();
  const [defaultTimeZone, setDefaultTimeZone] = React.useState((typeof props.user.profile.timezone !== "undefined")? props.user.profile.timezone :"");
  const [defaultLanguage, setDefaultLanguage] = React.useState((typeof props.user.profile.language !== 'undefined') ? props.user.profile.language : "");
  const [twoFactorEnabled, setTwoFactorEnabled] = React.useState(((typeof props.user.twoFactorEnabled == "undefined") || (props.user.twoFactorEnabled === false))? false : true);

  saveConfig = () =>{
    configuration = {};

    configuration.timezone = defaultTimeZone;
    configuration.language = defaultLanguage;
    configuration.twoFactorEnabled = twoFactorEnabled;
    
    Meteor.call('users.updateConfiguration',props.user._id,configuration,function (error,result) {
      if(error) {
        swal('', error.error, 'error');
      }else{
        swal('', "Configuration updated", 'success');
        props.closeDialog();
      }
    });
  };
  
  changeTwoFactorEnabled = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
  }; 


  return (
    <GridContainer>
      <GridItem xs={12} sm={12} md={12}>
        <Card>
          <CardHeader color="primary">
            <span>
              Set App Language and Timezone for the user {(props.user.username!== 'undefined') ? props.user.username : ""}
            </span>
          </CardHeader>
          <CardBody>
            <GridItem xs={12} sm={12} md={12}>
              <Typography color="danger">The language and timezone of the application will be set to the client's language and timezone by default. If you want to change this, please select other options from the list provided.</Typography>
            </GridItem>
            <Box p={2} pb={1} xs={12} sm={12} md={6}>
            <GridContainer>
              <GridItem xs={12} sm={12} md={6}>
              <Typography  color="primary" variant="h4" >Select a language for user</Typography>
              </GridItem>
              <GridItem xs={12} sm={12} md={6}>
                {(<Select className={selectClass.customSelectMainClass} value={defaultLanguage} onChange={(event)=> setDefaultLanguage(event.target.value)}>
                  { (typeof props.user.languageList !== 'undefined') ? (
                      map(props.user.languageList,(lang => (
                        <MenuItem key={lang.value} value={lang.value}>{lang.label}</MenuItem>
                      )))
                  ) : []
                 }
                </Select>)}
              </GridItem>
              <GridItem xs={12} sm={12} md={6}> 
                <Typography color="primary" variant="h4">Select a timezone for user</Typography>
              </GridItem>
              <GridItem xs={12} sm={12} md={6}>
                {(<Select className={selectClass.customSelectMainClass} value={defaultTimeZone} onChange={(event)=> setDefaultTimeZone(event.target.value)}>
                    { (typeof props.user.timezoneList !== 'undefined') ? (
                        map(props.user.timezoneList,(timezone => (
                          <MenuItem key={timezone.value} value={timezone.value}>{timezone.label}</MenuItem>
                        )))
                    ) : []
                  }
                </Select>)}
              </GridItem>
              </GridContainer>
              <GridContainer>
              <GridItem xs={12} sm={12} md={6}> 
                <Typography color="primary" variant="h4">Two Factor Authentication</Typography>
              </GridItem>
              <GridItem xs={12} sm={12} md={6}>
                <Typography component="div">
                  <Grid component="label" container alignItems="center" spacing={1}>
                    <Grid item>Disable</Grid>
                    <Grid item>
                      <Switch
                        color="primary"
                        onChange={this.changeTwoFactorEnabled}
                        checked={twoFactorEnabled}
                      />
                    </Grid>
                    <Grid item>Enable</Grid>
                  </Grid>
                </Typography>
              </GridItem>
              </GridContainer>
            </Box>
          </CardBody>
          <CardFooter>
           <Button color="info" fullWidth={true} onClick={this.saveConfig} type="submit" >save</Button>
           <Button color="primary" fullWidth={true} onClick={props.closeDialog} >Close</Button>
          </CardFooter>
        </Card>
      </GridItem>
    </GridContainer>)
}

UserConfigForm.propTypes = {
  user: PropTypes.object,
  closeDialog: PropTypes.func
};

export default withTracker(() => {
  return {};
})(UserConfigForm);