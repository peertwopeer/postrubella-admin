import React, { useEffect, useState } from "react";
import { Meteor } from "meteor/meteor";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import moment from "moment";
import Button from "@material-ui/core/Button";
import GridItem from "/imports/ui/components/Grid/GridItem.js";
import GridContainer from "/imports/ui/components/Grid/GridContainer.js";
import Card from "/imports/ui/components/Card/Card.js";
import CardHeader from "/imports/ui/components/Card/CardHeader.js";
import CardBody from "/imports/ui/components/Card/CardBody.js";
import CustomInput from "/imports/ui/components/CustomInput/CustomInput.js";

var _ = require("lodash");

const useStyles = makeStyles((theme) => ({
  root: {
    "& > *": {
      margin: theme.spacing(3),
    },
  },
}));
const pageLimit = 10;

const outBoundemailLogs = () => {
  const classes = useStyles();

  const [totalPages, setTotalPages] = useState(1);
  const [offset, setOffset] = useState(0);
  const [emailLogs, SetEmailLogs] = useState([]);
  const [logsReady, setLogsReady] = useState(false);
  const [searchParams, setSearchParams] = useState({});

  // component did update
  useEffect(() => {
    let unMounted = false;
    setLogsReady(true);
    Meteor.call(
      "outboundEmailLogs.list",
      searchParams,
      pageLimit,
      offset,
      function (error, result) {
        if (error) {
          console.error(error);
        } else {
          if (offset != 0) {
            SetEmailLogs(_.union(result.result, emailLogs));
          } else {
            SetEmailLogs(result.result);
          }
          setTotalPages(result.total);
          setLogsReady(false);
        }
      }
    );
  }, [offset, searchParams]);

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
    setOffset(0);
    setSearchParams(cleanParams);
  };

  return (
    <div>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <Card>
            <CardHeader color="primary">
              <h4>Outbound Emails</h4>
              <p></p>
            </CardHeader>
            <CardBody>
              <GridContainer>
                <GridItem xs={4}>
                  {/* search field */}
                  <CustomInput
                    formControlProps={{}}
                    inputProps={{
                      placeholder: "Search by email address",
                      inputProps: {
                        "aria-label": "Search",

                        onChange: (e) => {
                          setSearchQuery("to", e.target.value);
                        },
                      },
                    }}
                  />
                </GridItem>
              </GridContainer>
              {emailLogs.map((log) => (
                <div key={log._id} className={classes.root}>
                  <Paper elevation={10}>
                    <div className="block">
                      <div className="block-title medium">
                        <b>To:</b> {log.to}
                      </div>
                      <div className="block-title medium">
                        <b>Subject:</b> {log.subject}
                      </div>
                      <div className="block-title medium">
                        <b>Body:</b>
                      </div>
                      <div dangerouslySetInnerHTML={{ __html: log.body }} />
                    </div>
                    <div className="block-status"></div>
                    <div className="block-meta">
                      <div className="inside">
                        <div className="block-meta-text">
                          <div className="block-row">
                            <b>Created At: </b>
                            {moment(log.createdAt).format("DD MMMM  YYYY")}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Paper>
                </div>
              ))}
            </CardBody>
          </Card>
        </GridItem>
      </GridContainer>
      <div align="center">
        {totalPages !== emailLogs.length && (
          <Button onClick={() => setOffset(offset + 10)} variant="contained">
            {logsReady ? "Loading..." : "Load More"}
          </Button>
        )}
      </div>
    </div>
  );
};
export default outBoundemailLogs;
