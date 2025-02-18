import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";

import ChartBuilder from "../../lib/chart_helpers/chart_builder";
import DataLoader from "../../lib/data_loader";
import formatters from "../../lib/chart_helpers/formatters";
import Tooltip from "../tooltip/Tooltip";

/**
 * Retrieves the engagement duration report from the passed data URL and creates
 * a visualization for the average engagement duration of users for the
 * current agency. The average duration is calculated by taking the total user
 * engagement duration and dividing by the number of visits.
 *
 * @param {object} props the properties for the component
 * @param {string} props.dataHrefBase the URL of the base location of the data
 * to be downloaded including the agency path. In production this is proxied and
 * redirected to the S3 bucket URL.
 * @returns {import('react').ReactElement} The rendered element
 */
function AverageEngagementDuration({ dataHrefBase }) {
  const jsonDataURL = `${dataHrefBase}/engagement-duration-30-days.json`;
  const ref = useRef(null);
  const [engagementDurationData, setEngagementDurationData] = useState(null);

  useEffect(() => {
    const initEngagementDurationsChart = async () => {
      if (!engagementDurationData) {
        const data = await DataLoader.loadDailyReportJSON(jsonDataURL);
        await setEngagementDurationData(data);
      } else {
        const chartBuilder = new ChartBuilder();
        await chartBuilder
          .setElement(ref.current)
          .setData(engagementDurationData)
          .setRenderer((selection, data) => {
            const metrics = data.data[0] || {};
            const avgEngagementDuration =
              parseInt(metrics.userEngagementDuration) /
              parseInt(metrics.visits);
            selection.text(
              formatters.secondsToReadableTime(avgEngagementDuration),
            );
          })
          .build();
      }
    };
    initEngagementDurationsChart().catch(console.error);
  }, [engagementDurationData]);

  return (
    <>
      <a
        className="chart__title"
        href="/definitions#report_historical_average_engagement_time"
      >
        <Tooltip
          position="top"
          content="The average length of time in which users were engaged with the site or application per session."
        >
          Average Engagement Time Per Session
        </Tooltip>
      </a>
      <div ref={ref}>
        <div className="data chart__rate padding-top-05"></div>
      </div>
    </>
  );
}

AverageEngagementDuration.propTypes = {
  dataHrefBase: PropTypes.string.isRequired,
};

export default AverageEngagementDuration;
