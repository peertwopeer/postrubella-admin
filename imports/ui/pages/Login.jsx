import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { makeStyles } from "@material-ui/core/styles";
import Grid from '@material-ui/core/Grid';
import GridItem from "/imports/ui/components/Grid/GridItem.js";
import GridContainer from "/imports/ui/components/Grid/GridContainer.js";
import CustomInput from "/imports/ui/components/CustomInput/CustomInput.js";
import Card from "/imports/ui/components/Card/Card.js";
import CardHeader from "/imports/ui/components/Card/CardHeader.js";
import CardBody from "/imports/ui/components/Card/CardBody.js";
import CardFooter from "/imports/ui/components/Card/CardFooter.js";
import Button from "/imports/ui/components/CustomButtons/Button.js";
import styles from "/imports/ui/theme/assets/jss/material-dashboard-react/pages/loginStyle.js";


const useStyles = makeStyles(styles);
const publicDir = `${Meteor.settings.public.cdn}/public`;


const Login = props => {

  const classes = useStyles();
  const [userid, setUserid] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [useridErrors, setUseridErrors] = React.useState([]);
  const [passwordErrors, setPasswordErrors] = React.useState([]);
  const [loginError, setloginError] = React.useState("");

  // Login function 
  login =  (event) => {
    event.preventDefault();
    var uidErrors = [];
    var passErrors = [];

    if(userid == '') uidErrors.push("Username is required");
    if(password == '') passErrors.push("Password is required");
    if(password.length < 6) passErrors.push("6 character minimum password");
   
    setUseridErrors(uidErrors);
    setPasswordErrors(passErrors);
  
    if((uidErrors.length == 0) && (passErrors.length == 0)){
      const UserId = userid.replace(/\s+/g, '').toLowerCase().trim();
      
      Meteor.call('user.loginWithPassword',UserId, password,function(Error,result){
          if(Error){
           setloginError(Error.error);
           return
          }
          if(result){
            setloginError("");
            Meteor.loginWithPassword(UserId, password, function(Error){
              if(Error) return false;
              FlowRouter.go('Dashboard');
            });
          }
      });



    }
  }
  

  return(
    <Grid container className={classes.root} spacing={2}>
      <Grid item  xs={12} sm={12} md={12}>
        <Grid container justify="center" spacing={2}>
           <Card className={classes.card}>
             <CardBody>
            <CardHeader color="primary">
              <img src={`${publicDir}/svg/logo-admin-app.png`} />
            </CardHeader>
            <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                <h4 className={classes.cardTitle}>LOGIN</h4>
                <CustomInput
                        labelText="Enter username or email"
                        error={!(useridErrors.length == 0)}
                        formControlProps={{
                          fullWidth: true
                        }}
                        inputProps={{
                          value:userid,
                          onChange: e => setUserid(e.target.value),
                          onKeyPress: e =>{ if(e.key == 'Enter'){ this.login(e); } }
                        }}
                      />
                      { useridErrors.map(error => (<span key={error}>{error}<br /></span>)) }
                <CustomInput
                        labelText="Enter password"
                        error={!(passwordErrors.length == 0)}
                        formControlProps={{
                          fullWidth: true
                        }}
                        inputProps={{
                          value:password,
                          type:"password",
                          onChange: e => setPassword(e.target.value),
                          onKeyPress: e =>{ if(e.key == 'Enter'){ this.login(e); } }
                        }}
                      />
                      { passwordErrors.map(error => (<span key={error}>{error}<br /></span>)) }
                </GridItem>
              </GridContainer>
              </CardBody>
            <CardFooter>
              <span>{loginError}</span>
              <Button color="primary" onClick={this.login}>LET'S GO</Button>
            </CardFooter>
            </Card>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default withTracker(() => {
return { };
})(Login);
