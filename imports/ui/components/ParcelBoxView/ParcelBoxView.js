import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import Card from "/imports/ui/components/Card/Card.js";
import CardBody from "/imports/ui/components/Card/CardBody.js";
import styles from "/imports/ui/theme/assets/jss/material-dashboard-react/pages/dashboardStyle.js";
import moment from "moment";
const useStyles = makeStyles(styles);

export default function ParcelBoxView(props) {
  const classes = useStyles();
  const parcel = props.parcel;
  let photoUrl = "";

  if (typeof parcel.photoName !== "undefined" && parcel.photoName !== "") {
    if (
      Meteor.absoluteUrl().includes("localhost") ||
      Meteor.absoluteUrl().includes("dev-admin.postrubella.io")
    ) {
      photoUrl =
        "https://postrubella.ams3.digitaloceanspaces.com/public/parcels-photos/dev/" +
        moment(parcel.createdAt).format("YYYY") +
        "/" +
        parcel.photoName;
    } else {
      photoUrl =
        "https://postrubella.ams3.digitaloceanspaces.com/public/parcels-photos/" +
        moment(parcel.createdAt).format("YYYY") +
        "/" +
        parcel.photoName;
    }
  }
  return (
    <Card className={classes.card}>
      <CardBody>
        <h5 className={classes.cardTitle}>
          <strong>{parcel.clientUniqueBarcode}</strong>
        </h5>

        <table className={classes.cardCategory}>
          <tbody>
            <tr className={classes.cardTitle}>
              <td>
                <label className={classes.cardTitle}>
                  <b>Post:</b>
                </label>
              </td>
              <td>
                <span>{parcel.type}</span>
              </td>
            </tr>
            <tr
              hidden={parcel.barcode ? false : true}
              className={classes.cardTitle}
            >
              <td>
                <label className={classes.cardTitle}>
                  <b>Barcode:</b>
                </label>
              </td>
              <td>
                <span>{parcel.barcode}</span>
              </td>
            </tr>
            <tr
              hidden={parcel.sender ? false : true}
              className={classes.cardTitle}
            >
              <td>
                <label className={classes.cardTitle}>
                  <b>Sender:</b>
                </label>
              </td>
              <td>
                <span>{parcel.sender}</span>
              </td>
            </tr>
            <tr className={classes.cardTitle}>
              <td>
                <label className={classes.cardTitle}>
                  <b>Carrier:</b>
                </label>
              </td>
              <td>
                <span>{parcel.carrier}</span>
              </td>
            </tr>
            <tr
              hidden={parcel.destination ? false : true}
              className={classes.cardTitle}
            >
              <td>
                <label className={classes.cardTitle}>
                  <b>Destination:</b>
                </label>
              </td>
              <td>
                <span>{parcel.destination}</span>
              </td>
            </tr>
            <tr className={classes.cardTitle}>
              <td>
                <label className={classes.cardTitle}>
                  <b>Location:</b>
                </label>
              </td>
              <td>
                <span>{parcel.location}</span>
              </td>
            </tr>
            <tr className={classes.cardTitle}>
              <td>
                <label className={classes.cardTitle}>
                  <b>Recipient:</b>
                </label>
              </td>
              <td>
                <span>{parcel.recipientName}</span>
              </td>
            </tr>

            <tr
              hidden={parcel.deliveryType ? false : true}
              className={classes.cardTitle}
            >
              <td>
                <label className={classes.cardTitle}>
                  <b>Delivery Type:</b>
                </label>
              </td>
              <td>
                <span>{parcel.deliveryType}</span>
              </td>
            </tr>

            <tr className={classes.cardTitle}>
              <td>
                <label className={classes.cardTitle}>
                  <b>Number Of Items:</b>
                </label>
              </td>
              <td>
                <span>{parcel.numberOfItems}</span>
              </td>
            </tr>
            <tr
              hidden={parcel.outboundAddress ? false : true}
              className={classes.cardTitle}
            >
              <td>
                <label className={classes.cardTitle}>
                  <b>Outbound Address:</b>
                </label>
              </td>
              <td>
                <span>{parcel.outboundAddress}</span>
              </td>
            </tr>
            <tr
              hidden={parcel.deliveryUser ? false : true}
              className={classes.cardTitle}
            >
              <td>
                <label className={classes.cardTitle}>
                  <b>Delivery User:</b>
                </label>
              </td>
              <td>
                <span>{parcel.deliveryUser}</span>
              </td>
            </tr>
            <tr
              hidden={parcel.deliveredByUsername ? false : true}
              className={classes.cardTitle}
            >
              <td>
                <label className={classes.cardTitle}>
                  <b>Delivered By:</b>
                </label>
              </td>
              <td>
                <span>{parcel.deliveredByUsername}</span>
              </td>
            </tr>
            <tr
              hidden={parcel.signee ? false : true}
              className={classes.cardTitle}
            >
              <td>
                <label className={classes.cardTitle}>
                  <b>Signee:</b>
                </label>
              </td>
              <td>
                <span>{parcel.signee}</span>
              </td>
            </tr>
            <tr
              hidden={
                typeof parcel.photoName !== "undefined" &&
                parcel.photoName !== ""
                  ? false
                  : true
              }
              className={classes.cardTitle}
            >
              <td>
                <label className={classes.cardTitle}>
                  <a href={photoUrl} target="_blank">
                    Click here to open image file
                  </a>
                </label>
              </td>
              <td>
                <br />
              </td>
            </tr>
            <tr>
              <td>
                <br />
              </td>
              <td>
                <br />
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td>
                <label className="last-modified">
                  Last Modified: {moment(parcel.updatedAt).fromNow()}
                </label>
              </td>
            </tr>
          </tfoot>
        </table>
      </CardBody>
    </Card>
  );
}
ParcelBoxView.propTypes = {
  parcel: PropTypes.object,
};
