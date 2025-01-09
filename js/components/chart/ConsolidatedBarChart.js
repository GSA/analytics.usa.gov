import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";

import ChartBuilder from "../../lib/chart_helpers/chart_builder";
import DataLoader from "../../lib/data_loader";

/**
 * Retrieves the data report from the passed data URL and creates a
 * consolidated bar chart visualization for the data in the provided key.
 *
 * @param {object} props the properties for the component.
 * @param {string} props.dataUrl the URL of the location of the data to be
 * downloaded for the chart.
 * @param {string} props.chartDataKey the key of the data object to use for the chart
 * proportions.
 * @param {number} props.maxItems the max number of items to be displayed in the
 * bar chart after consolidating items beyond the maximum.
 * @returns {import('react').ReactElement} The rendered element
 */
function ConsolidatedBarChart({ dataUrl, chartDataKey, maxItems }) {
  const ref = useRef(null);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const initChart = async () => {
      if (!chartData) {
        const data = await DataLoader.loadJSON(dataUrl);
        await setChartData(data);
      } else {
        const chartBuilder = new ChartBuilder();
        await chartBuilder.buildConsolidatedBarchart(
          ref.current,
          chartData,
          chartDataKey,
          maxItems,
        );
      }
    };
    initChart().catch(console.error);
  }, [chartData]);

  return (
    <figure id={`chart_${chartDataKey}`} ref={ref}>
      <div className="data chart__bar-chart margin-top-2"></div>
    </figure>
  );
}

ConsolidatedBarChart.propTypes = {
  dataUrl: PropTypes.string.isRequired,
  chartDataKey: PropTypes.string.isRequired,
  maxItems: PropTypes.number.isRequired,
};

export default ConsolidatedBarChart;
