import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

import DataLoader from "../../lib/data_loader";
import Tooltip from "../tooltip/Tooltip";
import FilterSelect from "../select/FilterSelect";
import ConsolidatedBarChart from "../chart/ConsolidatedBarChart";

/**
 * Retrieves the session channel group report from the passed data URL and
 * creates a visualization for the breakdown of session channel groups of users
 * visiting sites for the current agency.
 *
 * @param {object} props the properties for the component
 * @param {string} props.dataHrefBase the URL of the base location of the data
 * to be downloaded including the agency path. In production this is proxied and
 * redirected to the S3 bucket URL.
 * @returns {import('react').ReactElement} The rendered element
 */
function TopSessionChannelGroupChart({ dataHrefBase }) {
  const reportFilters = [
    ["Yesterday", "top-session-channel-group-yesterday"],
    ["7 Days", "top-session-channel-group-7-days"],
    ["30 Days", "top-session-channel-group-30-days"],
    ["90 Days", "top-session-channel-group-90-days"],
  ];
  const [currentFilter, setCurrentFilter] = useState(reportFilters[0]);
  const [data, setData] = useState(null);

  useEffect(() => {
    const initChart = async () => {
      if (currentFilter) {
        await loadData();
      }
    };
    initChart().catch(console.error);
  }, [currentFilter]);

  async function loadData() {
    let data;

    try {
      data = await DataLoader.loadDailyReportJSON(
        `${dataHrefBase}/${currentFilter[1]}.json`,
      );
    } catch (e) {
      data = { data: [] };
    }

    await setData(data);
  }

  async function filterChangeHandler(fileName) {
    if (!fileName) return;

    const selectedFilter = reportFilters.find((reportFilter) => {
      return reportFilter[1] == fileName;
    });
    await setCurrentFilter(selectedFilter);
  }

  return (
    <>
      <div className="grid-row">
        <div className="chart__title display-flex card:grid-col-12 mobile-lg:grid-col-fill card:flex-justify-center mobile-lg:flex-justify-start card:padding-bottom-105 mobile-lg:padding-bottom-0">
          <a href="/definitions#dimension_default_channel_group">
            <Tooltip
              position="top"
              content="Channel groupings are rule-based definitions of your traffic sources."
            >
              Top Channels
            </Tooltip>
          </a>
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
        </div>
        <div className="card:grid-col-12 mobile-lg:grid-col-auto">
          <div className="display-flex card:flex-justify-center mobile-lg:flex-justify-end">
            <FilterSelect
              filters={reportFilters}
              defaultFilterValue={reportFilters[0][1] || ""}
              onChange={filterChangeHandler}
              name={"session channel group chart time filter"}
            />
          </div>
        </div>
      </div>
      {data && (
        <div className="text--capitalize">
          <ConsolidatedBarChart
            data={data}
            chartDataKey={"session_default_channel_group"}
            maxItems={10}
          />
        </div>
      )}
    </>
  );
}

TopSessionChannelGroupChart.propTypes = {
  dataHrefBase: PropTypes.string.isRequired,
};

export default TopSessionChannelGroupChart;
