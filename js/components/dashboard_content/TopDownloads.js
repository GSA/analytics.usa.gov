import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import d3 from "d3";

import ChartBuilder from "../../lib/chart_helpers/chart_builder";
import DataLoader from "../../lib/data_loader";
import barChart from "../../lib/chart_helpers/barchart";
import formatters from "../../lib/chart_helpers/formatters";
import FilterSelect from "../select/FilterSelect";

/**
 * Retrieves the top downloads report from the passed data URL and creates a
 * visualization for the count of users downloading files for the current
 * agency.
 *
 * @param {object} props the properties for the component
 * @param {string} props.agency the agency display name to be used in the chart
 * description.
 * @param {string} props.dataHrefBase the URL of the base location of the data
 * to be downloaded including the agency path. In production this is proxied and
 * redirected to the S3 bucket URL.
 * @param {number} props.numberOfListingsToDisplay the count of downloads
 * listings to display in the bar chart.
 * @returns {import('react').ReactElement} The rendered element
 */
function TopDownloads({ agency, dataHrefBase, numberOfListingsToDisplay }) {
  const reportFilters = [
    ["Yesterday", "top-downloads-yesterday"],
    ["7 Days", "top-downloads-7-days"],
    ["30 Days", "top-downloads-30-days"],
    ["90 Days", "top-downloads-90-days"],
  ];
  const [currentFilter, setCurrentFilter] = useState(reportFilters[0]);
  const [shouldDisplayDownloads, setShouldDisplayDownloads] = useState(true);
  const ref = useRef(null);

  useEffect(() => {
    const initChart = async () => {
      if (currentFilter) {
        await loadDataAndBuildChart();
      }
    };
    initChart().catch(console.error);
  }, [currentFilter]);

  async function loadDataAndBuildChart() {
    let data;

    try {
      data = await DataLoader.loadDailyReportJSON(
        `${dataHrefBase}/${currentFilter[1]}.json`,
      );
    } catch (e) {
      data = { totals: {} };
    }
    await buildChartForData(data);
  }

  async function buildChartForData(data) {
    let downloadData;
    if (data && data.data && Array.isArray(data.data) && data.data.length > 2) {
      downloadData = data;
      setShouldDisplayDownloads(true);
    } else {
      downloadData = { data: [] };
      setShouldDisplayDownloads(false);
    }

    const chartBuilder = new ChartBuilder();
    await chartBuilder
      .setElement(ref.current)
      .setData(downloadData)
      .setTransformer((d) => d.data.slice(0, numberOfListingsToDisplay))
      .setRenderer(
        barChart()
          .value((d) => +d.total_events)
          .label(
            (d) =>
              `<div class="grid-row">
                <div class="grid-col-12 text--overflow-ellipsis">
                  <a target="_blank" rel="noopener" href="http://${d.page}">
                    ${d.page_title}
                  </a>
                </div>
                <div class="grid-col-12">
                  <div class="grid-row text--overflow-wrap">
                    <div class="grid-col-auto text--lowercase dark-gray">
                      <span>${formatters.formatURL(d.page).trim()}</span><span class="padding-x-05">/</span>
                    </div>
                    <div class="grid-col-auto text--lowercase">
                      <a target="_blank" rel="noopener" href="${d.linkUrl}">
                        download file
                      </a>
                    </div>
                  </div>
                </div>
              </div>`,
          )
          .scale((values) =>
            d3.scale
              .linear()
              .domain([0, 1, d3.max(values)])
              .rangeRound([0, 1, 100]),
          )
          .format(formatters.addCommas),
      )
      .build();
  }

  async function filterChangeHandler(fileName) {
    if (!fileName) return;

    const selectedFilter = reportFilters.find((reportFilter) => {
      return reportFilter[1] == fileName;
    });
    await setCurrentFilter(selectedFilter);
  }

  function timeIntervalDescription() {
    if (currentFilter[0] == "Yesterday") {
      return currentFilter[0].toLowerCase();
    } else {
      return `over the last ${currentFilter[0].toLowerCase()}`;
    }
  }

  return (
    <>
      <p className="margin-top-0 margin-bottom-1">
        <em>
          {shouldDisplayDownloads
            ? `Top files downloaded ${timeIntervalDescription()} on ${agency} hostnames.`
            : `Top downloads data ${timeIntervalDescription()} is unavailable for ${agency} hostnames.`}
        </em>
      </p>
      <div className="grid-row">
        <div className="display-flex card:grid-col-12 mobile-lg:grid-col-fill card:flex-justify-center mobile-lg:flex-justify-start card:padding-bottom-105 mobile-lg:padding-bottom-0">
          {shouldDisplayDownloads && (
            <p className="margin-top-05 margin-bottom-05">
              <a
                href={`${dataHrefBase}/${currentFilter[1]}.csv`}
                aria-label={`${currentFilter[1]}.csv`}
              >
                Download the data
                <svg
                  className="usa-icon margin-bottom-neg-05 margin-left-05"
                  aria-hidden="true"
                  focusable="false"
                  role="img"
                >
                  <use xlinkHref="/assets/uswds/img/sprite.svg#file_present"></use>
                </svg>
              </a>
            </p>
          )}
        </div>
        <div className="card:grid-col-12 mobile-lg:grid-col-auto">
          <div className="display-flex card:flex-justify-center mobile-lg:flex-justify-end">
            <FilterSelect
              filters={reportFilters}
              defaultFilterValue={reportFilters[0][1] || ""}
              onChange={filterChangeHandler}
              name={"top downloads chart time filter"}
            />
          </div>
        </div>
      </div>
      {shouldDisplayDownloads && (
        <figure className="top-downloads__bar-chart" ref={ref}>
          <div className="data chart__bar-chart text--capitalize margin-top-2"></div>
        </figure>
      )}
    </>
  );
}

TopDownloads.propTypes = {
  agency: PropTypes.string.isRequired,
  dataHrefBase: PropTypes.string.isRequired,
  numberOfListingsToDisplay: PropTypes.number.isRequired,
};

export default TopDownloads;
