import { Meteor } from 'meteor/meteor';
import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { makeStyles } from "@material-ui/core/styles";
import Dialog from '@material-ui/core/Dialog';
import GridItem from "/imports/ui/components/Grid/GridItem.js";
import GridContainer from "/imports/ui/components/Grid/GridContainer.js";
import Card from "/imports/ui/components/Card/Card.js";
import CardHeader from "/imports/ui/components/Card/CardHeader.js";
import CardBody from "/imports/ui/components/Card/CardBody.js";
import Button from "/imports/ui/components/CustomButtons/Button.js";
import ProfileForm from '/imports/ui/pages/forms/ProfileForm';
import styles from "/imports/ui/theme/assets/jss/material-dashboard-react/pages/profileStyle.js";


const useStyles = makeStyles(styles);




const Profile = props => {
  const classes = useStyles();
  const [openProfileUpdateDilog, setOpenProfileUpdateDilog] = React.useState(false);

  handleCloseProfileUpdateDilog = () => {
    setOpenProfileUpdateDilog(false);
  }

  return(<div>
    {(props.userReady)?<GridContainer>
    <GridItem xs={12} sm={6} md={6}>
    <Card>
      <CardHeader color="success" >
        <p className={classes.cardCategoryWhite}>Username: {props.userProfile.username} </p>
      </CardHeader>
        <CardBody>
          <GridContainer>
          <GridItem xs={6} sm={6} md={6}>First Name:
           </GridItem><GridItem xs={6} sm={6} md={6}>{(typeof props.userProfile.profile.firstname !== 'undefined')? props.userProfile.profile.firstname : "" }</GridItem>
           <GridItem xs={6} sm={6} md={6}>Last Name:
           </GridItem><GridItem xs={6} sm={6} md={6}>{(typeof props.userProfile.profile.lastname !== 'undefined')? props.userProfile.profile.lastname : "" }</GridItem>
           <Button color="warning" onClick={() => { setOpenProfileUpdateDilog(true); }}>update profile</Button>
          </GridContainer>
        </CardBody>
    </Card>
    </GridItem>
    </GridContainer>
    :"Loading..." }
     {/* profile update dialog  */}
     <Dialog onClose={ this.handleCloseProfileUpdateDilog } aria-labelledby="simple-dialog-title" open={openProfileUpdateDilog}>
        <Card>
          <CardHeader color="primary">
          <p className={classes.cardCategoryWhite}>Update profile</p>
          </CardHeader>
          <CardBody>
           <ProfileForm user={props.userProfile} closeDialog={this.handleCloseProfileUpdateDilog} />
          </CardBody>
        </Card>
     </Dialog>
  </div>)
}

export default withTracker(() => {
return {
  userProfile: Meteor.user(),
  userReady: (Meteor.user() !== undefined)
};
})(Profile);
