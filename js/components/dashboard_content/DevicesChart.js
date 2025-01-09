import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";

import ChartBuilder from "../../lib/chart_helpers/chart_builder";
import DataLoader from "../../lib/data_loader";
import barChart from "../../lib/chart_helpers/barchart";
import formatters from "../../lib/chart_helpers/formatters";
import transformers from "../../lib/chart_helpers/transformers";
import Tooltip from "../tooltip/Tooltip";

/**
 * Retrieves the devices report from the passed data URL and creates a
 * visualization for the breakdown of devices of users visiting sites for the
 * current agency.
 *
 * @param {object} props the properties for the component
 * @param {string} props.dataHrefBase the URL of the base location of the data
 * to be downloaded including the agency path. In production this is proxied and
 * redirected to the S3 bucket URL.
 * @returns {import('react').ReactElement} The rendered element
 */
function DevicesChart({ dataHrefBase }) {
  const jsonDataURL = `${dataHrefBase}/devices.json`;
  const csvDataURL = `${dataHrefBase}/devices.csv`;
  const ref = useRef(null);
  const [deviceData, setDeviceData] = useState(null);

  useEffect(() => {
    const initDevicesChart = async () => {
      if (!deviceData) {
        const data = await DataLoader.loadJSON(jsonDataURL);
        await setDeviceData(data);
      } else {
        const chartBuilder = new ChartBuilder();
        await chartBuilder
          .setElement(ref.current)
          .setData(deviceData)
          .setTransformer((d) => {
            const devices = transformers.listify(d.totals.by_device);
            devices.forEach((device) => {
              if (device.key === "smart tv") {
                device.key = "Smart TV";
              }
            });
            return transformers.findProportionsOfMetricFromValue(devices);
          })
          .setRenderer(
            barChart()
              .value((d) => d.proportion)
              .format(formatters.floatToPercent),
          )
          .build();
      }
    };
    initDevicesChart().catch(console.error);
  }, [deviceData]);

  return (
    <>
      <div className="chart__title">
        <a href="/definitions#dimension_device_category">
          <Tooltip
            position="top"
            content="The type category of the device used by the user to access the site or application."
          >
            Devices
          </Tooltip>
        </a>
        <a href={csvDataURL} aria-label="devices.csv">
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
      <figure id="chart_device_types" ref={ref}>
        <div className="data chart__bar-chart text--capitalize margin-top-2"></div>
      </figure>
    </>
  );
}

DevicesChart.propTypes = {
  dataHrefBase: PropTypes.string.isRequired,
};

export default DevicesChart;
