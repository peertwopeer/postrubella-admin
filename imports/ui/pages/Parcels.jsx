import { Meteor } from "meteor/meteor";
import React from "react";
import { withTracker } from "meteor/react-meteor-data";
import GridItem from "/imports/ui/components/Grid/GridItem.js";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import GridContainer from "/imports/ui/components/Grid/GridContainer.js";
import Card from "/imports/ui/components/Card/Card.js";
import CardHeader from "/imports/ui/components/Card/CardHeader.js";
import CardBody from "/imports/ui/components/Card/CardBody.js";
import Table from "/imports/ui/components/Table/Table.js";
import CardFooter from "/imports/ui/components/Card/CardFooter.js";
import Button from "/imports/ui/components/CustomButtons/Button.js";
import Loader from "/imports/ui/components/Loader/Loader.js";
import CustomInput from "/imports/ui/components/CustomInput/CustomInput.js";
import Pagination from "@material-ui/lab/Pagination";
import Dialog from "@material-ui/core/Dialog";
import { makeStyles } from "@material-ui/core/styles";
import moment from "moment-timezone";
import swal from "sweetalert";
import styles from "/imports/ui/theme/assets/jss/material-dashboard-react/pages/dataListStyle.js";
var _ = require("lodash");

const useStyles = makeStyles(styles);
const pageLimit = 10;

