import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

import DownloadReportFactory from "../../../../spec/factories/reports/download";
import { delay } from "../../../../spec/support/test_utilities";
import DataLoader from "../../../lib/data_loader";
import TopDownloads from "../TopDownloads";

jest.mock("../../../lib/data_loader", () => ({
  ...jest.requireActual("../../../lib/data_loader"),
  loadDailyReportJSON: jest.fn(),
}));

describe("TopDownloads", () => {
  let component;
  let data;

  describe("when data is not loaded", () => {
    beforeEach(async () => {
      DataLoader.loadDailyReportJSON.mockImplementation(() => {
        return Promise.resolve(null);
      });
      component = render(
        <TopDownloads
          dataHrefBase="http://www.example.com/data/"
          agency="Interior"
          numberOfListingsToDisplay={5}
        />,
      );
      await waitFor(() =>
        screen.getByText(
          "Top downloads data yesterday is unavailable for Interior hostnames.",
        ),
      );
    });

    it("renders a component in loading state", () => {
      expect(component.asFragment()).toMatchSnapshot();
    });
  });

  describe("when data is loaded", () => {
    beforeEach(async () => {
      data = DownloadReportFactory.build(
        {},
        { transient: { dataItemCount: 20 } },
      );

      data.data[0].file_name =
        "https://travel.state.gov/dv 2026 plain language instructions and faqs.pdf";

      DataLoader.loadDailyReportJSON.mockImplementation(() => {
        return Promise.resolve(data);
      });
      component = render(
        <TopDownloads
          dataHrefBase="http://www.example.com/data/"
          agency="Interior"
          numberOfListingsToDisplay={5}
        />,
      );
      await waitFor(() => screen.getByText(data.data[0].page));
      // Wait for barchart transition animation to complete (200 ms, set in
      // js/lib/chart_helpers/barchart.js)
      await delay(300);
    });

    it("renders a component with data loaded", () => {
      expect(component.asFragment()).toMatchSnapshot();
    });
  });

  describe("when data loading has an error", () => {
    const error = "you broke it";

    beforeEach(async () => {
      console.error = jest.fn();
      DataLoader.loadDailyReportJSON.mockImplementation(() => {
        return Promise.reject(error);
      });
      component = render(
        <TopDownloads
          dataHrefBase="http://www.example.com/data/"
          agency="Interior"
          numberOfListingsToDisplay={5}
        />,
      );
      await waitFor(() =>
        screen.getByText(
          "Top downloads data yesterday is unavailable for Interior hostnames.",
        ),
      );
    });

    it("renders a component in error state", () => {
      expect(component.asFragment()).toMatchSnapshot();
    });
  });
});
