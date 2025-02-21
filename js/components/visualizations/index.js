import React from "react";
import { createRoot } from "react-dom/client";
import Visualizations from "./Visualizations";

/**
 * Renders a Visualizations React component, when there is an element on the
 * current page with id 'visualizations-root'.
 *
 * The DashboardContent component will be rendered as a child to the matching
 * element.
 */

const domNode = document.getElementById("visualizations-root");

if (domNode) {
  const root = createRoot(domNode);
  const dataURL = domNode.attributes.getNamedItem("dataurl").value;
  const dataPrefix = domNode.attributes.getNamedItem("dataprefix")?.value;
  root.render(
    <Visualizations
      dataURL={dataURL}
      dataPrefix={dataPrefix}
      agency="U.S. Federal Government"
    />,
  );
}
