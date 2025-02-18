import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

import AverageEngagementDuration from "../AverageEngagementDuration";
import DataLoader from "../../../lib/data_loader";

jest.mock("../../../lib/data_loader", () => ({
  ...jest.requireActual("../../../lib/data_loader"),
  loadDailyReportJSON: jest.fn(),
}));

describe("AverageEngagementDuration", () => {
  let component;
  let data;

  describe("when data is not loaded", () => {
    beforeEach(() => {
      DataLoader.loadDailyReportJSON.mockImplementation(() => {
        return Promise.resolve(null);
      });
      component = render(
        <AverageEngagementDuration dataHrefBase="http://www.example.com/data/" />,
      );
    });

    it("renders a component in loading state", () => {
      expect(component.asFragment()).toMatchSnapshot();
    });
  });

  describe("when data is loaded", () => {
    beforeEach(async () => {
      data = {
        name: "user-engagement-duration",
        query: {
          metrics: [
            {
              name: "userEngagementDuration",
            },
            {
              name: "sessions",
            },
          ],
          dateRanges: [
            {
              startDate: "30daysAgo",
              endDate: "yesterday",
            },
          ],
          limit: "10000",
          property: "properties/397708109",
        },
        meta: {
          name: "User engagement duration (30 Days)",
          description:
            "Top 20 sources that initiated a session for the last 30 days, measured by visits, for all sites.",
        },
        data: [
          {
            userEngagementDuration: "101105154773",
            visits: "1616841012",
          },
        ],
        totals: {
          visits: 1616841012,
        },
        taken_at: "2024-03-19T20:58:28.812Z",
      };

      DataLoader.loadDailyReportJSON.mockImplementation(() => {
        return Promise.resolve(data);
      });
      component = render(
        <AverageEngagementDuration dataHrefBase="http://www.example.com/data/" />,
      );
      await waitFor(() => screen.getByText("1 min 3 sec"));
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
        <AverageEngagementDuration dataHrefBase="http://www.example.com/data/" />,
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
