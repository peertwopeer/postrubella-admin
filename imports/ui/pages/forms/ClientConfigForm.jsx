import React from "react";
import { withTracker } from "meteor/react-meteor-data";
import PropTypes from "prop-types";
import Helper from "/imports/ui/components/Helper.js";
import CustomInput from "/imports/ui/components/CustomInput/CustomInput.js";
import Button from "/imports/ui/components/CustomButtons/Button.js";
import GridItem from "/imports/ui/components/Grid/GridItem.js";
import GridContainer from "/imports/ui/components/Grid/GridContainer.js";
import Card from "/imports/ui/components/Card/Card.js";
import CardHeader from "/imports/ui/components/Card/CardHeader.js";
import CardFooter from "/imports/ui/components/Card/CardFooter.js";
import CardBody from "/imports/ui/components/Card/CardBody.js";
import Typography from "/imports/ui/components/Typography/Typography.js";
import Loader from "/imports/ui/components/Loader/Loader.js";
import { Box } from "@material-ui/core";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Switch from "@material-ui/core/Switch";
import { makeStyles } from "@material-ui/core/styles";
import { map } from "lodash";
import swal from "sweetalert";
import selectComponents from "/imports/ui/theme/assets/jss/material-dashboard-react/components/selectStyle.js";

const useSelectStyles = makeStyles(selectComponents);

