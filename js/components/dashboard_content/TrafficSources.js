import React from "react";
import PropTypes from "prop-types";

import ConsolidatedBarChart from "../chart/ConsolidatedBarChart";
import Tooltip from "../tooltip/Tooltip";

/**
 * Contains charts and other data visualizations for the traffic sources
 * section of the site. This component is mainly laying out the structure for
 * the section and passes props necessary for getting data and displaying
 * visualizations to child components.
 *
 * @param {object} props the properties for the component
 * @param {string} props.dataHrefBase the URL of the base location of the data
 * to be downloaded including the agency path. In production this is proxied and
 * redirected to the S3 bucket URL.
 * @returns {import('react').ReactElement} The rendered element
 */
function TrafficSources({ dataHrefBase }) {
  return (
    <div className="padding-top-1 grid-row">
      <div
        id="session_channel_groups"
        className="desktop:grid-col-6 desktop:padding-right-2"
      >
        <div className="chart__title">
          <a href="/definitions#dimension_default_channel_group">
            <Tooltip
              position="top"
              content="Channel groupings are rule-based definitions of your traffic sources."
            >
              Top Channels
            </Tooltip>
          </a>
          <a
            href={`${dataHrefBase}/top-session-channel-group-30-days.json`}
            aria-label="top-session-channel-group-30-days.csv"
          >
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
        <div className="text--capitalize">
          <ConsolidatedBarChart
            dataUrl={`${dataHrefBase}/top-session-channel-group-30-days.json`}
            chartDataKey={"session_default_channel_group"}
            maxItems={10}
          />
        </div>
      </div>

      <div
        id="session_source_mediums"
        className="desktop:grid-col-6 desktop:padding-left-2"
      >
        <div className="chart__title">
          <a href="/definitions#dimension_source_medium">
            <Tooltip
              position="top"
              content="A source is a representation of the publisher or inventory source from which traffic originated. A medium is a method for acquiring users to websites or applications."
            >
              Top Sources/Media
            </Tooltip>
          </a>
          <a
            href={`${dataHrefBase}/top-session-source-medium-30-days.json`}
            aria-label="top-session-source-medium-30-days.csv"
          >
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
        <div className="text--capitalize">
          <ConsolidatedBarChart
            dataUrl={`${dataHrefBase}/top-session-source-medium-30-days.json`}
            chartDataKey={"session_source_medium"}
            maxItems={10}
          />
        </div>
      </div>
    </div>
  );
}

TrafficSources.propTypes = {
  dataHrefBase: PropTypes.string.isRequired,
};

export default TrafficSources;
