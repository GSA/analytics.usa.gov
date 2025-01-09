import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import d3 from "d3";

import ChartBuilder from "../../lib/chart_helpers/chart_builder";
import DataLoader from "../../lib/data_loader";
import nestCharts from "../../lib/chart_helpers/nest_charts";
import transformers from "../../lib/chart_helpers/transformers";
import { isPartOfUnitedStates } from "../../lib/territories";
import Tooltip from "../tooltip/Tooltip";

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
function TopCountriesRealtime({ dataHrefBase, refreshSeconds }) {
  const jsonDataURL = `${dataHrefBase}/top-countries-realtime.json`;
  const csvDataURL = `${dataHrefBase}/top-countries-realtime.csv`;
  const countriesRef = useRef(null);
  const usTerritoriesRef = useRef(null);
  const internationalVisitsRef = useRef(null);
  const [countryData, setCountryData] = useState(null);
  const [chartsLoaded, setChartsLoaded] = useState(false);

  useEffect(() => {
    const initRealtimeCountriesChart = async () => {
      if (!countryData) {
        const data = await DataLoader.loadJSON(jsonDataURL);
        await setCountryData(data);
        // Refresh data every interval. useEffect will run and update the chart
        // when the state is changed.
        setInterval(() => {
          DataLoader.loadJSON(jsonDataURL).then((data) => {
            setCountryData(data);
            setChartsLoaded(false);
          });
        }, refreshSeconds * 1000);
      } else {
        // Create countries chart
        let chartBuilder = new ChartBuilder();
        await chartBuilder.buildBarChart(
          countriesRef.current,
          countryData,
          (d) => {
            let totalVisits = 0;
            let USVisits = 0;
            // Sort items by activeUsers descending.
            d.data.sort((a, b) => {
              return b.activeUsers - a.activeUsers;
            });
            d.data.forEach((c) => {
              totalVisits += parseInt(c.activeUsers, 10);
              if (!c.country) {
                c.country = "Unknown";
              }
              if (isPartOfUnitedStates(c.country)) {
                USVisits += parseInt(c.activeUsers, 10);
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
          },
        );

        // Create us and territories breakdown chart
        chartBuilder = new ChartBuilder();
        await chartBuilder.buildBarChartWithLabel(
          usTerritoriesRef.current,
          countryData,
          (d) => {
            let values = transformers.findProportionsOfMetric(d.data, (list) =>
              list.map((x) => x.activeUsers),
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

        // Create international breakdown chart
        chartBuilder = new ChartBuilder();
        await chartBuilder.buildBarChartWithLabel(
          internationalVisitsRef.current,
          countryData,
          (d) => {
            let values = transformers.findProportionsOfMetric(d.data, (list) =>
              list.map((x) => x.activeUsers),
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

        await setChartsLoaded(true);
      }

      if (chartsLoaded) {
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
    };
    initRealtimeCountriesChart().catch(console.error);
  }, [countryData, chartsLoaded]);

  return (
    <div className="padding-0">
      <div className="chart__title">
        <a href="/definitions#dimension_country">
          <Tooltip
            position="top"
            content="The country from which user activity originates. Location data may be affected by a user's VPN usage."
          >
            Countries
          </Tooltip>
        </a>
        <a href={csvDataURL} aria-label="top-countries-realtime.csv">
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
      <figure id="chart_us" ref={countriesRef}>
        <div className="data chart__bar-chart text--capitalize margin-top-2"></div>
      </figure>

      <figure
        id="chart_us_and_territories"
        className="hide chart__bar-chart__nested"
        ref={usTerritoriesRef}
      >
        <div className="data chart__bar-chart text--capitalize"></div>
      </figure>

      <figure
        id="chart_countries"
        className="hide chart__bar-chart__nested"
        ref={internationalVisitsRef}
      >
        <div className="data chart__bar-chart text--capitalize"></div>
      </figure>
    </div>
  );
}

TopCountriesRealtime.propTypes = {
  dataHrefBase: PropTypes.string.isRequired,
  refreshSeconds: PropTypes.number.isRequired,
};

export default TopCountriesRealtime;
