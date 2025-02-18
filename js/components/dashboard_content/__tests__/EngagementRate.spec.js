import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

import DataLoader from "../../../lib/data_loader";
import EngagementRate from "../EngagementRate";

jest.mock("../../../lib/data_loader", () => ({
  ...jest.requireActual("../../../lib/data_loader"),
  loadDailyReportJSON: jest.fn(),
}));

describe("EngagementRate", () => {
  let component;
  let data;

  describe("when data is not loaded", () => {
    beforeEach(() => {
      DataLoader.loadDailyReportJSON.mockImplementation(() => {
        return Promise.resolve(null);
      });
      component = render(
        <EngagementRate dataHrefBase="http://www.example.com/data/" />,
      );
    });

    it("renders a component in loading state", () => {
      expect(component.asFragment()).toMatchSnapshot();
    });
  });

  describe("when data is loaded", () => {
    beforeEach(async () => {
      data = {
        name: "engagement-rate",
        query: {
          metrics: [
            {
              name: "engagementRate",
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
          name: "Engagement rate (30 Days)",
          description:
            "Percent of sessions where the user was engaged over the past 30 days.",
        },
        data: [
          {
            engagementRate: "0.567412736435461",
          },
        ],
        totals: {},
        taken_at: "2024-03-20T02:14:07.426Z",
      };

      DataLoader.loadDailyReportJSON.mockImplementation(() => {
        return Promise.resolve(data);
      });
      component = render(
        <EngagementRate dataHrefBase="http://www.example.com/data/" />,
      );
      await waitFor(() => screen.getByText("56.7%"));
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
        <EngagementRate dataHrefBase="http://www.example.com/data/" />,
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
