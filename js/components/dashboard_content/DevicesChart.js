import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

import DataLoader from "../../lib/data_loader";
import Tooltip from "../tooltip/Tooltip";
import FilterSelect from "../select/FilterSelect";
import ConsolidatedBarChart from "../chart/ConsolidatedBarChart";

/**
 * Retrieves the devices report from the passed data URL and creates a
 * visualization for the breakdown of devices of users visiting sites for the
 * current agency.
 *
 * @param {object} props the properties for the component
 * @param {string} props.dataHrefBase the URL of the base location of the data
 * to be downloaded including the agency path. In production this is proxied and
 * redirected to the S3 bucket URL.
 * @returns {import('react').ReactElement} The rendered element
 */
function DevicesChart({ dataHrefBase }) {
  const reportFilters = [
    ["30 Minutes", "devices-realtime"],
    ["Yesterday", "devices-yesterday"],
    ["7 Days", "devices-7-days"],
    ["30 Days", "devices-30-days"],
    ["90 Days", "devices-90-days"],
    ["Current Year", "devices-current-year"],
    ["Current Fiscal Year", "devices-current-fiscal-year"],
    ["Previous Year", "devices-previous-year"],
    ["Previous Fiscal Year", "devices-previous-fiscal-year"],
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
      data = await DataLoader.loadJSON(
        `${dataHrefBase}/${currentFilter[1]}.json`,
      );
    } catch (e) {
      data = { data: [] };
    }

    if (data && data.totals && data.totals.by_device) {
      // Rename "smart tv" to "Smart TV"
      delete Object.assign(data.totals.by_device, {
        ["Smart TV"]: data.totals.by_device["smart tv"],
      })["smart tv"];
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
          <a href="/definitions#dimension_device_category">
            <Tooltip
              position="top"
              content="The type category of the device used by the user to access the site or application."
            >
              Devices
            </Tooltip>
          </a>
        </div>
        <div className="card:grid-col-12 mobile-lg:grid-col-auto">
          <div className="display-flex card:flex-justify-center mobile-lg:flex-justify-end">
            <FilterSelect
              filters={reportFilters}
              defaultFilterValue={reportFilters[0][1] || ""}
              onChange={filterChangeHandler}
              name={"devices chart time filter"}
            />
          </div>
        </div>
      </div>
      {data && (
        <div className="text--capitalize">
          <ConsolidatedBarChart
            data={data}
            chartDataKey={"device"}
            maxItems={5}
          />
        </div>
      )}
    </>
  );
}

DevicesChart.propTypes = {
  dataHrefBase: PropTypes.string.isRequired,
};

export default DevicesChart;