const ClientConfigForm = (props) => {
  const selectClass = useSelectStyles();
  const [loading, setLoading] = React.useState(false);
  const [logo, setLogo] = React.useState("");
  const [currentLogo, setcurrentLogo] = React.useState(props.client.logo);
  const [recipientsFile, setRecipientsFile] = React.useState("");
  const recipientsFileRef = React.useRef();
  const [defaultDeliveryTpe, setDefaultDeliveryTpe] = React.useState(
    typeof props.client.deliveryType !== "undefined" &&
      props.client.deliveryType !== ""
      ? props.client.deliveryType
      : "Select delivery type"
  );
  const [defaultAssignAction, setDefaultAssignAction] = React.useState(
    typeof props.client.deliveryUser !== "undefined" &&
      props.client.deliveryUser !== ""
      ? props.client.deliveryUser
      : "Select assign action"
  );
  const [defaultReceivingAction, setDefaultReceivingAction] = React.useState(
    typeof props.client.receiveUser !== "undefined" &&
      props.client.receiveUser !== ""
      ? props.client.receiveUser
      : "Select assign action"
  );
  const [deliveryTypesList, setdeliveryTypesList] = React.useState([]);
  const deliveryUserList = [
    { value: "Collect from postrubella", label: "Collect from postrubella" },
    { value: "Collect from Concierge", label: "Collect from Concierge" },
    { value: "Reception", label: "Reception" },
    { value: "Security", label: "Security" },
    { value: "Delivery AM", label: "Delivery AM" },
    { value: "Delivery PM", label: "Delivery PM" },
    { value: "Delivered Today", label: "Delivered Today" },
  ];
  const [receiverUserList, setreceiverUserList] = React.useState([]);
  const [customEmail, setCustomEmail] = React.useState(
    typeof props.client.customEmail !== "undefined" &&
      props.client.customEmail == 1
      ? true
      : false
  );

  //Component did mount
  React.useEffect(() => {
    let unMounted = false;
    //Load deliveryTypes to dropdowns
    Meteor.call(
      "deliveryTypes.dropdownOptions",
      props.client._id,
      function (error, result) {
        if (error) {
          console.error(error);
        } else {
          let dList = [{ value: "Normal", label: "Normal" }];
          result.map((value) => {
            dList.push({ value: value._id, label: value.deliveryTypeName });
          });
          setdeliveryTypesList(dList);
        }
      }
    );
    //Load normal-users(role) to dropdowns
    Meteor.call(
      "users.dropdownOptions",
      props.client._id,
      { roles: "normal-user" },
      function (error, result) {
        if (error) {
          console.error(error);
        } else {
          let RUList = [];
          result.map((value) => {
            RUList.push({ value: value._id, label: value.username });
          });
          setreceiverUserList(RUList);
        }
      }
    );

    return () => (unMounted = true);
  }, []);

  logoOnChange = (event) => {
    var reader = new FileReader();
    var fileSize = event.target.files[0].size;
    var fileType = event.target.files[0].type;
    if (
      (fileType !== "image/png" && fileType !== "image/jpeg") ||
      fileSize > 1000000
    ) {
      swal(
        "",
        "The uploaded file is not valid \nplease follow the instructions",
        "error"
      );
      return;
    }
    if (reader.readAsDataURL) {
      reader.readAsDataURL(event.target.files[0]);
    } else if (reader.readAsDataurl) {
      readAsDataurl(event.target.files[0]);
    }
    reader.onload = function (event) {
      var image = new Image();
      image.src = event.target.result;
      image.onload = function () {
        // validate image dimension
        if (
          this.width < 300 &&
          this.height < 300 &&
          this.height > 100 &&
          this.width > 100
        ) {
          setLogo(reader.result);
        } else {
          swal(
            "",
            "The uploaded file is not valid \nplease follow the instructions",
            "error"
          );
          return;
        }
      };
    };
  };

  removeLogo = () => {
    setLoading(true);
    Meteor.call(
      "clients.removeLogo",
      props.client._id,
      function (error, result) {
        setLoading(false);
        if (error) {
          swal("", error.error, "error");
        } else {
          swal("Logo removed", "", "success");
          setcurrentLogo("");
        }
      }
    );
  };

  uploadLogo = async () => {
    if (logo == "" || typeof logo == "undefined") {
      swal("", "Please upload logo", "warning");
      return;
    }
    setLoading(true);
    Meteor.call(
      "clients.uploadLogo",
      props.client._id,
      logo,
      function (error, result) {
        setLoading(false);
        if (error) {
          swal("", error.error, "error");
        } else {
          swal("", "Logo uploaded", "success");
          setcurrentLogo(result);
        }
      }
    );
  };

  recipientsCsvOnChange = (event) => {
    var fileType = event.target.files[0].type;
    //validate input file
    if (fileType === "text/csv") {
      setRecipientsFile(event.target.files[0]);
    } else {
      swal(
        "",
        "The uploaded file is not valid \nplease follow the instructions",
        "error"
      );
    }
  };

  loadRecipientsData = () => {
    if (recipientsFile == "" || typeof recipientsFile == "undefined") {
      swal("", "Please upload recipinets CSV file", "warning");
      return;
    }
    Papa.parse(recipientsFile, {
      header: true,
      skipEmptyLines: true,
      complete(results, file) {
        Meteor.call(
          "clients.loadRecipientsData",
          props.client._id,
          results.data,
          function (error, result) {
            if (error) {
              swal("", error.error, "error");
            } else {
              setRecipientsFile("");
              recipientsFileRef.current.value = "";
              swal("", "Your Recipients data has been added", "success");
            }
          }
        );
      },
    });
  };

  loadDefaultCarriers = () => {
    setLoading(true);
    Meteor.call(
      "clients.loadDefaultCarriers",
      props.client._id,
      function (error, result) {
        if (error) {
          swal("", error.error, "error");
          setLoading(false);
        } else {
          swal("", "Data uploaded", "success");
          setLoading(false);
        }
      }
    );
  };

  loadDefaultDeliveryTypes = () => {
    setLoading(true);
    Meteor.call(
      "clients.loadDefaultDeliveryTypes",
      props.client._id,
      function (error, result) {
        if (error) {
          swal("", error.error, "error");
          setLoading(false);
        } else {
          swal("", "Data uploaded", "success");
          setLoading(false);
        }
      }
    );
  };

  updateDefaultValues = () => {
    let defaultValues = {};
    let customEmailValue = customEmail ? 1 : 0;
    if (
      typeof defaultDeliveryTpe == "undefined" ||
      defaultDeliveryTpe == null
    ) {
      swal("", "Please Set a default Delivery Type", "warning");
      return;
    }
    if (
      typeof defaultAssignAction == "undefined" ||
      defaultAssignAction == null
    ) {
      swal(
        "",
        "Please Set a default Assign Action for inbound parcels",
        "warning"
      );
      return;
    }
    if (
      typeof defaultReceivingAction == "undefined" ||
      defaultReceivingAction == null
    ) {
      swal(
        "",
        "Please Set a default Assign Action for outbound parcels",
        "warning"
      );
      return;
    }

    defaultValues.defaultDeliveryTpe =
      defaultDeliveryTpe == "Select delivery type" ? "" : defaultDeliveryTpe;
    defaultValues.defaultAssignAction =
      defaultAssignAction == "Select assign action" ? "" : defaultAssignAction;
    defaultValues.defaultReceivingAction =
      defaultReceivingAction == "Select assign action"
        ? ""
        : defaultReceivingAction;
    defaultValues.customEmail = customEmailValue;

    Meteor.call(
      "clients.updateDefaultValues",
      props.client._id,
      defaultValues,
      function (error, result) {
        if (error) {
          swal("", error.error, "error");
        } else {
          swal("", "Default values updated", "success");
        }
      }
    );
  };

  return (
    <div>
      {loading ? (
        <Loader color="primary" />
      ) : (
        <form>
          <GridContainer>
            <GridItem xs={12} sm={12} md={12}>
              <Card>
                <CardHeader color="primary">
                  <span>Upload / Remove Logo</span>
                </CardHeader>
                <CardBody>
                  <GridItem xs={12} sm={12} md={12}>
                    <Typography color="danger">
                      The height and width of the logo should be less than 300px
                      and greater than 100px, size less than 1MB and the
                      supported formats are png, jpg
                    </Typography>
                    {typeof currentLogo !== "undefined" &&
                    currentLogo !== "" ? (
                      <img src={currentLogo} />
                    ) : (
                      <CustomInput
                        formControlProps={{
                          fullWidth: true,
                        }}
                        inputProps={{
                          onChange: (e) => this.logoOnChange(e),
                          type: "file",
                        }}
                      />
                    )}
                  </GridItem>
                  <GridItem xs={12} sm={12} md={12}>
                    {typeof currentLogo !== "undefined" &&
                    currentLogo !== "" ? (
                      <Button
                        color="danger"
                        fullWidth={true}
                        onClick={this.removeLogo}
                      >
                        Remove Logo
                      </Button>
                    ) : (
                      <Button
                        color="info"
                        fullWidth={true}
                        onClick={this.uploadLogo}
                      >
                        Upload Logo
                      </Button>
                    )}
                  </GridItem>
                </CardBody>
              </Card>
            </GridItem>
            <GridItem xs={12} sm={12} md={12}>
              <Card>
                <CardHeader color="primary">
                  <span>
                    Load default Dataset to the client{" "}
                    {props.client.clientName !== "undefined"
                      ? props.client.clientName
                      : ""}
                  </span>
                </CardHeader>
                <CardBody>
                  <GridItem xs={12} sm={12} md={12}>
                    <Button
                      color="info"
                      fullWidth={true}
                      type="submit"
                      onClick={this.loadDefaultCarriers}
                    >
                      Add Default Carriers
                    </Button>{" "}
                  </GridItem>
                  <GridItem xs={12} sm={12} md={12}>
                    <Button
                      color="info"
                      fullWidth={true}
                      type="submit"
                      onClick={this.loadDefaultDeliveryTypes}
                    >
                      Add Default Delivery types
                    </Button>{" "}
                  </GridItem>
                  <GridItem xs={12} sm={12} md={12} mt={2}>
                    <Box mt={2}>
                      <b>Upload Recipients</b>
                      <Typography color="danger">
                        Only '.csv' extension files are allowed. The file must
                        contain a header column and the recipient name must not
                        be split into multiple columns.
                      </Typography>
                      <CustomInput
                        formControlProps={{
                          fullWidth: true,
                        }}
                        inputProps={{
                          onChange: (e) => this.recipientsCsvOnChange(e),
                          type: "file",
                          inputRef: recipientsFileRef,
                        }}
                      />
                      <Button
                        color="info"
                        fullWidth={true}
                        onClick={this.loadRecipientsData}
                      >
                        Upload Recipients
                      </Button>
                    </Box>
                  </GridItem>
                </CardBody>
              </Card>
            </GridItem>
            <GridItem xs={12} sm={12} md={12}>
              <Card>
                <CardHeader color="primary">
                  <span>
                    Set Default values for client{" "}
                    {props.client.clientName !== "undefined"
                      ? props.client.clientName
                      : ""}
                  </span>
                </CardHeader>
                <CardBody>
                  <Box p={2} pb={1} xs={12} sm={12} md={6}>
                    <GridContainer>
                      <GridItem xs={12} sm={12} md={6}>
                        <Typography color="primary" variant="h4">
                          Set a default Delivery Type
                        </Typography>
                      </GridItem>

                      <GridItem xs={12} sm={12} md={6}>
                        {
                          <Select
                            className={selectClass.customSelectMainClass}
                            value={defaultDeliveryTpe}
                            onChange={(event) =>
                              setDefaultDeliveryTpe(event.target.value)
                            }
                          >
                            <MenuItem
                              key={"Select delivery type"}
                              value={"Select delivery type"}
                            >
                              Select delivery type
                            </MenuItem>
                            {map(deliveryTypesList, (deliveryType) => (
                              <MenuItem
                                key={deliveryType.value}
                                value={deliveryType.label}
                              >
                                {deliveryType.label}
                              </MenuItem>
                            ))}
                          </Select>
                        }
                      </GridItem>
                      <GridItem xs={12} sm={12} md={6}>
                        <Typography color="primary" variant="h4">
                          Set a default Assign Action (Inbound)
                        </Typography>
                      </GridItem>
                      <GridItem xs={12} sm={12} md={6}>
                        {
                          <Select
                            className={selectClass.customSelectMainClass}
                            value={defaultAssignAction}
                            onChange={(event) =>
                              setDefaultAssignAction(event.target.value)
                            }
                          >
                            <MenuItem
                              key={"Select assign action"}
                              value={"Select assign action"}
                            >
                              Select assign action
                            </MenuItem>
                            {map(deliveryUserList, (deliveryUser) => (
                              <MenuItem
                                key={deliveryUser.value}
                                value={deliveryUser.label}
                              >
                                {deliveryUser.label}
                              </MenuItem>
                            ))}
                          </Select>
                        }
                      </GridItem>
                      <GridItem xs={12} sm={12} md={6}>
                        <Typography color="primary" variant="h4">
                          Set a default Receiving Action (Outbound)
                        </Typography>
                      </GridItem>
                      <GridItem xs={12} sm={12} md={6}>
                        {
                          <Select
                            className={selectClass.customSelectMainClass}
                            value={defaultReceivingAction}
                            onChange={(event) =>
                              setDefaultReceivingAction(event.target.value)
                            }
                            onOpen={(event) => {
                              Helper.emptyDropDownAlert(
                                receiverUserList.length,
                                "No users found for this client"
                              );
                            }}
                          >
                            <MenuItem
                              key={"Select receiving action"}
                              value={"Select receiving action"}
                            >
                              Select Receiving Action
                            </MenuItem>
                            {map(receiverUserList, (receiverUser) => (
                              <MenuItem
                                key={receiverUser.value}
                                value={receiverUser.label}
                              >
                                {receiverUser.label}
                              </MenuItem>
                            ))}
                          </Select>
                        }
                      </GridItem>
                      <GridItem xs={12} sm={12} md={6}>
                        <Typography color="primary" variant="h4">
                          Customize emails for the client?
                        </Typography>
                      </GridItem>
                      <GridItem xs={12} sm={12} md={6}>
                        <Switch
                          label="disabled"
                          onChange={() => setCustomEmail(!customEmail)}
                          checked={customEmail}
                        />
                      </GridItem>
                    </GridContainer>
                  </Box>
                  <GridItem xs={12} sm={12} md={12} mt={2}>
                    <Box mt={2}>
                      <Button
                        color="info"
                        fullWidth={true}
                        onClick={this.updateDefaultValues}
                      >
                        Update Default Values
                      </Button>
                    </Box>
                  </GridItem>
                </CardBody>
                <CardFooter>
                  <Button
                    color="primary"
                    fullWidth={true}
                    onClick={props.closeDialog}
                  >
                    Close
                  </Button>
                </CardFooter>
              </Card>
            </GridItem>
          </GridContainer>
        </form>
      )}
    </div>
  );
};

ClientConfigForm.propTypes = {
  client: PropTypes.object,
  closeDialog: PropTypes.func,
};

export default withTracker(() => {
  return {};
})(ClientConfigForm);
