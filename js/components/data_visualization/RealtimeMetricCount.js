import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

import DataLoader from "../../lib/data_loader";
import formatters from "../../lib/chart_helpers/formatters";

/**
 * Retrieves the realtime users report from the passed data URL and creates a
 * visualization for the count of the passed metric name.
 *
 * @param {object} props the properties for the component
 * @param {string} props.dataHrefBase the URL of the base location of the data
 * to be downloaded including the agency path. In production this is proxied and
 * redirected to the S3 bucket URL.
 * @param {number} props.refreshSeconds the number of seconds to wait before
 * refreshing the data.
 * @param {string} props.metricName the name of the report metric to display.
 * @returns {import('react').ReactElement} The rendered element
 */
function RealtimeMetricCount({ dataHrefBase, refreshSeconds, metricName }) {
  const dataURL = `${dataHrefBase}/realtime.json`;
  const [realtimeReportData, setRealtimeReportData] = useState(null);
  // Set a non-breaking space to the initial display value so the div does not
  // collapse
  const [displayValue, setDisplayValue] = useState("\u00A0");

  useEffect(() => {
    const fetchData = async () => {
      if (!realtimeReportData) {
        try {
          await loadReportData();
        } catch (e) {
          setDisplayValue("0");
        }
      } else {
        if (shouldDisplayMetricCount()) {
          setDisplayValue(formattedMetricCount());
        } else {
          setDisplayValue("0");
        }
      }
    };
    fetchData().catch(console.error);
  }, [realtimeReportData]);

  async function loadReportData() {
    const data = await DataLoader.loadRealtimeReportJSON(dataURL);
    await setRealtimeReportData(data);
    // Refresh data every interval. useEffect will run and update the chart
    // when the state is changed.
    setInterval(() => {
      DataLoader.loadRealtimeReportJSON(dataURL).then((data) => {
        setRealtimeReportData(data);
      });
    }, refreshSeconds * 1000);
  }

  function shouldDisplayMetricCount() {
    return (
      !!realtimeReportData.data[0] && realtimeReportData.data[0][metricName]
    );
  }

  function formattedMetricCount() {
    return formatters.addCommas(realtimeReportData.data[0][metricName]);
  }

  return <span>{displayValue}</span>;
}

RealtimeMetricCount.propTypes = {
  dataHrefBase: PropTypes.string.isRequired,
  refreshSeconds: PropTypes.number.isRequired,
  metricName: PropTypes.string.isRequired,
};

export default RealtimeMetricCount;
