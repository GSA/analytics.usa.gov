import d3 from "d3";
import Config from "../config";

/**
 * @returns {*} a D3 block which charts data
 */
export default function barChart() {
  let bars = function (d) {
    return d;
  };

  let value = function (d) {
    return d.value;
  };

  let format = String;

  let label = function (d) {
    return d.key;
  };

  let scale = null;

  const size = function (n) {
    return `${Math.round(n || 0)}%`;
  };

  const chart = function (selection) {
    const bin = selection
      .selectAll(":scope > .chart__bar-chart__item")
      .data(bars);

    bin.exit().remove();

    const enter = bin
      .enter()
      .append("div")
      .attr("class", "chart__bar-chart__item margin-bottom-2");
    enter
      .append("div")
      .attr(
        "class",
        "chart__bar-chart__item__label dark-grey text--overflow-ellipsis margin-right-8",
      );
    enter.append("div").attr("class", "chart__bar-chart__item__value");
    enter
      .append("div")
      .attr(
        "class",
        "chart__bar-chart__item__bar bg-palette-color-5 margin-top-0",
      )
      .style("width", "0%");

    const componentScale = scale
      ? scale.call(selection, bin.data().map(value))
      : null;
    bin
      .select(".chart__bar-chart__item__bar")
      .transition()
      .duration(Config.barchartTransitionDurationMs)
      .style(
        "width",
        componentScale
          ? (d) => size(componentScale(value(d)))
          : (d) => size(value(d)),
      );

    bin.select(".chart__bar-chart__item__label").html(label);
    bin.select(".chart__bar-chart__item__value").text(function (d, i) {
      return format.call(this, value(d), d, i);
    });
  };

  chart.bars = function (x) {
    if (!arguments.length) return bars;
    bars = d3.functor(x);
    return chart;
  };

  chart.label = function (x) {
    if (!arguments.length) return label;
    label = d3.functor(x);
    return chart;
  };

  chart.value = function (x) {
    if (!arguments.length) return value;
    value = d3.functor(x);
    return chart;
  };

  chart.format = function (x) {
    if (!arguments.length) return format;
    format = d3.functor(x);
    return chart;
  };

  chart.scale = function (x) {
    if (!arguments.length) return scale;
    scale = d3.functor(x);
    return chart;
  };

  return chart;
}
