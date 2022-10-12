import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { MuiThemeProvider }  from '@material-ui/core/styles';
import { makeStyles } from "@material-ui/core/styles";
import AppTheme  from '/imports/ui/theme/AppTheme';
import Footer from "/imports/ui/components/Footer/Footer";
import styles from "/imports/ui/theme/assets/jss/material-dashboard-react/layouts/adminStyle";

const useStyles = makeStyles(styles);

const App = props => {
  // styles
  const classes = useStyles();
  // ref to help us initialize PerfectScrollbar on windows devices
  const mainPanel = React.createRef();
  // states and functions
  return(
      <MuiThemeProvider theme={AppTheme}>
      <div className={classes.wrapper}>
       <div className={""} ref={mainPanel}>
          <div className={classes.content}>
          <div className={classes.container}>{props.content}</div>
       </div>
        <Footer />
      </div>
      </div>
      </MuiThemeProvider>
  )
}

export default withTracker(() => {
return { };
})(App);