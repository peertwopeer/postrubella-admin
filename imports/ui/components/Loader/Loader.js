import React from "react";
// nodejs library to set properties for components
import PropTypes from "prop-types";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import CircularProgress from '@material-ui/core/CircularProgress';
// @material-ui/icons

// core components
import styles from "/imports/ui/theme/assets/jss/material-dashboard-react/components/loaderStyle.js";

const useStyles = makeStyles(styles);

export default function Loader(props) {
  const classes = useStyles();
  const { color } = props;
 
  return (
    <div className={classes.root}>
      <CircularProgress color={color} />
    </div>
  );
}

Loader.propTypes = {
  color: PropTypes.string
};
