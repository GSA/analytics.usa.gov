import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import d3 from "d3";

import ChartBuilder from "../../lib/chart_helpers/chart_builder";
import DataLoader from "../../lib/data_loader";
import nestCharts from "../../lib/chart_helpers/nest_charts";
import Tooltip from "../tooltip/Tooltip";

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
  const osJsonDataURL = `${dataHrefBase}/os.json`;
  const osCsvDataURL = `${dataHrefBase}/os.csv`;
  const windowsDataURL = `${dataHrefBase}/windows.json`;
  const osRef = useRef(null);
  const windowsRef = useRef(null);
  const [osData, setOsData] = useState(null);
  const [chartsLoaded, setChartsLoaded] = useState(false);
  const [windowsData, setWindowsData] = useState(null);

  useEffect(() => {
    const initOsCharts = async () => {
      if (!osData || !windowsData) {
        await setOsData(await DataLoader.loadJSON(osJsonDataURL));
        await setWindowsData(await DataLoader.loadJSON(windowsDataURL));
      } else {
        let chartBuilder = new ChartBuilder();
        await chartBuilder.buildCompactBarChart(osRef.current, osData, "os");

        chartBuilder = new ChartBuilder();
        await chartBuilder.buildCompactBarChart(
          windowsRef.current,
          windowsData,
          "os_version",
        );

        await setChartsLoaded(true);
      }

      // nest the windows chart inside the OS chart once they're both rendered
      // TODO: Remove windows versions?
      if (chartsLoaded) {
        await d3
          .select(osRef.current)
          .call(nestCharts, "Windows", d3.select(windowsRef.current));
      }
    };
    initOsCharts().catch(console.error);
  }, [windowsData, chartsLoaded]);

  return (
    <div>
      <div className="chart__title">
        <a href="/definitions#dimension_operating_system">
          <Tooltip
            position="top"
            content="The name of the operating system used by the user's device."
          >
            Operating Systems
          </Tooltip>
        </a>
        <a href={osCsvDataURL} aria-label="os.csv">
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
      <figure id="chart_os" ref={osRef}>
        <div className="data chart__bar-chart text--capitalize margin-top-2"></div>
      </figure>
      <figure
        id="chart_windows"
        className="hide chart__bar-chart__nested"
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
