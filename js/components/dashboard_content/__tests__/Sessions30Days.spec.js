import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

import { delay } from "../../../../spec/support/test_utilities";
import DataLoader from "../../../lib/data_loader";
import Sessions30Days from "../Sessions30Days";

jest.mock("../../../lib/data_loader", () => ({
  ...jest.requireActual("../../../lib/data_loader"),
  loadDailyReportJSON: jest.fn(),
}));

describe("Sessions30Days", () => {
  let component;
  let data;

  describe("when data is not loaded", () => {
    beforeEach(() => {
      DataLoader.loadDailyReportJSON.mockImplementation(() => {
        return Promise.resolve(null);
      });
      component = render(
        <Sessions30Days dataHrefBase="http://www.example.com/data/" />,
      );
    });

    it("renders a component in loading state", () => {
      expect(component.asFragment()).toMatchSnapshot();
    });
  });

  describe("when data is loaded", () => {
    beforeEach(async () => {
      data = {
        name: "sessions-over-30-days",
        query: {},
        meta: {
          name: "Sessions Over 30 Days",
          description: "Visits for all sites over 30 days.",
        },
        data: [
          {
            date: "2023-12-17",
            visits: "29515461",
          },
          {
            date: "2023-12-18",
            visits: "51017053",
          },
          {
            date: "2023-12-19",
            visits: "48308250",
          },
        ],
        totals: {
          visits: 1186512188,
        },
        taken_at: "2024-01-16T19:50:29.099Z",
      };

      DataLoader.loadDailyReportJSON.mockImplementation(() => {
        return Promise.resolve(data);
      });
      component = render(
        <Sessions30Days dataHrefBase="http://www.example.com/data/" />,
      );
      await waitFor(() => screen.getByText("12/17"));
      // Wait for barchart transition animation to complete (200 ms, set in
      // js/lib/chart_helpers/barchart.js)
      await delay(300);
    });

    // The timeseries data intermittently has slightly different values for
    // y values, height, opacity of ticks. So rather than using a snapshot of
    // the fully rendered component, instead verify that the data is loaded to
    // the screen by searching for text.
    it("renders a component with data loaded", async () => {
      expect(
        await screen.findByText(
          "29,515,461 visits during the day of 2023-12-17",
        ),
      ).not.toBeNull();
      expect(
        await screen.findByText(
          "51,017,053 visits during the day of 2023-12-18",
        ),
      ).not.toBeNull();
      expect(
        await screen.findByText(
          "48,308,250 visits during the day of 2023-12-19",
        ),
      ).not.toBeNull();
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
        <Sessions30Days dataHrefBase="http://www.example.com/data/" />,
      );
    });

    it("renders a component in error state", () => {
      expect(component.asFragment()).toMatchSnapshot();
    });

    it("logs the error to console", () => {
      expect(console.error).toHaveBeenCalledWith(error);
    });
  });
});
