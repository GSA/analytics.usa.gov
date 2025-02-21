import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import * as d3 from "d3-7";

import DataLoader from "../../lib/data_loader";

/**
 * Retrieves the top viewed pages report from the passed data URL and creates a
 * visualization for the top pages by hostname.
 *
 * @param {object} props the properties for the component
 * @param {*} props.dataHrefBase the URL of the base location of the data
 * to be downloaded including the agency path. In production this is proxied and
 * redirected to the S3 bucket URL.
 * @returns {import('react').ReactElement} The rendered element
 */
function TopPagesCircleGraph({ dataHrefBase }) {
  const dataURL = `${dataHrefBase}/top-viewed-pages-7-days.json`;
  const ref = useRef(null);
  const [maxDomains] = useState(35);
  const [maxPagesPerDomain] = useState(75);

  useEffect(() => {
    const initChart = async () => {
      await loadDataAndBuildChart();
    };
    initChart().catch(console.error);
  }, []);

  async function loadDataAndBuildChart() {
    const report = await loadData();

    if (report) {
      drawChart(transformData(report.data));
    }
  }

  async function loadData() {
    let report;

    try {
      report = await DataLoader.loadJSON(dataURL);
    } catch (e) {
      report = { data: [] };
    }

    return report;
  }

  function transformData(data) {
    const transformedData = {
      name: "flare",
    };
    const grouped = Object.groupBy(data, (item) => {
      return item.domain;
    });
    transformedData.children = Object.keys(grouped)
      .map((key) => {
        return {
          name: key,
          children: grouped[key].slice(0, maxPagesPerDomain).map((item) => {
            return { name: item.pagePath, value: parseInt(item.pageviews) };
          }),
        };
      })
      .slice(0, maxDomains);

    return transformedData;
  }

  function drawChart(transformedData) {
    // Specify the chart’s dimensions.
    const width = 928;
    const height = width;

    // Create the color scale.
    const color = d3
      .scaleLinear()
      .domain([0, 5])
      .range(["hsl(190, 74%, 59%)", "hsl(239, 94%, 19%)"])
      .interpolate(d3.interpolateHcl);

    const pack = (data) => {
      // Compute the layout.
      return d3.pack().size([width, height]).padding(3)(
        d3
          .hierarchy(data)
          .sum((d) => d.value)
          .sort((a, b) => b.value - a.value),
      );
    };
    const root = pack(transformedData);

    // Create the SVG container.
    const svg = d3
      .select(ref.current)
      .append("svg")
      .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
      .attr("width", width)
      .attr("height", height)
      .attr(
        "class",
        "height-auto maxw-full display-block bg-palette-color-7 cursor-pointer",
      );

    // Append the nodes.
    const node = svg
      .append("g")
      .selectAll("circle")
      .data(root.descendants().slice(1))
      .join("circle")
      .attr("fill", (d) => (d.children ? color(d.depth) : "white"))
      .attr("pointer-events", (d) => (!d.children ? "none" : null))
      .on("mouseover", function () {
        d3.select(this).attr("stroke", "#000");
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke", null);
      })
      .on(
        "click",
        (event, d) => focus !== d && (zoom(event, d), event.stopPropagation()),
      );

    // Append the text labels.
    const label = svg
      .append("g")
      .style("font", "18px sans-serif")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .selectAll("text")
      .data(root.descendants())
      .join("text")
      .style("fill-opacity", (d) => (d.parent === root ? 1 : 0))
      .style("display", (d) => (d.parent === root ? "inline" : "none"))
      .text((d) => d.data.name);

    // Create the zoom behavior and zoom immediately in to the initial focus node.
    svg.on("click", (event) => zoom(event, root));
    let focus = root;
    let view;
    zoomTo([focus.x, focus.y, focus.r * 2]);

    function zoomTo(v) {
      const k = width / v[2];

      view = v;

      label.attr(
        "transform",
        (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`,
      );
      node.attr(
        "transform",
        (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`,
      );
      node.attr("r", (d) => d.r * k);
    }

    function zoom(event, d) {
      focus = d;

      const transition = svg
        .transition()
        .duration(event.altKey ? 7500 : 750)
        .tween("zoom", () => {
          const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
          return (t) => zoomTo(i(t));
        });

      label
        .filter(function (d) {
          return d.parent === focus || this.style.display === "inline";
        })
        .transition(transition)
        .style("fill-opacity", (d) => (d.parent === focus ? 1 : 0))
        .on("start", function (d) {
          if (d.parent === focus) this.style.display = "inline";
        })
        .on("end", function (d) {
          if (d.parent !== focus) this.style.display = "none";
        });
    }

    //return svg.node();
  }

  return (
    <>
      <div className="grid-row">
        <h2 className="grid-col-12 text-center">
          Top Hostnames and Page Paths
        </h2>
      </div>
      <div className="grid-row">
        <div className="desktop:grid-offset-3 desktop:grid-col-6 card:grid-col-12">
          <figure className="display-block margin-auto" ref={ref}></figure>
        </div>
      </div>
    </>
  );
}

TopPagesCircleGraph.propTypes = {
  dataHrefBase: PropTypes.string.isRequired,
};

export default TopPagesCircleGraph;
