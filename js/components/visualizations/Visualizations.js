import React from "react";
import PropTypes from "prop-types";

import TopPagesCircleGraph from "./TopPagesCircleGraph";

/**
 * Contains data visualizations intended to be for an entire page
 *
 * @param {object} props the properties for the component
 * @param {string} props.dataURL the URL of the base location of the data to be
 * displayed In production this is proxied and redirected to the S3 bucket URL
 * by NGINX.
 * @param {string} props.dataPrefix the path to add to the base URL to find data
 * for the current agency.
 * @param {string} props.agency the display name for the current agency.
 * @returns {import('react').ReactElement} The rendered element
 */
function Visualizations({ dataURL, dataPrefix, agency }) {
  const dataHrefBase = `${dataURL}/${dataPrefix}`;

  return (
    <>
      <div className="grid-row">
        <div className="grid-col-12">
          <h1 className="margin-top-0 text--semibold">
            {agency} Website and App Analytics
          </h1>
        </div>
      </div>
      <TopPagesCircleGraph dataHrefBase={dataHrefBase}></TopPagesCircleGraph>
    </>
  );
}

Visualizations.propTypes = {
  dataURL: PropTypes.string.isRequired,
  dataPrefix: PropTypes.string.isRequired,
  agency: PropTypes.string.isRequired,
};

export default Visualizations;
