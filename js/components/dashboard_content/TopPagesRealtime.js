import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import d3 from "d3";

import DataLoader from "../../lib/data_loader";
import ChartBuilder from "../../lib/chart_helpers/chart_builder";
import { titleExceptions } from "../../lib/exceptions";
import barChart from "../../lib/chart_helpers/barchart";
import formatters from "../../lib/chart_helpers/formatters";

/**
 * Retrieves the realitme top page report from the passed data URL and creates a
 * visualization for the count of users visiting sites for the current agency.
 *
 * @param {object} props the properties for the component
 * @param {string} props.dataHrefBase the URL of the base location of the data
 * to be downloaded including the agency path. In production this is proxied and
 * redirected to the S3 bucket URL.
 * @param {string} props.reportFileName the file name of the report to use as a
 * data source for the data visualization.
 * @param {number} props.numberOfListingsToDisplay the count of top page
 * listings to display in the bar chart.
 * @param {number} props.refreshSeconds the number of seconds to wait before
 * refreshing chart data.
 * @returns {import('react').ReactElement} The rendered element
 */
function TopPagesRealtime({
  dataHrefBase,
  reportFileName,
  numberOfListingsToDisplay,
  refreshSeconds,
}) {
  const dataURL = `${dataHrefBase}/${reportFileName}`;
  const ref = useRef(null);
  const [topPagesData, setTopPagesData] = useState(null);

  useEffect(() => {
    const initTopPagessChart = async () => {
      if (!topPagesData) {
        const data = await DataLoader.loadJSON(dataURL);
        await setTopPagesData(data);
        // Refresh data every interval. useEffect will run and update the chart
        // when the state is changed.
        setInterval(() => {
          DataLoader.loadJSON(dataURL).then((data) => {
            setTopPagesData(data);
          });
        }, refreshSeconds * 1000);
      } else {
        const chartBuilder = new ChartBuilder();
        await chartBuilder
          .setElement(ref.current)
          .setData(topPagesData)
          .setTransformer((d) => d.data.slice(0, numberOfListingsToDisplay))
          .setRenderer((selection) => {
            const barchartRenderer = barChart()
              .label((d) => d.page_title)
              .value((d) => +d.activeUsers)
              .scale((values) =>
                d3.scale
                  .linear()
                  .domain([0, 1, d3.max(values)])
                  .rangeRound([0, 1, 100]),
              )
              .format(formatters.addCommas);
            barchartRenderer(selection);

            selection
              .selectAll(".label")
              .each(function (d) {
                d.text = this.innerText;
              })
              .html("")
              .text((d) => titleExceptions[d.page] || d.page_title);
          })
          .build();
      }
    };
    initTopPagessChart().catch(console.error);
  }, [topPagesData]);

  return (
    <figure ref={ref}>
      <div className="data chart__bar-chart text--capitalize margin-top-1"></div>
    </figure>
  );
}

TopPagesRealtime.propTypes = {
  dataHrefBase: PropTypes.string.isRequired,
  reportFileName: PropTypes.string.isRequired,
  numberOfListingsToDisplay: PropTypes.number.isRequired,
  refreshSeconds: PropTypes.number.isRequired,
};

export default TopPagesRealtime;
