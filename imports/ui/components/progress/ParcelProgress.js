import React, { Fragment } from "react";
import PropTypes from "prop-types";
import moment from "moment-timezone";
import Card from "/imports/ui/components/Card/Card.js";
import CardBody from "/imports/ui/components/Card/CardBody.js";
import CardHeader from "/imports/ui/components/Card/CardHeader.js";

export default function ParcelProgress(props) {
  return (
    <div className="parcel-progress-container">
      <div>
        <svg
          width="16"
          height={props.parcelLogs?.length * 174}
          focusable="false"
          aria-hidden="true"
          className="parcel-progress-svg"
        >
          <g>
            <g transform="translate(8, 48)">
              {props.parcelLogs?.map((_, index, arr) => {
                if (index == 0) {
                  let pathDistance = `M0,0 L0,${arr.length * 174}`;
                  return (
                    <Fragment key={index}>
                      <path
                        d={pathDistance}
                        className="parcel-progress-path"
                      ></path>

                      <circle
                        cx="0"
                        cy="40"
                        className="parcel-progress-circle"
                      ></circle>
                    </Fragment>
                  );
                } else {
                  return (
                    <circle
                      key={index}
                      cx="0"
                      cy={40 + index * 180}
                      className="parcel-progress-circle"
                    ></circle>
                  );
                }
              })}
            </g>
          </g>
        </svg>
      </div>

      <div>
        <table className="parcel-progress-tabel">
          <tbody>
            {props.parcelLogs?.map((value, index, array) => {
              return (
                <tr key={index}>
                  <td className="parcel-progress-tabel-data">
                    <Card chart>
                      <CardHeader color="success">
                        {index + 1 === array.length
                          ? props.parcelStatus
                          : index == 0
                          ? "created"
                          : "sorted"}
                        <label className="parcel-progress-label"></label>
                      </CardHeader>
                      <CardBody>
                        <div>
                          {moment(value.time).format("Do MMMM YYYY, h:mm A")}
                        </div>
                        <div>
                          <strong>{value.clientName}</strong>
                        </div>
                      </CardBody>
                    </Card>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
ParcelProgress.propTypes = {
  parcelStatus: PropTypes.string,
  parcelLogs: PropTypes.array,
};
