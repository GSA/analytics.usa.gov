import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import d3 from "d3";

import ChartBuilder from "../../lib/chart_helpers/chart_builder";
import DataLoader from "../../lib/data_loader";
import nestCharts from "../../lib/chart_helpers/nest_charts";
import Tooltip from "../tooltip/Tooltip";
import FilterSelect from "../select/FilterSelect";

/**
 * Retrieves the operating systems report from the passed data URL and creates a
 * visualization for the breakdown of operating systems of users visiting sites
 * for the current agency.
 *
 * @param {object} props the properties for the component
 * @param {string} props.dataHrefBase the URL of the base location of the data
 * to be downloaded including the agency path. In production this is proxied and
 * redirected to the S3 bucket URL.
 * @returns {import('react').ReactElement} The rendered element
 */
function OperatingSystemsChart({ dataHrefBase }) {
  const reportFilters = [
    ["Yesterday", "yesterday"],
    ["7 Days", "7-days"],
    ["30 Days", "30-days"],
    ["90 Days", "90-days"],
    ["Current Year", "current-year"],
    ["Current Fiscal Year", "current-fiscal-year"],
    ["Previous Year", "previous-year"],
    ["Previous Fiscal Year", "previous-fiscal-year"],
  ];
  const [currentFilter, setCurrentFilter] = useState(reportFilters[0]);
  const osRef = useRef(null);
  const windowsRef = useRef(null);

  useEffect(() => {
    const initChart = async () => {
      if (currentFilter) {
        await loadDataAndBuildCharts();
      }
    };
    initChart().catch(console.error);
  }, [currentFilter]);

  async function loadDataAndBuildCharts() {
    let osData;
    let windowsData;

    try {
      osData = await DataLoader.loadJSON(
        `${dataHrefBase}/os-${currentFilter[1]}.json`,
      );
    } catch (e) {
      osData = { data: [], totals: {} };
    }
    await buildOsChartForData(osData);

    try {
      windowsData = await DataLoader.loadJSON(
        `${dataHrefBase}/windows-${currentFilter[1]}.json`,
      );
    } catch (e) {
      windowsData = { data: [], totals: {} };
    }
    await buildWindowsChartForData(windowsData);

    // nest the windows chart inside the OS chart once they're both rendered
    // TODO: Remove windows versions?
    await d3
      .select(osRef.current)
      .call(nestCharts, "Windows", d3.select(windowsRef.current));
  }

  async function buildOsChartForData(data) {
    if (!data) return;

    const chartBuilder = new ChartBuilder();
    await chartBuilder.buildConsolidatedBarchart(osRef.current, data, "os", 10);
  }

  async function buildWindowsChartForData(data) {
    if (!data) return;

    const chartBuilder = new ChartBuilder();
    await chartBuilder.buildCompactBarChart(
      windowsRef.current,
      data,
      "os_version",
    );
  }

  async function filterChangeHandler(fileName) {
    if (!fileName) return;

    const selectedFilter = reportFilters.find((reportFilter) => {
      return reportFilter[1] == fileName;
    });
    await setCurrentFilter(selectedFilter);
  }

  return (
    <div className="padding-0">
      <div className="grid-row">
        <div className="chart__title display-flex card:grid-col-12 mobile-lg:grid-col-fill card:flex-justify-center mobile-lg:flex-justify-start card:padding-bottom-105 mobile-lg:padding-bottom-0">
          <a
            href={`${dataHrefBase}/os-${currentFilter[1]}.csv`}
            aria-label={`os-${currentFilter[1]}.csv`}
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
          <a href="/definitions#dimension_operating_system">
            <Tooltip
              position="top"
              content="The name of the operating system used by the user's device."
            >
              Operating Systems
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
      <figure id="chart_os" ref={osRef}>
        <div className="data chart__bar-chart text--capitalize margin-top-2"></div>
      </figure>
      <figure
        id="chart_windows"
        className="hide chart__bar-chart__nested grid-col-12"
        data-scale-to-parent="true"
        ref={windowsRef}
      >
        <div className="data chart__bar-chart text--capitalize"></div>
      </figure>
    </div>
  );
}

OperatingSystemsChart.propTypes = {
  dataHrefBase: PropTypes.string.isRequired,
};

export default OperatingSystemsChart;
