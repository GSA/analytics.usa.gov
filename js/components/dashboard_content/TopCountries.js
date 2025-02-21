import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import d3 from "d3";

import ChartBuilder from "../../lib/chart_helpers/chart_builder";
import DataLoader from "../../lib/data_loader";
import nestCharts from "../../lib/chart_helpers/nest_charts";
import transformers from "../../lib/chart_helpers/transformers";
import { isPartOfUnitedStates } from "../../lib/territories";
import Tooltip from "../tooltip/Tooltip";
import FilterSelect from "../select/FilterSelect";

/**
 * Retrieves the realtime top countries report from the passed data URL and
 * creates a visualization for the count of users visiting sites for the current
 * agency from each country.
 *
 * @param {object} props the properties for the component
 * @param {string} props.dataHrefBase the URL of the base location of the data
 * to be downloaded including the agency path. In production this is proxied and
 * redirected to the S3 bucket URL.
 * @param {number} props.refreshSeconds the number of seconds to wait before
 * refreshing chart data.
 * @returns {import('react').ReactElement} The rendered element
 */
function TopCountries({ dataHrefBase, refreshSeconds }) {
  const reportFilters = [
    ["30 Minutes", "top-countries-realtime"],
    ["Yesterday", "top-countries-yesterday"],
    ["7 Days", "top-countries-7-days"],
    ["30 Days", "top-countries-30-days"],
    ["90 Days", "top-countries-90-days"],
    ["Current Year", "top-countries-current-year"],
    ["Current Fiscal Year", "top-countries-current-fiscal-year"],
    ["Previous Year", "top-countries-previous-year"],
    ["Previous Fiscal Year", "top-countries-previous-fiscal-year"],
  ];
  const [currentFilter, setCurrentFilter] = useState(reportFilters[0]);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [isRealtime, setIsRealtime] = useState(true);
  const countriesRef = useRef(null);
  const usTerritoriesRef = useRef(null);
  const internationalVisitsRef = useRef(null);

  useEffect(() => {
    const initChart = async () => {
      if (currentFilter) {
        await loadDataAndBuildCharts();

        if (refreshInterval) {
          clearInterval(refreshInterval);
        }

        if (isRealtime) {
          // Refresh data every interval.
          setRefreshInterval(
            setInterval(() => {
              loadDataAndBuildCharts();
            }, refreshSeconds * 1000),
          );
        }
      }
    };
    initChart().catch(console.error);
  }, [currentFilter, isRealtime]);

  async function loadDataAndBuildCharts() {
    let data;

    try {
      data = await DataLoader.loadJSON(
        `${dataHrefBase}/${currentFilter[1]}.json`,
      );
    } catch (e) {
      data = { data: [], totals: {} };
    }
    await buildCountriesChartForData(data);
    await buildUSChartForData(data);
    await buildInternationalChartForData(data);

    // nest the US and territories chart inside the "US"
    // chart once they're both rendered
    await d3
      .select(countriesRef.current)
      .call(
        nestCharts,
        "United States &amp; Territories",
        d3.select(usTerritoriesRef.current),
      );

    // nest the international countries chart inside the "International"
    // chart once they're both rendered
    await d3
      .select(countriesRef.current)
      .call(
        nestCharts,
        "International",
        d3.select(internationalVisitsRef.current),
      );
  }

  async function buildCountriesChartForData(data) {
    if (!data) return;

    // Create countries chart
    const chartBuilder = new ChartBuilder();
    await chartBuilder.buildBarChart(countriesRef.current, data, (d) => {
      const usersKey =
        d.data[0] && d.data[0]["activeUsers"] !== undefined
          ? "activeUsers"
          : "totalUsers";
      let totalVisits = 0;
      let USVisits = 0;
      // Sort items by users descending.
      d.data.sort((a, b) => {
        return b[usersKey] - a[usersKey];
      });
      d.data.forEach((c) => {
        totalVisits += parseInt(c[usersKey], 10);
        if (!c.country) {
          c.country = "Unknown";
        }
        if (isPartOfUnitedStates(c.country)) {
          USVisits += parseInt(c[usersKey], 10);
        }
      });
      const international = totalVisits - USVisits;
      const data = {};
      if (USVisits) {
        data["United States &amp; Territories"] = USVisits;
      }
      if (international) {
        data["International"] = international;
      }
      return transformers.findProportionsOfMetricFromValue(
        transformers.listify(data),
      );
    });
  }

  async function buildUSChartForData(data) {
    if (!data) return;

    // Create us and territories breakdown chart
    const chartBuilder = new ChartBuilder();
    await chartBuilder.buildBarChartWithLabel(
      usTerritoriesRef.current,
      data,
      (d) => {
        const usersKey =
          d.data[0] && d.data[0]["activeUsers"] !== undefined
            ? "activeUsers"
            : "totalUsers";
        let values = transformers.findProportionsOfMetric(d.data, (list) =>
          list.map((x) => x[usersKey]),
        );
        values = values.filter((c) => isPartOfUnitedStates(c.country));
        return transformers.consolidateValuesAfterListLength({
          values,
          maxItems: 3,
          labelKey: "country",
        });
      },
      "country",
    );
  }

  async function buildInternationalChartForData(data) {
    if (!data) return;

    // Create international breakdown chart
    const chartBuilder = new ChartBuilder();
    await chartBuilder.buildBarChartWithLabel(
      internationalVisitsRef.current,
      data,
      (d) => {
        const usersKey =
          d.data[0] && d.data[0]["activeUsers"] !== undefined
            ? "activeUsers"
            : "totalUsers";
        let values = transformers.findProportionsOfMetric(d.data, (list) =>
          list.map((x) => x[usersKey]),
        );
        values = values.filter((c) => !isPartOfUnitedStates(c.country));
        return transformers.consolidateValuesAfterListLength({
          values,
          maxItems: 15,
          labelKey: "country",
        });
      },
      "country",
    );
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
    <div className="padding-0">
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
          <a href="/definitions#dimension_country">
            <Tooltip
              position="top"
              content="The country from which user activity originates. Location data may be affected by a user's VPN usage."
            >
              Countries
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
      <figure id="chart_us" ref={countriesRef}>
        <div className="data chart__bar-chart text--capitalize margin-top-2"></div>
      </figure>

      <figure
        id="chart_us_and_territories"
        className="hide chart__bar-chart__nested grid-col-12"
        ref={usTerritoriesRef}
      >
        <div className="data chart__bar-chart text--capitalize"></div>
      </figure>

      <figure
        id="chart_countries"
        className="hide chart__bar-chart__nested grid-col-12"
        ref={internationalVisitsRef}
      >
        <div className="data chart__bar-chart text--capitalize"></div>
      </figure>
    </div>
  );
}

TopCountries.propTypes = {
  dataHrefBase: PropTypes.string.isRequired,
  refreshSeconds: PropTypes.number.isRequired,
};

export default TopCountries;
