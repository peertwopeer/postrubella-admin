/*eslint-disable*/
import React from "react";
import classNames from "classnames";
import PropTypes from "prop-types";
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Button from '@material-ui/core/Button';
import Icon from "@material-ui/core/Icon";
// core components

import styles from "/imports/ui/theme/assets/jss/material-dashboard-react/components/sidebarStyle";

const useStyles = makeStyles(styles);

export default function Sidebar(props) {
  const classes = useStyles();
  // verifies if routeName is the one active (in browser input)
  function activeRoute(routeName) {
    return window.location.href.indexOf(routeName) > -1 ? true : false;
  }
  const { logo, color, routes } = props;
  var links = (
    <List className={classes.list}>
      {routes.map((prop, key) => {
       
        var listItemClasses;
       
          listItemClasses = classNames({
            [" " + classes[color]]: activeRoute(prop.layout + prop.path)
          });
        
        const whiteFontClasses = classNames({
          [" " + classes.whiteFont]: activeRoute(prop.layout + prop.path)
        });
        return (
          <Button variant="contained" key={key} className={classes.item} onClick={()=> FlowRouter.go(prop.name)}>
            <ListItem className={classes.itemLink + listItemClasses } >
                <Icon
                  className={classNames(classes.itemIcon, whiteFontClasses)}
                >
                  {prop.icon}
                </Icon>
              <ListItemText
                primary={prop.name}
                className={classNames(classes.itemText, whiteFontClasses)}
                disableTypography={true}
              />
            </ListItem>
            </Button>
        );
      })}
    </List>
  );
  var brand = (
    <div className={classes.logo}>
      <a
        href="/"
        className={classNames(classes.logoLink)}
      >
        <div className={classes.logoImage}>
        <img src={logo} alt="logo" className={classes.img} />
        </div>
      </a>
    </div>
  );
  return (
    <div>
      <Hidden mdUp implementation="css">
        <Drawer
          variant="temporary"
          anchor={"right"}
          open={props.open}
          classes={{
            paper: classNames(classes.drawerPaper)
          }}
          onClose={props.handleDrawerToggle}
          ModalProps={{
            keepMounted: true // Better open performance on mobile.
          }}
        >
          {brand}
          <div className={classes.sidebarWrapper}>
            {links}
            {/* mobile view only */}
            <Button variant="contained" className={classes.item} onClick={()=> props.logoutUser() }>
            <ListItem className={classes.itemLink } >
                {/* <Icon
                  className={classNames(classes.itemIcon)}
                >
                  {prop.icon}
                </Icon> */}
              <ListItemText
                primary={"Logout"}
                className={classNames(classes.itemText)}
                disableTypography={true}
              />
            </ListItem>
            </Button>
          </div>
        </Drawer>
      </Hidden>
      <Hidden smDown implementation="css">
        <Drawer
          anchor={"left"}
          variant="permanent"
          open
          classes={{
            paper: classNames(classes.drawerPaper)
          }}
        >
          {brand}
          <div className={classes.sidebarWrapper}>{links}</div>
        </Drawer>
      </Hidden>
    </div>
  );
}

Sidebar.propTypes = {
  bgColor: PropTypes.oneOf(["purple", "blue", "green", "orange", "red"]),
  logo: PropTypes.string,
  open: PropTypes.bool,
  routes: PropTypes.arrayOf(PropTypes.object),
  handleDrawerToggle: PropTypes.func,
  logoutUser: PropTypes.func
};
