import React from "react";
// nodejs library that concatenates classes
import classNames from "classnames";
// nodejs library to set properties for components
import PropTypes from "prop-types";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
// @material-ui/icons

// core components
import styles from "/imports/ui/theme/assets/jss/material-dashboard-react/components/typographyStyle.js";

const useStyles = makeStyles(styles);

export default function Typography(props) {
    const classes = useStyles();
    const { className, children, color, ...rest } = props;
    const typographyClasses = classNames({
      [classes[color + "Text"]]: color,
      [className]: className !== undefined
    });
    return (
      <div className={typographyClasses} {...rest}>
        {children}
      </div>
    );
  }
  
  Typography.propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
    color: PropTypes.oneOf([
      "warning",
      "success",
      "danger",
      "info",
      "primary",
      "rose"
    ]),
  };