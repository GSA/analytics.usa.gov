import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

import DataLoader from "../../lib/data_loader";
import Tooltip from "../tooltip/Tooltip";
import FilterSelect from "../select/FilterSelect";
import ConsolidatedBarChart from "../chart/ConsolidatedBarChart";

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
function TopCities({ dataHrefBase, refreshSeconds }) {
  const reportFilters = [
    ["30 Minutes", "top-cities-realtime"],
    ["Yesterday", "top-cities-yesterday"],
    ["7 Days", "top-cities-7-days"],
    ["30 Days", "top-cities-30-days"],
    ["90 Days", "top-cities-90-days"],
    ["Current Year", "top-cities-current-year"],
    ["Current Fiscal Year", "top-cities-current-fiscal-year"],
    ["Previous Year", "top-cities-previous-year"],
    ["Previous Fiscal Year", "top-cities-previous-fiscal-year"],
  ];
  const [currentFilter, setCurrentFilter] = useState(reportFilters[0]);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [isRealtime, setIsRealtime] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const initChart = async () => {
      if (currentFilter) {
        await loadDataAndBuildChart();

        if (refreshInterval) {
          clearInterval(refreshInterval);
        }

        if (isRealtime) {
          // Refresh data every interval.
          setRefreshInterval(
            setInterval(() => {
              loadDataAndBuildChart();
            }, refreshSeconds * 1000),
          );
        }
      }
    };
    initChart().catch(console.error);
  }, [currentFilter, isRealtime]);

  async function loadDataAndBuildChart() {
    let data;

    try {
      data = await DataLoader.loadJSON(
        `${dataHrefBase}/${currentFilter[1]}.json`,
      );
    } catch (e) {
      data = { data: [], totals: {} };
    }

    await setData(data);
  }

  async function filterChangeHandler(fileName) {
    if (!fileName) return;

    const selectedFilter = reportFilters.find((reportFilter) => {
      return reportFilter[1] == fileName;
    });

    await setIsRealtime(selectedFilter == reportFilters[0]);
    await setCurrentFilter(selectedFilter);
  }

  return (
    <>
      <div className="grid-row">
        <div className="chart__title display-flex card:grid-col-12 mobile-lg:grid-col-fill card:flex-justify-center mobile-lg:flex-justify-start card:padding-bottom-105 mobile-lg:padding-bottom-0">
          <a
            href={`${dataHrefBase}/${currentFilter[1]}.csv`}
            aria-label={`${currentFilter[1]}.csv`}
          >
            <svg
              className="usa-icon margin-bottom-neg-05 margin-left-05"
              aria-hidden="true"
              focusable="false"
              role="img"
            >
              <use xlinkHref="/assets/uswds/img/sprite.svg#file_present"></use>
            </svg>
          </a>
          <a href="/definitions#dimension_city">
            <Tooltip
              position="top"
              content="The city from which user activity originates. Location data may be affected by a user's VPN usage."
            >
              Cities
            </Tooltip>
          </a>
        </div>
        <div className="card:grid-col-12 mobile-lg:grid-col-auto">
          <div className="display-flex card:flex-justify-center mobile-lg:flex-justify-end">
            <FilterSelect
              filters={reportFilters}
              defaultFilterValue={reportFilters[0][1] || ""}
              onChange={filterChangeHandler}
              name={"cities chart time filter"}
            />
          </div>
        </div>
      </div>
      {data && (
        <div className="text--capitalize">
          <ConsolidatedBarChart
            data={data}
            chartDataKey={"city"}
            maxItems={11}
          />
        </div>
      )}
    </>
  );
}

TopCities.propTypes = {
  dataHrefBase: PropTypes.string.isRequired,
  refreshSeconds: PropTypes.number.isRequired,
};

export default TopCities;
