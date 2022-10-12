import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { makeStyles } from "@material-ui/core/styles";
import { useForm } from 'react-hook-form';
import PropTypes from "prop-types";
import CustomInput from "/imports/ui/components/CustomInput/CustomInput.js";
import Button from "/imports/ui/components/CustomButtons/Button.js";
import GridItem from "/imports/ui/components/Grid/GridItem.js";
import GridContainer from "/imports/ui/components/Grid/GridContainer.js";
import styles from "/imports/ui/theme/assets/jss/material-dashboard-react/components/formStyle.js";
import swal from 'sweetalert';
const useStyles = makeStyles(styles);

const ProfileForm = props => {

  const classes = useStyles();
  const { register, handleSubmit, errors } = useForm({defaultValues:{}});



 
  // on submit form
  const onSubmit = (data) => {

    const oldPassword = data.old_password.trim();
    const newPassword = data.new_password.trim();
    const confirmPassword = data.confirm_new_password.trim();
    const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*\-])(?=.{6,})");

    if (oldPassword == newPassword){
      swal('', "Old password and new password are the same.", 'error');
      return;
    }

    if (newPassword !== confirmPassword){
      swal('', "New password and confirm new password are not matching.", 'error');
      return;
    }


    if (strongRegex.test(newPassword)) {
      //update user
      Meteor.call('users.update',props.user._id,{
        "username":props.user.username,
        "email":props.user.emails[0].address,
        "profile":{
          "firstname":props.user.profile.firstname,
          "lastname":props.user.profile.lastname,
          "clientId":props.user.profile.clientId,
        },
        "password":newPassword,
      },function(Error,result){
        if(Error) {
          swal('', Error.message, 'error');
        }else{
          swal('', "Profile updated.", 'success');
          props.closeDialog();
        }
      });
    }else {
      if (newPassword.length < 6) {
        swal('', 'New Password should be minimum 6 characters long', 'warning');
      }
      else {
        swal('', 'New Password should contain at least 1 upper character 1 lower character 1 number and 1 special character', 'warning');
      }
    }

      
    
  };

  return(<form onSubmit={handleSubmit(onSubmit)}>
    <GridContainer>
    <GridItem xs={6} sm={6} md={6}><div className={classes.formLabel}>Old password:</div>
           </GridItem><GridItem xs={6} sm={6} md={6}><CustomInput formControlProps={{}} inputProps={{type:"password",name:"old_password",inputRef:register({ required: true }),placeholder: "Old Password"}} /></GridItem>
          <GridItem xs={6} sm={6} md={6}><div className={classes.formLabel}>New password:</div>
           </GridItem><GridItem xs={6} sm={6} md={6}><CustomInput formControlProps={{}} inputProps={{type:"password",name:"new_password",inputRef:register({ required: true }),placeholder: "New Password"}} /></GridItem>
          <GridItem xs={6} sm={6} md={6}><div className={classes.formLabel}>Confirm new password:</div>
           </GridItem><GridItem xs={6} sm={6} md={6}><CustomInput formControlProps={{}} inputProps={{type:"password",name:"confirm_new_password",inputRef:register({ required: true }),placeholder: "Confirm New Password"}} /></GridItem>
    </GridContainer>
      <Button color="info" fullWidth={true} type="submit" >save</Button>
  </form>)
}

ProfileForm.propTypes = {
    user: PropTypes.object,
    closeDialog: PropTypes.func
  };

export default withTracker(() => {
    return {};
    })(ProfileForm);