const Parcels = (props) => {
  const classes = useStyles();
  const [openView, setOpenView] = React.useState(false);
  const [selectedParcel, setSelectedParcel] = React.useState({});
  const [parcels, setParcels] = React.useState([]);
  const [parcelsReady, setParcelsReady] = React.useState(false);
  const [searchParams, SetSearchParams] = React.useState({});
  const [currentPage, SetCurrentPage] = React.useState(1);
  const [totalPages, SetTotalPages] = React.useState(0);
  const [searchButtonValue, SetSearchButtonValue] = React.useState(false);

  // component did update
  React.useEffect(() => {
    let unMounted = false;
    setParcelsReady(false);

    // Set client id
    if (props.selectedClient) {
      searchParams["clientId"] = props.selectedClient;
    } else {
      delete searchParams["clientId"];
    }

    Meteor.call(
      "parcels.list",
      pageLimit,
      currentPage,
      searchParams,
      function (error, result) {
        if (error) {
          console.log(error);
        } else {
          let pList = [];
          result.map(function (obj) {
            pList.push([
              obj.clientUniqueBarcode,
              obj.barcode,
              obj.location,
              obj.recipientName,
              <Button
                color="primary"
                size="sm"
                onClick={() => {
                  this.viewParcel(obj);
                }}
              >
                view
              </Button>,
              <Button
                color="primary"
                size="sm"
                onClick={() => {
                  FlowRouter.go("TrackParcel", {
                    parcelId: obj._id,
                  });
                }}
              >
                track
              </Button>,
              <Button
                color="danger"
                size="sm"
                onClick={() => {
                  this.deleteParcel(obj._id);
                }}
              >
                delete
              </Button>,
            ]);
          });
          setParcels(pList);
          setParcelsReady(true);
        }
      }
    );

    //set total count for pagination
    Meteor.call("parcels.totalCount", searchParams, function (error, result) {
      if (error) {
        console.error(error);
      } else {
        SetTotalPages(Math.ceil(result / pageLimit));
      }
    });
    return () => (unMounted = true);
  }, [searchButtonValue, currentPage, props.selectedClient]);

  changePage = (page) => {
    SetCurrentPage(page);
  };

  setSearchQuery = (key, value) => {
    let params = searchParams;
    if (value == "") {
      delete params[key];
    } else {
      if (key === "barcode") {
        params[key] = { $regex: value + "*", $options: "i" };
      }
      if (key === "clientUniqueBarcode") {
        params[key] = { $regex: `^${value}`, $options: "i" };
      }
    }
    let cleanParams = _.pickBy(params, function (v, k) {
      return !(v === undefined || v === "");
    });
    SetSearchParams(cleanParams);
  };

  viewParcel = (parcel) => {
    setSelectedParcel(parcel);
    setOpenView(true);
  };

  handleCloseView = () => {
    setOpenView(false);
    setSelectedParcel({});
  };

  deleteParcel = (parcelId) => {
    swal("Are you sure? They will be deleted forever.", {
      buttons: ["Cancel", "Delete"],
      dangerMode: true,
    }).then(function (isConfirm) {
      if (isConfirm) {
        Meteor.call("parcel.delete", parcelId, function (error, result) {
          if (error) {
            swal("", `something happened ${error}`, "error");
          }
          if (result) {
            swal("Parcel has been deleted");
            SetSearchButtonValue(!searchButtonValue);
          }
        });
      }
    });
  };
  return (
    <div>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <Card>
            <CardHeader color="primary">
              <h4 className={classes.cardTitleWhite}>Parcels</h4>
              <p className={classes.cardCategoryWhite}>Manage parcels</p>
            </CardHeader>
            <CardBody>
              <GridContainer>
                <GridItem xs={4}>
                  {/* search fields  */}
                  <CustomInput
                    formControlProps={{}}
                    inputProps={{
                      placeholder: "Search by org_name Number",
                      inputProps: {
                        "aria-label": "Search",
                        onChange: (e) => {
                          setSearchQuery("clientUniqueBarcode", e.target.value);
                          SetCurrentPage(1);
                        },
                        onKeyPress: (e) => {
                          if (e.key == "Enter")
                            SetSearchButtonValue(!searchButtonValue);
                        },
                      },
                    }}
                  />
                </GridItem>
                <GridItem xs={4}>
                  {/* search fields  */}
                  <CustomInput
                    formControlProps={{}}
                    inputProps={{
                      placeholder: "Search by Barcode",
                      inputProps: {
                        "aria-label": "Search",
                        onChange: (e) => {
                          setSearchQuery("barcode", e.target.value);
                          SetCurrentPage(1);
                        },
                        onKeyPress: (e) => {
                          if (e.key == "Enter")
                            SetSearchButtonValue(!searchButtonValue);
                        },
                      },
                    }}
                  />
                </GridItem>
                {/* search button */}
                <GridItem xs={4}>
                  <Button
                    color="primary"
                    size="sm"
                    onClick={() => SetSearchButtonValue(!searchButtonValue)}
                  >
                    search
                  </Button>
                </GridItem>
              </GridContainer>

              {parcelsReady ? (
                <Table
                  tableHeaderColor="primary"
                  tableHead={[
                    "org_name Number",
                    "Barcode",
                    "Location",
                    "Recipient",
                    "Actions",
                    "",
                    "",
                  ]}
                  tableData={parcels}
                />
              ) : (
                <Loader color="inherit" />
              )}
            </CardBody>
            <CardFooter>
              <Pagination
                page={currentPage}
                count={totalPages}
                onChange={(event, page) => this.changePage(page)}
                color="primary"
              />
            </CardFooter>
          </Card>
        </GridItem>
      </GridContainer>
      <Dialog
        onClose={this.handleCloseView}
        aria-labelledby="simple-dialog-title"
        open={openView}
      >
        <Card className={classes.card}>
          <CardHeader color="primary">
            <p className={classes.cardCategoryWhite}>Parcel details:</p>
          </CardHeader>
          <CardBody className={classes.CardBody}>
            <GridContainer>
              <GridItem xs={6} sm={6} md={6}>
                {typeof selectedParcel.qrcode !== "undefined" ? (
                  <img src={selectedParcel.qrcode} alt="QR Code" width="80" />
                ) : (
                  ""
                )}
              </GridItem>
              <GridItem xs={6} sm={6} md={6}></GridItem>
              <GridItem
                xs={6}
                sm={6}
                md={6}
                hidden={
                  selectedParcel.barcode !== undefined &&
                  selectedParcel.barcode != ""
                    ? false
                    : true
                }
              >
                Barcode:
              </GridItem>
              <GridItem
                xs={6}
                sm={6}
                md={6}
                hidden={
                  selectedParcel.barcode !== undefined &&
                  selectedParcel.barcode != ""
                    ? false
                    : true
                }
              >
                {typeof selectedParcel.barcode !== "undefined"
                  ? selectedParcel.barcode
                  : ""}
              </GridItem>
              <GridItem xs={6} sm={6} md={6}>
                Carrier:
              </GridItem>
              <GridItem xs={6} sm={6} md={6}>
                {typeof selectedParcel.carrier !== "undefined"
                  ? selectedParcel.carrier
                  : ""}
              </GridItem>
              <GridItem xs={6} sm={6} md={6}>
                Recipient Name:
              </GridItem>
              <GridItem xs={6} sm={6} md={6}>
                {typeof selectedParcel.recipientName !== "undefined"
                  ? selectedParcel.recipientName
                  : ""}
              </GridItem>
              <GridItem
                xs={6}
                sm={6}
                md={6}
                hidden={selectedParcel.sender !== undefined ? false : true}
              >
                Sender:
              </GridItem>
              <GridItem
                xs={6}
                sm={6}
                md={6}
                hidden={selectedParcel.sender !== undefined ? false : true}
              >
                {typeof selectedParcel.sender !== "undefined"
                  ? selectedParcel.sender
                  : ""}
              </GridItem>
              <GridItem xs={6} sm={6} md={6}>
                Location:
              </GridItem>
              <GridItem xs={6} sm={6} md={6}>
                {typeof selectedParcel.location !== "undefined"
                  ? selectedParcel.location
                  : ""}
              </GridItem>
              <GridItem xs={6} sm={6} md={6}>
                Delivery Type:
              </GridItem>
              <GridItem xs={6} sm={6} md={6}>
                {typeof selectedParcel.deliveryType !== "undefined"
                  ? selectedParcel.deliveryType
                  : ""}
              </GridItem>
              <GridItem xs={6} sm={6} md={6}>
                Delivery User:
              </GridItem>
              <GridItem xs={6} sm={6} md={6}>
                {typeof selectedParcel.deliveryUser !== "undefined"
                  ? selectedParcel.deliveryUser
                  : ""}
              </GridItem>
              <GridItem xs={6} sm={6} md={6}>
                Number Of Items:
              </GridItem>
              <GridItem xs={6} sm={6} md={6}>
                {typeof selectedParcel.numberOfItems !== "undefined"
                  ? selectedParcel.numberOfItems
                  : ""}
              </GridItem>
              <GridItem xs={6} sm={6} md={6}>
                Created Date:
              </GridItem>
              <GridItem xs={6} sm={6} md={6}>
                {typeof selectedParcel.createdAt !== "undefined"
                  ? moment(selectedParcel.createdAt).format("DD-MMM-YYYY")
                  : ""}
              </GridItem>

              <GridItem
                xs={6}
                sm={6}
                md={6}
                hidden={selectedParcel.deliveredAt !== undefined ? false : true}
              >
                Delivered Date:
              </GridItem>
              <GridItem
                xs={6}
                sm={6}
                md={6}
                hidden={selectedParcel.deliveredAt !== undefined ? false : true}
              >
                {typeof selectedParcel.deliveredAt !== "undefined"
                  ? moment(selectedParcel.deliveredAt).format("DD-MMM-YYYY")
                  : ""}
              </GridItem>

              <GridItem
                xs={6}
                sm={6}
                md={6}
                hidden={
                  selectedParcel.notes !== undefined &&
                  selectedParcel.notes != ""
                    ? false
                    : true
                }
              >
                Notes:
              </GridItem>
              <GridItem
                xs={6}
                sm={6}
                md={6}
                hidden={
                  selectedParcel.notes !== undefined &&
                  selectedParcel.notes != ""
                    ? false
                    : true
                }
              >
                {typeof selectedParcel.notes !== "undefined"
                  ? selectedParcel.notes
                  : ""}
              </GridItem>
              <GridItem
                xs={6}
                sm={6}
                md={6}
                hidden={
                  selectedParcel.signee !== undefined &&
                  selectedParcel.signee != ""
                    ? false
                    : true
                }
              >
                Signee:
              </GridItem>

              <GridItem
                xs={6}
                sm={6}
                md={6}
                hidden={selectedParcel.signee !== undefined ? false : true}
              >
                {typeof selectedParcel.signee !== "undefined"
                  ? selectedParcel.signee
                  : ""}
              </GridItem>
            </GridContainer>
          </CardBody>
          <CardFooter>
            <Button
              color="primary"
              fullWidth={true}
              onClick={this.handleCloseView}
            >
              Close
            </Button>
          </CardFooter>
        </Card>
      </Dialog>
    </div>
  );
};

export default withTracker(() => {
  var selectedClient = false;
  if (Session.get("selectedClient")) {
    selectedClient = Session.get("selectedClient");
  }
  return {
    selectedClient: selectedClient,
  };
})(Parcels);
