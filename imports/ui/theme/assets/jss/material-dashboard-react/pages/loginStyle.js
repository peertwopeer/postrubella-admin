import {
  grayColor,
  primaryColor,
  infoColor,
  successColor,
  warningColor,
  dangerColor,
  roseColor,
  whiteColor,
  blackColor,
  hexToRgb
} from "/imports/ui/theme/assets/jss/material-dashboard-react.js";

const loginStyle = { 
  root: {
    flexGrow: 1,
  },
  card: {
    height: "auto",
    width: 400
   },
  cardTitle: {
    color: primaryColor[3],
    marginTop: "20px",
    minHeight: "auto",
    fontWeight: "600",
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: "3px",
    textDecoration: "none",
    "& small": {
      color: grayColor[1],
      fontWeight: "400",
      lineHeight: "1"
    },
    textAlign: "center"
  }
};

export default loginStyle;
