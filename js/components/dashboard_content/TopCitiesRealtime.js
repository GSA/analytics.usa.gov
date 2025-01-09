import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";

import ChartBuilder from "../../lib/chart_helpers/chart_builder";
import DataLoader from "../../lib/data_loader";
import transformers from "../../lib/chart_helpers/transformers";
import Tooltip from "../tooltip/Tooltip";

/**
 * Retrieves the realtime top cities report from the passed data URL and
 * creates a visualization for the count of users visiting sites for the current
 * agency from each city.
 *
 * @param {object} props the properties for the component
 * @param {string} props.dataHrefBase the URL of the base location of the data
 * to be downloaded including the agency path. In production this is proxied and
 * redirected to the S3 bucket URL.
 * @param {number} props.refreshSeconds the number of seconds to wait before
 * refreshing chart data.
 * @returns {import('react').ReactElement} The rendered element
 */
function TopCitiesRealtime({ dataHrefBase, refreshSeconds }) {
  const jsonDataURL = `${dataHrefBase}/top-cities-realtime.json`;
  const csvDataURL = `${dataHrefBase}/top-cities-realtime.csv`;
  const ref = useRef(null);
  const [realtimeCitiesData, setRealtimeCitiesData] = useState(null);

  useEffect(() => {
    const initRealtimeCitiesChart = async () => {
      if (!realtimeCitiesData) {
        const data = await DataLoader.loadJSON(jsonDataURL);
        await setRealtimeCitiesData(data);
        // Refresh data every interval. useEffect will run and update the chart
        // when the state is changed.
        setInterval(() => {
          DataLoader.loadJSON(jsonDataURL).then((data) => {
            setRealtimeCitiesData(data);
          });
        }, refreshSeconds * 1000);
      } else {
        const chartBuilder = new ChartBuilder();
        await chartBuilder.buildBarChartWithLabel(
          ref.current,
          realtimeCitiesData,
          (d) => {
            const cityList = d.data;
            const cityListFiltered = cityList.filter(
              (c) => c.city !== "(not set)" && c.city !== "zz",
            );
            const proportions = transformers.findProportionsOfMetric(
              cityListFiltered,
              (list) => list.map((x) => x.activeUsers),
            );
            return proportions.slice(0, 13);
          },
          "city",
        );
      }
    };
    initRealtimeCitiesChart().catch(console.error);
  }, [realtimeCitiesData]);

  return (
    <>
      <div className="chart__title">
        <a href="/definitions#dimension_city">
          <Tooltip
            position="top"
            content="The city from which user activity originates. Location data may be affected by a user's VPN usage."
          >
            Cities
          </Tooltip>
        </a>
        <a href={csvDataURL} aria-label="top-cities-realtime.csv">
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
      <figure id="chart_top-cities-realtime" ref={ref}>
        <div className="data chart__bar-chart text--capitalize margin-top-2"></div>
      </figure>
    </>
  );
}

TopCitiesRealtime.propTypes = {
  dataHrefBase: PropTypes.string.isRequired,
  refreshSeconds: PropTypes.number.isRequired,
};

export default TopCitiesRealtime;
