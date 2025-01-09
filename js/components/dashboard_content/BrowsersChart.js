import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";

import DataLoader from "../../lib/data_loader";
import ChartBuilder from "../../lib/chart_helpers/chart_builder";
import Tooltip from "../tooltip/Tooltip";

/**
 * Retrieves the browser report from the passed data URL and creates a
 * visualization for the breakdown of browsers of users visiting sites for the
 * current agency.
 *
 * @param {object} props the properties for the component
 * @param {*} props.dataHrefBase the URL of the base location of the data
 * to be downloaded including the agency path. In production this is proxied and
 * redirected to the S3 bucket URL.
 * @returns {import('react').ReactElement} The rendered element
 */
function BrowsersChart({ dataHrefBase }) {
  const jsonDataURL = `${dataHrefBase}/browsers.json`;
  const csvDataURL = `${dataHrefBase}/browsers.csv`;
  const ref = useRef(null);
  const [browserData, setBrowserData] = useState(null);

  useEffect(() => {
    const initBrowsersChart = async () => {
      if (!browserData) {
        const data = await DataLoader.loadJSON(jsonDataURL);
        await setBrowserData(data);
      } else {
        const chartBuilder = new ChartBuilder();
        await chartBuilder.buildCompactBarChart(
          ref.current,
          browserData,
          "browser",
        );
      }
    };
    initBrowsersChart().catch(console.error);
  }, [browserData]);

  return (
    <>
      <div className="chart__title">
        <a href="/definitions#dimension_browser">
          <Tooltip
            position="top"
            content="The name of the web browser used by the user to access the site."
          >
            Web Browsers
          </Tooltip>
        </a>
        <a href={csvDataURL} aria-label="browsers.csv">
          <svg
            className="usa-icon margin-bottom-neg-05 margin-left-05"
            aria-hidden="true"
            focusable="false"
            role="img"
          >
            <use xlinkHref="/assets/uswds/img/sprite.svg#file_download"></use>
          </svg>
        </a>
      </div>
      <figure id="chart_browsers" ref={ref}>
        <div className="data chart__bar-chart text--capitalize margin-top-2"></div>
      </figure>
    </>
  );
}

BrowsersChart.propTypes = {
  dataHrefBase: PropTypes.string.isRequired,
};

export default BrowsersChart;
