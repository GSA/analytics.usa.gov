import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

import { delay } from "../../../../spec/support/test_utilities";
import BrowsersChart from "../BrowsersChart";
import DataLoader from "../../../lib/data_loader";

jest.mock("../../../lib/data_loader", () => ({
  ...jest.requireActual("../../../lib/data_loader"),
  loadDailyReportJSON: jest.fn(),
}));

describe("BrowsersChart", () => {
  let component;
  let data;

  describe("when data is not loaded", () => {
    beforeEach(() => {
      DataLoader.loadDailyReportJSON.mockImplementation(() => {
        return Promise.resolve(null);
      });
      component = render(
        <BrowsersChart dataHrefBase="http://www.example.com/data/" />,
      );
    });

    it("renders a component in loading state", () => {
      expect(component.asFragment()).toMatchSnapshot();
    });
  });

  describe("when data is loaded", () => {
    beforeEach(async () => {
      data = {
        name: "browsers",
        query: {},
        meta: {
          name: "Browsers",
          description:
            "30 days of visits broken down by browser for all sites. (>100 sessions)",
        },
        totals: {
          visits: 1492721065,
          by_browser: {
            Chrome: 724669791,
            Safari: 532418559,
            Edge: 131456418,
            "Safari (in-app)": 28370663,
            Firefox: 28673898,
            "(other)": 542273,
            "Samsung Internet": 21535617,
            "Android Webview": 14658083,
            Opera: 3256137,
            "Amazon Silk": 2018466,
            "(not set)": 1299162,
            "Mozilla Compatible Agent": 882647,
            YaBrowser: 499856,
            "Internet Explorer": 1883528,
            "Whale Browser": 123256,
            "Coc Coc": 56684,
            "UC Browser": 119932,
            "Opera Mini": 49514,
            "Aloha Browser": 26440,
            Vivaldi: 14972,
            Mozilla: 27911,
            "Android Runtime": 22723,
            "Android Browser": 9271,
            "DuckDuckGo Browser": 13066,
            PaleMoon: 12977,
            "Meta Quest Browser": 8586,
            "Phoenix Browser": 8795,
            SeaMonkey: 9990,
            Lynx: 38014,
            Waterfox: 2841,
            Iron: 9347,
            Seznam: 1204,
            Puffin: 444,
          },
        },
        taken_at: "2024-03-11T13:59:19.359Z",
      };

      DataLoader.loadDailyReportJSON.mockImplementation(() => {
        return Promise.resolve(data);
      });

      component = render(
        <BrowsersChart dataHrefBase="http://www.example.com/data/" />,
      );

      await waitFor(() => screen.getByText("Chrome"));
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

    beforeEach(() => {
      console.error = jest.fn();
      DataLoader.loadDailyReportJSON.mockImplementation(() => {
        return Promise.reject(error);
      });
      component = render(
        <BrowsersChart dataHrefBase="http://www.example.com/data/" />,
      );
    });

    it("renders a component in error state", () => {
      expect(component.asFragment()).toMatchSnapshot();
    });
  });
});
