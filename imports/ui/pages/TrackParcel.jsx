import React from "react";
import GridItem from "/imports/ui/components/Grid/GridItem.js";
import GridContainer from "/imports/ui/components/Grid/GridContainer.js";
import ParcelProgress from "../components/progress/ParcelProgress.js";
import ParcelBoxView from "../components/ParcelBoxView/ParcelBoxView.js";
import Loader from "/imports/ui/components/Loader/Loader.js";

const TrackParcel = (props) => {
  const [parcelLogs, setParcelLogs] = React.useState([]);
  const [parcelStatus, setParcelStatus] = React.useState("");
  const [logReady, setLogReady] = React.useState(false);
  const [parcel, setParcel] = React.useState([]);
  const [parcelReady, setParcelReady] = React.useState(false);

  // component did mount
  React.useEffect(() => {
    let unMounted = false;
    Meteor.call(
      "parcels.getParcelDetails",
      props.parcelId,
      function (error, result) {
        if (error) {
          console.log(error);
        } else {
          setParcel(result);
          setParcelReady(true);
          Meteor.call(
            "parcels.getParcelLogs",
            props.parcelId,
            function (error, response) {
              if (error) {
                console.log(error);
              } else {
                if (response != undefined) {
                  setParcelLogs(response.track);
                  setParcelStatus(response.status);
                  setLogReady(true);
                } else {
                  Meteor.call(
                    "clients.dropdownOptions",
                    { _id: result.clientId },
                    function (err, res) {
                      if (err) {
                        console.log(error);
                      } else {
                        if (result.deliveredAt != undefined) {
                          let track = [
                            {
                              clientName: res[0].clientName,
                              time: result.createdAt,
                            },
                            {
                              clientName: res[0].clientName,
                              time: result.deliveredAt,
                            },
                          ];
                          setParcelLogs(track);
                          setParcelStatus("delivered");
                          setLogReady(true);
                        } else {
                          let track = [
                            {
                              clientName: res[0].clientName,
                              time: result.createdAt,
                            },
                          ];
                          setParcelLogs(track);
                          setParcelStatus("created");
                          setLogReady(true);
                        }
                      }
                    }
                  );
                }
              }
            }
          );
        }
      }
    );

    return () => (unMounted = true);
  }, []);

  return (
    <GridContainer>
      <GridItem xs={12} sm={12} md={5}>
        {logReady ? (
          <ParcelProgress parcelLogs={parcelLogs} parcelStatus={parcelStatus} />
        ) : (
          <Loader color="inherit" />
        )}
      </GridItem>
      <GridItem xs={12} sm={12} md={6}>
        {parcelReady ? (
          <ParcelBoxView parcel={parcel} />
        ) : (
          <Loader color="inherit" />
        )}
      </GridItem>
    </GridContainer>
  );
};

export default TrackParcel;
