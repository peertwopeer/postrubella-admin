import React from "react";
import AsyncSelect from "react-select/async";
import { makeStyles } from "@material-ui/core/styles";
import Button from "/imports/ui/components/CustomButtons/Button.js";
import GridItem from "/imports/ui/components/Grid/GridItem.js";
import swal from "sweetalert";
import GridContainer from "/imports/ui/components/Grid/GridContainer.js";
import styles from "/imports/ui/theme/assets/jss/material-dashboard-react/components/formStyle.js";
import selectComponents from "/imports/ui/theme/assets/jss/material-dashboard-react/components/selectStyle.js";
import { decode } from "html-entities";
import { useForm } from "react-hook-form";
import CustomInput from "/imports/ui/components/CustomInput/CustomInput.js";

const useStyles = makeStyles(styles);
const useSelectStyles = makeStyles(selectComponents);

const clientGroupForm = (props) => {
  const classes = useStyles();
  const selectClass = useSelectStyles();

  const [clientsListReady, setClientsListReady] = React.useState(false);
  const [groupManagerListReady, setGroupManagerListReady] =
    React.useState(false);

  const { register, handleSubmit, errors } = useForm({
    defaultValues: {
      name: props.selectedGroupName ? props.selectedGroupName : "",
    },
  });
  const selectedClientsBefore = props.clients
    ? Object.keys(props.clients).map((k) => props.clients[k].value)
    : [];
  const [selectedClients, setSelectedClients] = React.useState(
    props.clients
      ? Object.keys(props.clients).map((k) => props.clients[k].value)
      : []
  );
  const [selectedGroupManagers, setselectedGroupManagers] = React.useState(
    props.managers ? props.managers : []
  );

  const [defaultClientsLimit, setDefaultClientsLimit] = React.useState(20);
  const [defaultGroupManagersLimit, setDefaultGroupManagersLimit] =
    React.useState(20);

  const [clientList, setClientsList] = React.useState([]);
  const [groupManagersList, setGroupManagersList] = React.useState([]);

  const [invalidNameMessage, setInvalidNameMessage] = React.useState(false);
  const [invalidClientMessage, setInvalidClientMessage] = React.useState("");
  const [invalidManagerMessage, setInvalidManagerMessage] = React.useState("");
  const [disableSubmit, setDisableSubmit] = React.useState(true);

  React.useEffect(() => {
    let unMounted = false;
    //Load clients list to dropdown
    Meteor.call(
      "clients.asyncDropdownOptions",
      defaultClientsLimit,
      { clientGroupId: null },
      function (error, result) {
        if (error) {
          console.error(error);
        } else {
          let cList = [];
          result.map((value) => {
            cList.push({ value: value._id, label: value.clientName });
          });
          let cpList = props.clients ? cList.concat(props.clients) : cList;
          setClientsList(cpList);
          setClientsListReady(true);
        }
      }
    );
    return () => (unMounted = true);
  }, [defaultClientsLimit]);
  React.useEffect(() => {
    let unMounted = false;
    //Load users list to dropdown
    Meteor.call(
      "users.usersByClientIds",
      selectedClients,
      defaultGroupManagersLimit,
      {},
      function (error, result) {
        if (error) {
          console.error(error);
        } else {
          let gMList = [];
          result.map((value) => {
            gMList.push({
              value: value._id,
              label: value.username,
              clientId: value.profile.clientId,
            });
          });

          setGroupManagersList(gMList);
          setGroupManagerListReady(true);
        }
      }
    );
    return () => (unMounted = true);
  }, [selectedClients, defaultGroupManagersLimit]);

  scrollClientListDropdown = () => {
    setClientsListReady(false);
    setDefaultClientsLimit(defaultClientsLimit + 20);
  };
  scrollGroupManagerList = () => {
    setGroupManagerListReady(false);
    setDefaultGroupManagersLimit(defaultGroupManagersLimit + 20);
  };

  // on submit form
  const onSubmit = (data) => {
    setInvalidNameMessage(false);
    setInvalidClientMessage("");
    setInvalidManagerMessage("");

    if (data.name.trim() == "") {
      setDisableSubmit(true);
      setInvalidNameMessage(true);
      return;
    }
    if (selectedClients.length < 2) {
      setDisableSubmit(true);
      setInvalidClientMessage("Select at least two clients to continue");
      return;
    }
    if (selectedGroupManagers.length < 1) {
      setDisableSubmit(true);
      setInvalidManagerMessage("Group manager's field should not be empty");
      return;
    }

    if (
      selectedGroupManagers.some((user) => {
        if (!selectedClients.includes(user.clientId)) {
          setDisableSubmit(true);
          setInvalidManagerMessage(
            `${user.label}'s client is not in the Client Group. `
          );
          return true;
        }
      })
    ) {
      return;
    }

    if (props.action == "CREATE") {
      setDisableSubmit(true);

      let groupManagersId = Object.keys(selectedGroupManagers).map(
        (k) => selectedGroupManagers[k].value
      );

      Meteor.call(
        "clientsGroup.create",
        {
          groupName: data.name.trim(),
          selectedClients,
          groupManagersId,
        },
        function (error, result) {
          if (error)
            swal("Error", "something went wrong when creating group", "error");
          if (result) {
            Meteor.call(
              "clientsGroup.setGroupIds",
              {
                selectedClients,
                groupId: result,
              },
              function (error, result) {
                if (error)
                  swal(
                    "Error",
                    "something went wrong when Adding groupID",
                    "error"
                  );
                if (result) {
                  swal("", "Client Group Created.", "success").then(() =>
                    props.closeDialog()
                  );
                }
              }
            );
          }
        }
      );
    }

    if (props.action == "AMEND") {
      setDisableSubmit(true);

      const shouldClientsUpdate =
        JSON.stringify(selectedClients) !==
        JSON.stringify(selectedClientsBefore);

      let groupManagersId = Object.keys(selectedGroupManagers).map(
        (k) => selectedGroupManagers[k].value
      );

      Meteor.call(
        "clientsGroup.update",
        props.selectedGroupId,
        {
          groupName: data.name.trim(),
          selectedClients,
          groupManagersId,
        },
        function (error, result) {
          if (error)
            swal("Error", "something went wrong when Updating group", "error");
          if (result && shouldClientsUpdate) {
            Meteor.call(
              "clientsGroup.unSetGroupIds",
              {
                clientIds: selectedClientsBefore,
              },
              function (error, result) {
                if (error)
                  swal(
                    "Error",
                    "something went wrong when Removing groupID",
                    "error"
                  );
                if (result) {
                  Meteor.call(
                    "clientsGroup.setGroupIds",
                    {
                      selectedClients,
                      groupId: props.selectedGroupId,
                    },
                    function (error, result) {
                      if (error)
                        swal(
                          "Error",
                          "something went wrong when Adding groupID",
                          "error"
                        );
                      if (result) {
                        swal("", "Client Group Modified.", "success").then(() =>
                          props.closeDialog()
                        );
                      }
                    }
                  );
                }
              }
            );
          } else {
            swal("", "Client Group Modified.", "success").then(() =>
              props.closeDialog()
            );
          }
        }
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <div className={classes.formLabel}>Client Group Name:</div>
        </GridItem>
        <GridItem xs={12} sm={12} md={12}>
          <CustomInput
            formControlProps={{}}
            inputProps={{
              name: "name",
              inputRef: register({ required: true }),
              placeholder:"  " + "Enter Group Name",
              onChange: () => setDisableSubmit(false),
            }}
          />
          {invalidNameMessage ? (
            <span className="text-danger">Invalid Client Group Name</span>
          ) : (
            ""
          )}
          {errors.name && errors.name.type === "required" && (
            <span className="text-danger">Group Name is Required</span>
          )}
        </GridItem>
        <GridItem xs={12} sm={12} md={12}>
          <div className={classes.formLabel}>Clients:</div>
        </GridItem>

        <GridItem xs={12} sm={12} md={12}>
          <AsyncSelect
            cacheOptions={false}
            placeholder={"Select clients to add to the group"}
            classNamePrefix="custom-async-select"
            className={selectClass.customAsyncSelectMainClass}
            isMulti={true}
            isClearable={true}
            isSearchable={true}
            menuPlacement="auto"
            maxMenuHeight={246}
            isLoading={!clientsListReady}
            defaultValue={props.clients ? props.clients : []}
            loadOptions={(inputValue, callback) => {
              if (inputValue !== "") {
                setClientsListReady(false);
                Meteor.call(
                  "clients.asyncDropdownOptions",
                  1000,
                  {
                    $and: [
                      { clientName: { $regex: inputValue, $options: "i" } },
                      { clientGroupId: null },
                    ],
                  },
                  function (error, result) {
                    if (error) {
                      console.error(error);
                    } else {
                      let cList = [];
                      result.map((value) => {
                        cList.push({
                          value: value._id,
                          label: value.clientName,
                        });
                      });
                      let cpList = props.clients
                        ? cList.concat(props.clients)
                        : cList;
                      callback(cpList.filter((i) => i));
                      setClientsListReady(true);
                    }
                  }
                );
              }
            }}
            onMenuScrollToBottom={() => this.scrollClientListDropdown()}
            defaultOptions={clientList}
            onChange={(selectedOption) => {
              setSelectedClients(
                Object.keys(selectedOption).map((k) => selectedOption[k].value)
              );

              setDisableSubmit(false);
            }}
            components={{
              NoOptionsMessage: () => decode("&nbsp&nbsp") + "No clients found",
            }}
          />

          {invalidClientMessage == "" ? (
            ""
          ) : (
            <span className="text-danger">{invalidClientMessage}</span>
          )}
        </GridItem>
        <GridItem xs={12} sm={12} md={6}>
          <div className={classes.formLabel}>Group Managers:</div>
        </GridItem>

        <GridItem xs={12} sm={12} md={12}>
          <AsyncSelect
            cacheOptions={false}
            placeholder={"Select Group Managers"}
            classNamePrefix="custom-async-select"
            className={selectClass.customAsyncSelectMainClass}
            isMulti={true}
            isClearable={true}
            isSearchable={selectedClients.length > 0}
            menuPlacement="auto"
            maxMenuHeight={172}
            isLoading={!groupManagerListReady}
            defaultValue={props.managers ? props.managers : []}
            loadOptions={(inputValue, callback) => {
              if (inputValue !== "") {
                setGroupManagerListReady(false);
                Meteor.call(
                  "users.usersByClientIds",
                  selectedClients,
                  1000,
                  { username: { $regex: inputValue, $options: "i" } },
                  function (error, result) {
                    if (error) {
                      console.error(error);
                    } else {
                      let gMList = [];
                      result.map((value) => {
                        gMList.push({
                          value: value._id,
                          label: value.username,
                          clientId: value.profile.clientId,
                        });
                      });

                      callback(gMList.filter((i) => i));
                      setGroupManagerListReady(true);
                    }
                  }
                );
              }
            }}
            onMenuScrollToBottom={() => this.scrollGroupManagerList()}
            defaultOptions={groupManagersList}
            onChange={(selectedOption) => {
              setselectedGroupManagers(selectedOption);
              setDisableSubmit(false);
            }}
            components={
              selectedClients.length > 0
                ? {
                    NoOptionsMessage: () =>
                      decode("&nbsp&nbsp") + "No users found",
                  }
                : {
                    DropdownIndicator: () => null,
                    IndicatorSeparator: () => null,
                    NoOptionsMessage: () =>
                      decode("&nbsp&nbsp") + "Select clients first",
                  }
            }
          />
          {invalidManagerMessage == "" ? (
            ""
          ) : (
            <span className="text-danger">{invalidManagerMessage}</span>
          )}
        </GridItem>
      </GridContainer>
      <GridItem>&nbsp;</GridItem>
      <Button
        color="info"
        disabled={disableSubmit}
        fullWidth={true}
        type="submit"
      >
        save
      </Button>
    </form>
  );
};

export default clientGroupForm;
