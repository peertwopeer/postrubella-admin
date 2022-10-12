import { Meteor } from "meteor/meteor";
import React from "react";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import GridItem from "/imports/ui/components/Grid/GridItem.js";
import GridContainer from "/imports/ui/components/Grid/GridContainer.js";
import Card from "/imports/ui/components/Card/Card.js";
import CardHeader from "/imports/ui/components/Card/CardHeader.js";
import CardBody from "/imports/ui/components/Card/CardBody.js";
import Table from "/imports/ui/components/Table/Table.js";
import CardFooter from "/imports/ui/components/Card/CardFooter.js";
import Button from "/imports/ui/components/CustomButtons/Button.js";
import CustomInput from "/imports/ui/components/CustomInput/CustomInput.js";
import Loader from "/imports/ui/components/Loader/Loader.js";
import Pagination from "@material-ui/lab/Pagination";
import GroupClientForm from "/imports/ui/pages/forms/GroupClientForm";
import Dialog from "@material-ui/core/Dialog";
import { makeStyles } from "@material-ui/core/styles";
import moment from "moment-timezone";
import swal from "sweetalert";
import styles from "/imports/ui/theme/assets/jss/material-dashboard-react/pages/dataListStyle.js";
var _ = require("lodash");

const useStyles = makeStyles(styles);
const pageLimit = 10;

