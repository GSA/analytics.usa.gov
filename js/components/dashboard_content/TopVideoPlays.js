import React, { useRef, useEffect } from "react";
import PropTypes from "prop-types";
import d3 from "d3";

import ChartBuilder from "../../lib/chart_helpers/chart_builder";
import barChart from "../../lib/chart_helpers/barchart";
import { exceptions, titleExceptions } from "../../lib/exceptions";
import formatters from "../../lib/chart_helpers/formatters";

/**
 * Creates a visualization for the count of users playing videos for the current
 * agency.
 *
 * @param {object} props the properties for the component
 * @param {object} props.videoPlayData the video play report data to display
 * @param {number} props.numberOfListingsToDisplay the count of video play
 * listings to display in the bar chart.
 * @returns {import('react').ReactElement} The rendered element
 */
function TopVideoPlays({ videoPlayData, numberOfListingsToDisplay }) {
  const ref = useRef(null);

  useEffect(() => {
    const initVideoPlaysChart = async () => {
      const chartBuilder = new ChartBuilder();
      await chartBuilder
        .setElement(ref.current)
        .setData(videoPlayData)
        .setTransformer((d) => d.data.slice(0, numberOfListingsToDisplay))
        .setRenderer((selection) => {
          const barchartRenderer = barChart()
            .label((d) => d.video_title)
            .value((d) => +d.total_events)
            .scale((values) =>
              d3.scale
                .linear()
                .domain([0, 1, d3.max(values)])
                .rangeRound([0, 1, 100]),
            )
            .format(formatters.addCommas);

          barchartRenderer(selection);

          // turn the labels into links
          selection
            .selectAll(".chart__bar-chart__item__label")
            .each(function (d) {
              d.text = this.innerText;
            })
            .html("")
            .append("a")
            .attr("target", "_blank")
            .attr("rel", "noopener")
            .attr("href", (d) => exceptions[d.video_url] || d.video_url)
            .text((d) => titleExceptions[d.video_title] || d.video_title);
        })
        .build();
    };
    initVideoPlaysChart().catch(console.error);
  }, [videoPlayData, numberOfListingsToDisplay]);

  return (
    <figure className="top-video-plays__bar-chart" ref={ref}>
      <div className="data chart__bar-chart text--capitalize margin-top-2"></div>
    </figure>
  );
}

TopVideoPlays.propTypes = {
  videoPlayData: PropTypes.object.isRequired,
  numberOfListingsToDisplay: PropTypes.number.isRequired,
};

export default TopVideoPlays;
