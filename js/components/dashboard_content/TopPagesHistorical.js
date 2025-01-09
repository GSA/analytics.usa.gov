import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import d3 from "d3";

import DataLoader from "../../lib/data_loader";
import ChartBuilder from "../../lib/chart_helpers/chart_builder";
import { exceptions, titleExceptions } from "../../lib/exceptions";
import barChart from "../../lib/chart_helpers/barchart";
import formatters from "../../lib/chart_helpers/formatters";

/**
 * Retrieves the top pages report from the passed data URL and report file name
 * creates a visualization for the count of users visiting sites for the current
 * agency.
 *
 * @param {object} props the properties for the component
 * @param {string} props.dataHrefBase the URL of the base location of the data
 * to be downloaded including the agency path. In production this is proxied and
 * redirected to the S3 bucket URL.
 * @param {string} props.reportFileName the file name of the report to use as a
 * data source for the data visualization.
 * @param {number} props.numberOfListingsToDisplay the count of top page
 * listings to display in the bar chart.
 * @returns {import('react').ReactElement} The rendered element
 */
function TopPagesHistorical({
  dataHrefBase,
  reportFileName,
  numberOfListingsToDisplay,
}) {
  const dataURL = `${dataHrefBase}/${reportFileName}`;
  const ref = useRef(null);
  const [topPagesData, setTopPagesData] = useState(null);

  useEffect(() => {
    const initTopPagessChart = async () => {
      if (!topPagesData) {
        const data = await DataLoader.loadJSON(dataURL);
        await setTopPagesData(data);
      } else {
        const chartBuilder = new ChartBuilder();
        await chartBuilder
          .setElement(ref.current)
          .setData(topPagesData)
          .setTransformer((d) => d.data.slice(0, numberOfListingsToDisplay))
          .setRenderer((selection) => {
            const barchartRenderer = barChart()
              .label((d) => d.domain)
              .value((d) => +d.visits)
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
    };
    initTopPagessChart().catch(console.error);
  }, [topPagesData]);

  return (
    <figure data-source={dataURL} ref={ref}>
      <div className="data chart__bar-chart text--lowercase margin-top-1"></div>
    </figure>
  );
}

TopPagesHistorical.propTypes = {
  dataHrefBase: PropTypes.string.isRequired,
  reportFileName: PropTypes.string.isRequired,
  numberOfListingsToDisplay: PropTypes.number.isRequired,
};

export default TopPagesHistorical;
