import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import d3 from "d3";

import DataLoader from "../../lib/data_loader";
import ChartBuilder from "../../lib/chart_helpers/chart_builder";
import { exceptions, titleExceptions } from "../../lib/exceptions";
import barChart from "../../lib/chart_helpers/barchart";
import formatters from "../../lib/chart_helpers/formatters";
import FilterSelect from "../select/FilterSelect";

/**
 * Retrieves the realitme top page report from the passed data URL and creates a
 * visualization for the count of users visiting sites for the current agency.
 *
 * @param {object} props the properties for the component
 * @param {string} props.dataHrefBase the URL of the base location of the data
 * to be downloaded including the agency path. In production this is proxied and
 * redirected to the S3 bucket URL.
 * @param {number} props.numberOfListingsToDisplay the count of top page
 * listings to display in the bar chart.
 * @param {number} props.refreshSeconds the number of seconds to wait before
 * refreshing chart data.
 * @returns {import('react').ReactElement} The rendered element
 */
function TopPages({ dataHrefBase, numberOfListingsToDisplay, refreshSeconds }) {
  const reportFilters = [
    ["30 Minutes", "top-pages-realtime"],
    ["Yesterday", "top-domains-yesterday"],
    ["7 Days", "top-domains-7-days"],
    ["30 Days", "top-domains-30-days"],
    ["90 Days", "top-domains-90-days"],
    ["Current Year", "top-domains-current-year"],
    ["Current Fiscal Year", "top-domains-current-fiscal-year"],
    ["Previous Year", "top-domains-previous-year"],
    ["Previous Fiscal Year", "top-domains-previous-fiscal-year"],
  ];
  const [currentFilter, setCurrentFilter] = useState(reportFilters[0]);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [shouldDisplayPages, setShouldDisplayPages] = useState(true);
  const [isRealtime, setIsRealtime] = useState(true);
  const realtimeRef = useRef(null);
  const nonRealtimeRef = useRef(null);

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
              loadDataAndBuildChart(realtimeRef);
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
      data = { data: [] };
    }

    if (data && data.data && Array.isArray(data.data) && data.data.length > 2) {
      await setShouldDisplayPages(true);
    } else {
      await setShouldDisplayPages(false);
    }

    if (isRealtime) {
      await buildRealtimeChartForData(data);
    } else {
      await buildNonRealtimeChartForData(data);
    }
  }

  function buildNonRealtimeChartForData(data) {
    const chartBuilder = new ChartBuilder();
    return chartBuilder
      .setElement(nonRealtimeRef.current)
      .setData(data)
      .setTransformer((d) => d.data.slice(0, numberOfListingsToDisplay))
      .setRenderer((selection) => {
        const barchartRenderer = barChart()
          .label((d) => {
            return d.domain;
          })
          .value((d) => {
            return +d.visits;
          })
          .scale((values) =>
            d3.scale
              .linear()
              .domain([0, 1, d3.max(values)])
              .rangeRound([0, 1, 100]),
          )
          .format(formatters.addCommas);
        barchartRenderer(selection);

        selection
          .selectAll(".chart__bar-chart__item__label")
          .each(function (d) {
            d.text = this.innerText;
          })
          .html("")
          .append("a")
          .attr("target", "_blank")
          .attr("rel", "noopener")
          .attr("href", (d) => exceptions[d.domain] || `http://${d.domain}`)
          .text((d) => titleExceptions[d.domain] || d.domain);
      })
      .build();
  }

  function buildRealtimeChartForData(data) {
    const chartBuilder = new ChartBuilder();
    return chartBuilder
      .setElement(realtimeRef.current)
      .setData(data)
      .setTransformer((d) => d.data.slice(0, numberOfListingsToDisplay))
      .setRenderer((selection) => {
        const barchartRenderer = barChart()
          .label((d) => {
            return d.page_title;
          })
          .value((d) => {
            return +d.activeUsers;
          })
          .scale((values) =>
            d3.scale
              .linear()
              .domain([0, 1, d3.max(values)])
              .rangeRound([0, 1, 100]),
          )
          .format(formatters.addCommas);
        barchartRenderer(selection);

        selection
          .selectAll(".chart__bar-chart__item__label")
          .each(function (d) {
            d.text = this.innerText;
          })
          .html("")
          .text((d) => titleExceptions[d.page] || d.page_title);
      })
      .build();
  }

  async function filterChangeHandler(fileName) {
    if (!fileName) return;

    const selectedFilter = reportFilters.find((reportFilter) => {
      return reportFilter[1] == fileName;
    });

    await setIsRealtime(selectedFilter == reportFilters[0]);
    await setCurrentFilter(selectedFilter);
  }

  function chartDescription() {
    if (isRealtime) {
      return (
        <>
          <strong>Users</strong> on a{" "}
          <strong>single, specific page or app screen</strong>{" "}
          {timeIntervalDescription()}. Hostnames are not currently reported in
          real-time, so only page title and screen name information is
          available.
        </>
      );
    } else {
      return (
        <>
          Sessions {timeIntervalDescription()} on <strong>hostnames</strong>,
          including traffic to all web pages and app screens within that
          hostname.
        </>
      );
    }
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
        {shouldDisplayPages
          ? chartDescription()
          : `Top pages data ${timeIntervalDescription()} is unavailable.`}
      </p>
      <div className="grid-row">
        <div className="display-flex card:grid-col-12 mobile-lg:grid-col-fill card:flex-justify-center mobile-lg:flex-justify-start card:padding-bottom-05 mobile-lg:padding-bottom-0">
          {shouldDisplayPages && (
            <p className="margin-top-05 margin-bottom-105">
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
              name={"top pages chart time filter"}
            />
          </div>
        </div>
      </div>
      {shouldDisplayPages && isRealtime && (
        <figure ref={realtimeRef} className="top-pages__bar-chart">
          <div
            className={"data chart__bar-chart margin-top-1 text--capitalize"}
          ></div>
        </figure>
      )}
      {shouldDisplayPages && !isRealtime && (
        <figure ref={nonRealtimeRef} className="top-pages__bar-chart">
          <div
            className={"data chart__bar-chart margin-top-1 text--lowercase"}
          ></div>
        </figure>
      )}
    </>
  );
}

TopPages.propTypes = {
  dataHrefBase: PropTypes.string.isRequired,
  numberOfListingsToDisplay: PropTypes.number.isRequired,
  refreshSeconds: PropTypes.number.isRequired,
};

export default TopPages;