const clientGroup = () => {
  const classes = useStyles();

  const [openView, setOpenView] = React.useState(false);
  const [enableCreate, setEnableCreate] = React.useState(false);

  const [selectedGroup, setSeletedGroup] = React.useState({});
  const [selectedGroupClients, setSeletedGroupClients] = React.useState([]);
  const [selectedGroupManagers, setSeletedGroupManagers] = React.useState([]);

  const [clients, setClients] = React.useState([]);
  const [clientsReady, setClientsReady] = React.useState(false);

  const [searchParams, SetSearchParams] = React.useState({});
  const [currentPage, SetCurrentPage] = React.useState(1);
  const [totalPages, SetTotalPages] = React.useState(0);

  // component did update
  React.useEffect(() => {
    let unMounted = false;
    setClientsReady(false);

    Meteor.call(
      "clientGroups.list",
      pageLimit,
      currentPage,
      searchParams,
      function (error, result) {
        if (error) {
          console.log(error);
        } else {
          let cList = [];
          result.map(function (obj) {
            cList.push([
              obj.name,
              moment(obj.createdAt).format("DD-MMM-YYYY"),

              <Button
                color="primary"
                size="sm"
                onClick={() => {
                  FlowRouter.go("ClientsInClientsGroup", {
                    clientIds: obj.clients,
                  });
                }}
              >
                clients
              </Button>,
              <Button
                color="primary"
                size="sm"
                onClick={() => {
                  FlowRouter.go("ManagersInClientsGroup", {
                    groupManagersIds: obj.groupManagers,
                  });
                }}
              >
                managers
              </Button>,
              <Button
                color="primary"
                size="sm"
                onClick={() => {
                  this.viewGroup(obj);
                }}
              >
                amend
              </Button>,
              <Button
                color="danger"
                size="sm"
                onClick={() => {
                  this.deleteGroup(obj._id, obj.name, obj.clients);
                }}
              >
                delete
              </Button>,
            ]);
          });
          setClients(cList);
          setClientsReady(true);
        }
      }
    );
    //set total count
    Meteor.call(
      "clientGroups.totalCount",
      searchParams,
      function (error, result) {
        if (error) {
          console.error(error);
        } else {
          SetTotalPages(Math.ceil(result / pageLimit));
        }
      }
    );
    return () => (unMounted = true);
  }, [searchParams, currentPage]);

  //get clients and managers details
  React.useEffect(() => {
    if (!Object.keys(selectedGroup).length) return;
    let unMounted = false;
    //load clients
    Meteor.call(
      "clientGroup.clientsInClientsGroup",
      selectedGroup.clients,
      function (error, result) {
        if (error) {
          console.log(error);
          handleCloseView();
        } else {
          let cList = [];
          result.map((value) => {
            cList.push({ value: value._id, label: value.clientName });
          });
          setSeletedGroupClients(cList);
        }
      }
    );
    Meteor.call(
      "clientGroup.ManagersInClientsGroup",
      selectedGroup.groupManagers,
      function (error, result) {
        if (error) {
          console.log(error);
          handleCloseView();
        } else {
          let gMList = [];
          result.map((value) => {
            gMList.push({
              value: value._id,
              label: value.username,
              clientId: value.profile.clientId,
            });
          });
          setSeletedGroupManagers(gMList);
        }
      }
    );
    return () => (unMounted = true);
  }, [selectedGroup]);

  changePage = (page) => {
    SetCurrentPage(page);
  };

  setSearchQuery = (key, value) => {
    let params = searchParams;
    if (value == "") {
      delete params[key];
    } else {
      params[key] = { $regex: value + "*", $options: "i" };
    }
    let cleanParams = _.pickBy(params, function (v, k) {
      return !(v === undefined || v === "");
    });
    SetSearchParams(cleanParams);
  };

  viewGroup = (group) => {
    setSeletedGroup(group);
    setOpenView(true);
  };

  handleCloseView = () => {
    setOpenView(false);
    setSeletedGroup({});
    setSeletedGroupClients([]);
    setSeletedGroupManagers([]);
    setEnableCreate(false);
    let searchParamsCurrentValue = searchParams;
    SetSearchParams({ _id: null });
    SetSearchParams(searchParamsCurrentValue);
  };

  deleteGroup = (groupId, groupName, clientIds) => {
    swal(`Are you sure you want to delete the ${groupName} group? `, {
      buttons: ["Cancel", "Delete"],
      dangerMode: true,
    }).then(function (isConfirm) {
      if (isConfirm) {
        Meteor.call("clientsGroup.delete", groupId, function (error, result) {
          if (result) {
            Meteor.call(
              "clientsGroup.unSetGroupIds",
              {
                clientIds,
              },
              function (error, result) {
                if (error)
                  swal(
                    "Error",
                    "something went wrong when Removing groupID",
                    "error"
                  );
                if (result) {
                  swal(`${groupName} Group Deleted`);
                  handleCloseView();
                }
              }
            );
          } else {
            swal("", `something went wrong`, "error");
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
              <h4 className={classes.cardTitleWhite}>Client Groups</h4>
              <p className={classes.cardCategoryWhite}>Manage client groups</p>
            </CardHeader>
            <CardBody>
              <GridContainer>
                <GridItem xs={4}>
                  {/* search fields  */}
                  <CustomInput
                    formControlProps={{}}
                    inputProps={{
                      placeholder: "Search by Group Name",
                      inputProps: {
                        "aria-label": "Search",
                        onChange: (e) => {
                          setSearchQuery("name", e.target.value);
                          SetCurrentPage(1);
                        },
                      },
                    }}
                  />
                </GridItem>

                {/* create button */}
                <GridItem xs={4}>
                  <Button
                    color="info"
                    onClick={() => {
                      setEnableCreate(true);
                      setOpenView(true);
                    }}
                  >
                    CREATE NEW CLIENT GROUP
                  </Button>
                </GridItem>
              </GridContainer>

              {clientsReady ? (
                <Table
                  tableHeaderColor="primary"
                  tableHead={[
                    "Group Name",
                    "Created Date",
                    "Actions",
                    "",
                    "",
                    "",
                  ]}
                  tableData={clients}
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
        {/* Create */}
        {enableCreate ? (
          <Card>
            <CardHeader color="primary">
              <p className={classes.cardCategoryWhite}>Create New Group</p>
            </CardHeader>
            <CardBody>
              <GroupClientForm
                action="CREATE"
                closeDialog={this.handleCloseView}
              />
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
        ) : //amend
        !_.isEmpty(selectedGroupManagers) ? (
          <Card>
            <CardHeader color="primary">
              <p className={classes.cardCategoryWhite}>
                Group:{" "}
                {typeof selectedGroup.name !== "undefined"
                  ? selectedGroup.name
                  : ""}
              </p>
            </CardHeader>
            <CardBody>
              <GroupClientForm
                action="AMEND"
                selectedGroupId={selectedGroup._id}
                selectedGroupName={selectedGroup.name}
                clients={selectedGroupClients}
                managers={selectedGroupManagers}
                closeDialog={this.handleCloseView}
              />
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
        ) : (
          <Loader color="inherit" />
        )}
      </Dialog>
    </div>
  );
};

export default clientGroup;
