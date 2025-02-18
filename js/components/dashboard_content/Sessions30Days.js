import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import d3 from "d3";

import ChartBuilder from "../../lib/chart_helpers/chart_builder";
import DataLoader from "../../lib/data_loader";
import buildTimeSeries from "../../lib/chart_helpers/timeseries";
import formatters from "../../lib/chart_helpers/formatters";

/**
 * Retrieves the 30 days sessions report from the passed data URL and creates a
 * visualization for the count of sessions visiting sites for the current agency
 *
 * @param {object} props the properties for the component
 * @param {string} props.dataHrefBase the URL of the base location of the data
 * to be downloaded including the agency path. In production this is proxied and
 * redirected to the S3 bucket URL.
 * @returns {import('react').ReactElement} The rendered element
 */
function Sessions30Days({ dataHrefBase }) {
  const jsonDataURL = `${dataHrefBase}/daily-sessions-30-days.json`;
  const csvDataURL = `${dataHrefBase}/daily-sessions-30-days.csv`;
  const ref = useRef(null);
  const [sessionData, setSessionData] = useState(null);

  useEffect(() => {
    const initSessionsChart = async () => {
      if (!sessionData) {
        const data = await DataLoader.loadDailyReportJSON(jsonDataURL);
        await setSessionData(data);
      } else {
        const chartBuilder = new ChartBuilder();
        await chartBuilder
          .setElement(ref.current)
          .setData(sessionData)
          .setTransformer((data) => data)
          .setRenderer((svg, data) => {
            const days = data.data;
            days.forEach((d) => {
              d.visits = +d.visits;
            });

            const y = function (d) {
              return d.visits;
            };

            const series = buildTimeSeries()
              .series([data.data])
              .y(y)
              .label((d) => formatters.formatDate(d.date))
              .title(
                (d) =>
                  `${formatters.addCommas(d.visits)} visits during the day of ${d.date}`,
              );

            series.xScale().domain(d3.range(0, days.length + 1));

            series.yScale().domain([0, d3.max(days, y)]);

            series.yAxis().tickFormat(formatters.formatVisits());

            svg.call(series);
          })
          .build();
      }
    };
    initSessionsChart().catch(console.error);
  }, [sessionData]);

  return (
    <>
      <div className="chart__title">
        Daily Sessions
        <a href={csvDataURL} aria-label="daily-sessions-30-days.csv">
          <svg
            className="usa-icon margin-bottom-neg-05 margin-left-05"
            aria-hidden="true"
            focusable="false"
            role="img"
          >
            <use xlinkHref="/assets/uswds/img/sprite.svg#file_present"></use>
          </svg>
        </a>
      </div>
      <div className="chart__time-series__container" ref={ref}>
        <svg className="data chart__time-series"></svg>
      </div>
    </>
  );
}

Sessions30Days.propTypes = {
  dataHrefBase: PropTypes.string.isRequired,
};

export default Sessions30Days;
