import React from "react";
import { withTracker } from "meteor/react-meteor-data";
import { map } from "lodash";
import { useForm } from "react-hook-form";
import PropTypes from "prop-types";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import { makeStyles } from "@material-ui/core/styles";
import CustomInput from "/imports/ui/components/CustomInput/CustomInput.js";
import Button from "/imports/ui/components/CustomButtons/Button.js";
import GridItem from "/imports/ui/components/Grid/GridItem.js";
import swal from "sweetalert";
import GridContainer from "/imports/ui/components/Grid/GridContainer.js";
import styles from "/imports/ui/theme/assets/jss/material-dashboard-react/components/formStyle.js";
import selectComponents from "/imports/ui/theme/assets/jss/material-dashboard-react/components/selectStyle.js";

const useStyles = makeStyles(styles);
const useSelectStyles = makeStyles(selectComponents);

const UserForm = (props) => {
  const classes = useStyles();
  const selectClass = useSelectStyles();
  const { register, handleSubmit, errors } = useForm({
    defaultValues: {
      username: props.action == "AMEND" ? props.user.username : "",
      email: props.action == "AMEND" ? props.user.emails[0].address : "",
      firstname: props.action == "AMEND" ? props.user.profile.firstname : "",
      lastname: props.action == "AMEND" ? props.user.profile.lastname : "",
      password: "",
    },
  });
  const [role, setRole] = React.useState(
    props.action == "AMEND"
      ? Array.isArray(props.user.roles)
        ? props.user.roles[0]
        : props.user.roles
      : "normal-user"
  );
  const [clientId, setClientId] = React.useState(
    props.action == "AMEND" ? props.user.profile.clientId : ""
  );
  const [clientsList, setClientsList] = React.useState([]);
  const [clientsListReady, setClientsListReady] = React.useState(false);
  const [error, setError] = React.useState({});
  const [enableSubmitButton, setEnableSubmitButton] = React.useState(true);
  const availableRoles = [
    "normal-user",
    "client-manager",
    "location-manager",
    "super-admin",
    "group-admin",
  ];

  // component did mount
  React.useEffect(() => {
    let unMounted = false;
    //Load clients list to dropdown
    Meteor.call("clients.dropdownOptions", {}, function (Error, result) {
      if (Error) {
        console.error(Error);
      } else {
        let cList = [];
        result.map((value) => {
          cList.push({ clientId: value._id, clientName: value.clientName });
        });
        if (props.selectedClient) {
          setClientId(props.selectedClient);
        } else {
          setClientId(result[0].clientId);
        }
        setClientsList(cList);
        setClientsListReady(true);
      }
    });
    return () => (unMounted = true);
  }, []);
  // on submit form
  const onSubmit = (data) => {
    setError({});
    setEnableSubmitButton(false);
    let emailCheck =
      /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
    if (!emailCheck.test(data.email)) {
      setEnableSubmitButton(true);
      setError({ email: "Invalid email address" });
      return;
    }
    let passwordCheck =
      /^(?=\S*[a-z])(?=\S*[A-Z])(?=\S*\d)(?=\S*[^\w\s])\S{6,}$/;
    if (data.password !== "" && !passwordCheck.test(data.password)) {
      setEnableSubmitButton(true);
      setError({ password: "invalid" });
      return;
    }
    if (clientId == undefined || clientId == 0) {
      setEnableSubmitButton(true);
      setError({ clientId: "invalid" });
      return;
    }
    if (props.action == "CREATE") {
      Meteor.call(
        "users.create",
        {
          username: data.username.replace(/\s+/g, "").toLowerCase().trim(),
          email: data.email.replace(/\s+/g, "").toLowerCase().trim(),
          password: data.password,
          profile: {
            firstname: data.firstname,
            lastname: data.lastname,
            clientId: clientId,
          },
        },
        function (Error, result) {
          if (Error) {
            setEnableSubmitButton(true);
            if (Error.message.includes("Username already exists")) {
              setError({ username: "username already exists" });
              return;
            } else if (Error.message.includes("Email already exists")) {
              setError({ email: "Email already exists" });
              return;
            } else {
              swal("", Error.message, "error");
              return;
            }
          } else {
            Meteor.call("users.addToRoles", result, role);
            Meteor.call("users.verifyEmail", result);
            Meteor.call("users.sendRegistrationEmail", result, data.password);
            swal("", "User added.", "success");
            props.closeDialog();
          }
        }
      );
    }

    if (props.action == "AMEND") {
      Meteor.call(
        "users.update",
        props.user._id,
        {
          username: data.username.replace(/\s+/g, "").toLowerCase().trim(),
          email: data.email.replace(/\s+/g, "").toLowerCase().trim(),
          password: data.password,
          profile: {
            firstname: data.firstname,
            lastname: data.lastname,
            clientId: clientId,
          },
          roles: role,
        },
        function (Error, result) {
          if (Error) {
            setEnableSubmitButton(true);
            if (Error.message.includes("username already exists")) {
              setError({ username: "username already exists" });
              return;
            } else if (Error.message.includes("Email id already exists")) {
              setError({ email: "Email already exists" });
              return;
            } else {
              swal("", Error.message, "error");
              return;
            }
          } else {
            swal("", "User updated.", "success");
            props.closeDialog();
          }
        }
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <GridContainer>
        <GridItem xs={12} sm={12} md={6}>
          <div className={classes.formLabel}>Username:</div>
        </GridItem>
        <GridItem xs={12} sm={12} md={6}>
          <CustomInput
            formControlProps={{}}
            inputProps={{
              name: "username",
              inputRef: register({ required: true }),
              placeholder: "Username",
            }}
          />
          {errors.username && errors.username.type === "required" && (
            <span role="alert">Username is required</span>
          )}
          {!errors.username && error.username != undefined && (
            <span role="alert" className="invalid-alert">
              * {error.username}
            </span>
          )}
        </GridItem>
        <GridItem xs={12} sm={12} md={6}>
          <div className={classes.formLabel}>Email:</div>{" "}
        </GridItem>
        <GridItem xs={12} sm={12} md={6}>
          <CustomInput
            formControlProps={{}}
            inputProps={{
              name: "email",
              inputRef: register({ required: true }),
              placeholder: "Email",
            }}
          />
          {errors.email && errors.email.type === "required" && (
            <span role="alert">Email is required</span>
          )}
          {!errors.email && error.email != undefined && (
            <span role="alert" className="invalid-alert">
              * {error.email}
            </span>
          )}
        </GridItem>
        <GridItem xs={12} sm={12} md={6}>
          <div className={classes.formLabel}>First Name</div>
        </GridItem>
        <GridItem xs={12} sm={12} md={6}>
          <CustomInput
            formControlProps={{}}
            inputProps={{
              name: "firstname",
              inputRef: register({ required: true }),
              placeholder: "Firstname",
            }}
          />
          {errors.firstname && errors.firstname.type === "required" && (
            <span role="alert">Firstname is required</span>
          )}
        </GridItem>
        <GridItem xs={12} sm={12} md={6}>
          <div className={classes.formLabel}>Last Name</div>
        </GridItem>
        <GridItem xs={12} sm={12} md={6}>
          <CustomInput
            formControlProps={{}}
            inputProps={{
              name: "lastname",
              inputRef: register({}),
              placeholder: "Lastname",
            }}
          />
        </GridItem>
        <GridItem xs={12} sm={12} md={6}>
          <div className={classes.formLabel}>Password</div>
        </GridItem>
        <GridItem xs={12} sm={12} md={6}>
          <CustomInput
            formControlProps={{}}
            inputProps={{
              name: "password",
              inputRef: register({
                required: props.action == "CREATE" ? true : false,
              }),
              placeholder: "Password",
              type: "password",
            }}
          />
          {errors.password && errors.password.type === "required" && (
            <span role="alert">Password is required</span>
          )}
          {!errors.password && error.password == "invalid" && (
            <span role="alert" className="invalid-alert">
              Password must be at least six characters long, at least one
              uppercase letter, one lowercase letter, one number, and one
              special character.
            </span>
          )}
        </GridItem>
        <GridItem xs={12} sm={12} md={6}>
          <div className={classes.formLabel}>Role</div>
        </GridItem>
        <GridItem xs={12} sm={12} md={6}>
          <Select
            className={selectClass.customSelectMainClass}
            value={role}
            defaultValue=""
            onChange={(event) => setRole(event.target.value)}
          >
            {map(availableRoles, (value) => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </GridItem>
        <GridItem xs={12} sm={12} md={6}>
          <div className={classes.formLabel}>Client</div>
        </GridItem>
        <GridItem xs={12} sm={12} md={6}>
          {clientsListReady ? (
            <Select
              className={
                (error.clientId == "invalid" && clientId == undefined) ||
                clientId == 0
                  ? selectClass.customSelectErrorClass
                  : selectClass.customSelectMainClass
              }
              value={clientId}
              defaultValue={000}
              onChange={(event) => setClientId(event.target.value)}
            >
              <MenuItem value={000}>Choose Client</MenuItem>
              {map(clientsList, (value) => (
                <MenuItem key={value.clientId} value={value.clientId}>
                  {value.clientName}
                </MenuItem>
              ))}
            </Select>
          ) : (
            <div className={classes.formLabel}>Loading...</div>
          )}
        </GridItem>
      </GridContainer>
      <Button
        color="info"
        disabled={!enableSubmitButton}
        fullWidth={true}
        type="submit"
      >
        save
      </Button>
    </form>
  );
};

UserForm.propTypes = {
  user: PropTypes.object,
  action: PropTypes.oneOf(["CREATE", "AMEND"]),
  closeDialog: PropTypes.func,
};

export default withTracker(() => {
  return {};
})(UserForm);
