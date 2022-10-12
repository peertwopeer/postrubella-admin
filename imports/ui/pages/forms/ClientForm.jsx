import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { map } from 'lodash';
import { useForm } from 'react-hook-form';
import PropTypes from "prop-types";
import Select from '@material-ui/core/Select';
import AsyncSelect from 'react-select/async';
import MenuItem from '@material-ui/core/MenuItem';
import { makeStyles } from "@material-ui/core/styles";
import CustomInput from "/imports/ui/components/CustomInput/CustomInput.js";
import Button from "/imports/ui/components/CustomButtons/Button.js";
import GridItem from "/imports/ui/components/Grid/GridItem.js";
import GridContainer from "/imports/ui/components/Grid/GridContainer.js";
import swal from 'sweetalert';
import styles from "/imports/ui/theme/assets/jss/material-dashboard-react/components/formStyle.js";
import selectComponents from "/imports/ui/theme/assets/jss/material-dashboard-react/components/selectStyle.js";

const useStyles = makeStyles(styles);
const useSelectStyles = makeStyles(selectComponents);


const ClientForm = props => {

  const classes = useStyles();
  const selectClass = useSelectStyles();
  const { register, handleSubmit, errors } = useForm({defaultValues:{
    clientName: (props.action=="AMEND") ? props.client.clientName : "",
    clientEmail: (props.action=="AMEND") ? props.client.clientEmail : "",
    clientBarcodeId: (props.action=="AMEND") ? props.client.clientBarcodeId : ""
  }});

  let optTimzArray = [];
  if(Array.isArray(props.client.optionalTimeZones)){
    optTimzArray = props.client.optionalTimeZones.map((value)=>({value:value.value,label:value.value}))
  }
  const [optionalTimeZones, setOptionalTimeZones] = React.useState(optTimzArray);
  const [optionalLanguages, setOptionalLanguages] = React.useState(Array.isArray(props.client.optionalLanguages)? props.client.optionalLanguages.map((value)=>(value.value)) :[]);
  const [defaultTimeZone, setDefaultTimeZone] = React.useState((typeof props.client.defaultTimeZone !== "undefined")? {value:props.client.defaultTimeZone,label:props.client.defaultTimeZone} :"");
  const [defaultLanguage, setDefaultLanguage] = React.useState((typeof props.client.defaultLanguage !== "undefined")? props.client.defaultLanguage :"");
  const availableLanguages = [{value:"en",label:"English"},{value:"de",label:"German"},{value:"en-JM",label:"Jamican"}];
  const [defaultTimeZoneLimit,setDefaultTimeZoneLimit] = React.useState(50);
  const [optionalTimeZonelimit,setOptionalTimeZonelimit] = React.useState(50);
  const [timezonesList,setTimezonesList] = React.useState([]);
  const [timezonesListReady,setTimezonesListReady] = React.useState(false);
  const [timezonesListOptional,setTimezonesListOptional] = React.useState([]);
  const [timezonesListOptionalReady,setTimezonesListOptionalReady] = React.useState(false);
  const [isOptLangSelectorOpen,setIsOptLangSelectorOpen] = React.useState(false);
  const [error, setError] = React.useState({});



  //Load timezones list to default timezone dropdown
  React.useEffect(() => {
    let unMounted = false;
    Meteor.call('timeZones.dropdownOptions',defaultTimeZoneLimit,{},function (error,result) {
      if(error) {
        console.error(error);
      }else{
        let tList = [];
        result.map((value) => { 
          tList.push({value:value.zone,label:value.zone}) 
        } );
        setTimezonesList(tList);
        setTimezonesListReady(true);
      }
    });
    return () => unMounted = true ;
  },[defaultTimeZoneLimit]);

  //Load timezones list to optional timezone dropdown
  React.useEffect(() => {
    let unMounted = false;
    Meteor.call('timeZones.dropdownOptions',optionalTimeZonelimit,{},function (error,result) {
      if(error) {
        console.error(error);
      }else{
        let tList = [];
        result.map((value) => { 
          tList.push({value:value.zone,label:value.zone}) 
        } );
        setTimezonesListOptional(tList);
        setTimezonesListOptionalReady(true);
      }
    });
    return () => unMounted = true ;
  },[optionalTimeZonelimit]);


  scrollDefaultTimezoneDropdown = ()=>{
    setTimezonesListReady(false);
    setDefaultTimeZoneLimit(defaultTimeZoneLimit+20);   
  }

  scrollOptionalTimezoneDropdown = ()=>{
    setTimezonesListOptionalReady(false);
    setOptionalTimeZonelimit(optionalTimeZonelimit+20);   
  }

 
  // on submit form
  const onSubmit = (data) => {

    // validations
    setError({});
    let emailCheck =
      /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
    if (!emailCheck.test(data.clientEmail)) {
      setError({ clientEmail: "Invalid email address" });
      return;
    }
    if(defaultLanguage == ''){
      swal('', "Default language should not be empty", 'warning');
      return;
    }
    if((typeof optionalLanguages !== 'undefined')&&(optionalLanguages.length < 1)){
      swal('', "Optional languages should not be empty", 'warning');
      return;
    }
    if(defaultTimeZone.value == null){
      swal('', "Default timezone should not be empty", 'warning');
      return;
    }
    if((typeof optionalTimeZones !== 'undefined')&&(optionalTimeZones.length < 1)){
      swal('', "Optional timezones should not be empty", 'warning');
      return;
    }

    if(props.action == "CREATE"){
      let optTimezones = optionalTimeZones.map((value) => ({"value":value.value,"label":value.label}));
      let optLanguages = optionalLanguages.map((value) => ({"value":value,"label":value}));
      optLanguages.map((val,key)=>{
        availableLanguages.map((lang)=> { if(lang.value == val.value){
          optLanguages[key].label = lang.label;
        }})
      })
      Meteor.call('clients.create',{
        "clientName":data.clientName,
        "clientEmail":data.clientEmail,
        "clientBarcodeId":data.clientBarcodeId,
        "defaultLanguage":defaultLanguage,
        "defaultTimeZone":defaultTimeZone.value.value,
        "optionalTimeZones":optTimezones,
        "optionalLanguages":optLanguages
      },function(Error,result){
        if(Error) {
          if (Error.message.includes("email id already exists")) {
            setError({ clientEmail: "Email already exists" });
            return;
          } else {
            swal('', Error.message, 'error');
          }
        }else{
          swal('', "Client added.", 'success');
          props.closeDialog();
        }
      });
    }

    if(props.action == "AMEND"){
      let optTimezones = optionalTimeZones.map((value) => ({"value":value.value,"label":value.label}));
      let optLanguages = optionalLanguages.map((value) => ({"value":value,"label":value}));
      optLanguages.map((val,key)=>{
        availableLanguages.map((lang)=> { if(lang.value == val.value){
          optLanguages[key].label = lang.label;
        }})
      })
      Meteor.call('clients.update',props.client._id,{
        "clientName":data.clientName,
        "clientEmail":data.clientEmail,
        "clientBarcodeId":data.clientBarcodeId,
        "defaultLanguage":defaultLanguage,
        "defaultTimeZone":defaultTimeZone.value.value,
        "optionalTimeZones":optTimezones,
        "optionalLanguages":optLanguages
      },function(Error,result){
        if(Error) {
          if (Error.message.includes("Email id already exists")) {
            setError({ clientEmail: "Email already exists" });
            return;
          }else {
            swal('', Error.message, 'error');
          }
        }else{
          swal('', "Client updated", 'success');
          props.closeDialog();
        }
      });
    }
  };

  return(<form onSubmit={handleSubmit(onSubmit)}>
    <GridContainer>
    <GridItem xs={12} sm={12} md={6}><div className={classes.formLabel}>Client Name: </div></GridItem>
      <GridItem xs={12} sm={12} md={6}>
       <CustomInput formControlProps={{}} inputProps={{name:"clientName",inputRef:register({ required: true }),placeholder: "Client Name"}} />
      {errors.clientName && errors.clientName.type === "required" && (
        <span role="alert" >Name is required</span>
      )}
      </GridItem>
      <GridItem xs={12} sm={12} md={6}><div className={classes.formLabel}>Client Email: </div></GridItem>
      <GridItem xs={12} sm={12} md={6}>
        <CustomInput
          formControlProps={{}}
          inputProps={{
            name: "clientEmail",
            inputRef: register({ required: true }),
            placeholder: "Client Email",
          }}
        />
        {errors.clientEmail && errors.clientEmail.type === "required" && (
          <span role="alert">Email is required</span>
        )}
        {!errors.clientEmail && error.clientEmail != undefined && (
          <span role="alert" className="invalid-alert">
            * {error.clientEmail}
          </span>)}
      </GridItem>
      <GridItem xs={12} sm={12} md={6}><div className={classes.formLabel}>Client Barcode ID: </div></GridItem>
      <GridItem xs={12} sm={12} md={6}>
       <CustomInput formControlProps={{}} inputProps={{name:"clientBarcodeId",inputRef:register({ required: true }),placeholder: "Client Barcode ID"}} />
       {errors.clientBarcodeId && errors.clientBarcodeId.type === "required" && (
        <span role="alert" >Client Barcode ID is required</span>
        )}
      </GridItem>
      <GridItem xs={12} sm={12} md={6}><div className={classes.formLabel}>Default Language</div></GridItem>
      <GridItem xs={12} sm={12} md={6}>
            <Select className={selectClass.customSelectMainClass} value={defaultLanguage} onChange={(event)=> setDefaultLanguage(event.target.value)} >
                { 
                  map(availableLanguages,(value => (
                    <MenuItem key={value.value} value={value.value}>{value.label}</MenuItem>
                  )))
                }
            </Select>
      </GridItem>
      <GridItem xs={12} sm={12} md={6}><div className={classes.formLabel}>Optional Languages</div></GridItem>
      <GridItem xs={12} sm={12} md={6}>
      { (<Select className={selectClass.customSelectMainClass} value={optionalLanguages} open={isOptLangSelectorOpen} onClick={ (event) => setIsOptLangSelectorOpen(!isOptLangSelectorOpen) } onChange={(event)=> setOptionalLanguages(event.target.value) } multiple >
         { 
          map(availableLanguages,(value => (
            <MenuItem key={value.value} value={value.value}>{value.label}</MenuItem>
          )))
         }
        </Select>)  }
      </GridItem>
      <GridItem xs={12} sm={12} md={6}><div className={classes.formLabel}>Default Timezone</div></GridItem>
      <GridItem xs={12} sm={12} md={6}>
        <AsyncSelect
               cacheOptions={false}
               placeholder={ "Choose Default Timezone" }
               classNamePrefix="custom-async-select"
               className={selectClass.customAsyncSelectMainClass}
               isClearable={true}
               isSearchable ={true}
               isLoading = {!timezonesListReady}
               defaultValue={ defaultTimeZone }
               loadOptions={(inputValue,callback) => {
                if(inputValue !== ""){
                  setTimezonesListReady(false);
                  Meteor.call('timeZones.dropdownOptions',1000,{"zone":{$regex: inputValue,$options:"i"}},function (error,result) {
                    if(error) {
                      console.error(error);
                    }else{
                      let tList = [];
                      result.map((value) => { 
                        tList.push({value:value.zone,label:value.zone}) 
                      } );
                      callback(tList.filter( i => i ))
                      setTimezonesListReady(true);
                    }
                  });
                }
               }}
               onMenuScrollToBottom={ () => { this.scrollDefaultTimezoneDropdown(); } }
               defaultOptions={timezonesList}
               onChange={(selectedOption)=> setDefaultTimeZone({value:selectedOption,label:selectedOption})}
               />
      </GridItem>
      <GridItem xs={12} sm={12} md={6}><div className={classes.formLabel}>Optional Timezones</div></GridItem>
      <GridItem xs={12} sm={12} md={6}>
        <AsyncSelect
               cacheOptions={false}
               placeholder={ "Choose Optional Timezones" }
               classNamePrefix="custom-async-select"
               className={selectClass.customAsyncSelectMainClass}
               isMulti = {true}
               isClearable={true}
               isSearchable ={true}
               isLoading = {!timezonesListOptionalReady}
               defaultValue={ optionalTimeZones }
               loadOptions={(inputValue,callback) => {
                if(inputValue !== ""){
                  setTimezonesListOptionalReady(false);
                  Meteor.call('timeZones.dropdownOptions',1000,{"zone":{$regex: inputValue,$options:"i"}},function (error,result) {
                    if(error) {
                      console.error(error);
                    }else{
                      let tList = [];
                      result.map((value) => { 
                        tList.push({value:value.zone,label:value.zone}) 
                      } );
                      callback(tList.filter( i => i ))
                      setTimezonesListOptionalReady(true);
                    }
                  });
                }
               }}
               onMenuScrollToBottom={ () => this.scrollOptionalTimezoneDropdown() }
               defaultOptions={timezonesListOptional}
               onChange={(selectedOption)=> setOptionalTimeZones(selectedOption)}
               />
         
      </GridItem>
    </GridContainer>
      <Button color="info" fullWidth={true} type="submit" >save</Button>
  </form>)
}

ClientForm.propTypes = {
    client: PropTypes.object,
    action: PropTypes.oneOf(["CREATE","AMEND"]),
    closeDialog: PropTypes.func
  };

export default withTracker(() => {
    return {};
    })(ClientForm);
