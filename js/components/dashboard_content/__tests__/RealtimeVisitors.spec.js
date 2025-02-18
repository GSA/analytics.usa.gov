import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

import RealtimeVisitors from "../RealtimeVisitors";
import DataLoader from "../../../lib/data_loader";

jest.mock("../../../lib/data_loader", () => ({
  ...jest.requireActual("../../../lib/data_loader"),
  loadRealtimeReportJSON: jest.fn(),
}));

describe("RealtimeVisitors", () => {
  let component;
  let data;

  describe("when data is not loaded", () => {
    beforeEach(() => {
      DataLoader.loadRealtimeReportJSON.mockImplementation(() => {
        return Promise.resolve(null);
      });
      component = render(
        <RealtimeVisitors
          dataHrefBase="http://www.example.com/data/"
          agency="Department of Defense"
          refreshSeconds={30}
        />,
      );
    });

    it("renders a component in loading state", () => {
      expect(component.asFragment()).toMatchSnapshot();
    });
  });

  describe("when data is loaded", () => {
    beforeEach(async () => {
      data = {
        name: "realtime",
        query: {
          metrics: [
            {
              name: "activeUsers",
            },
          ],
          samplingLevel: "HIGHER_PRECISION",
          limit: "10000",
          property: "properties/393249053",
        },
        meta: {
          name: "Active Users Right Now",
          description: "Number of users currently visiting all sites.",
        },
        data: [
          {
            activeUsers: "10003538",
          },
        ],
        totals: {},
        taken_at: "2024-01-05T16:05:45.980Z",
      };

      DataLoader.loadRealtimeReportJSON.mockImplementation(() => {
        return Promise.resolve(data);
      });
      component = render(
        <RealtimeVisitors
          dataHrefBase="http://www.example.com/data/"
          agency="Department of Defense"
          refreshSeconds={30}
        />,
      );
      await waitFor(() => screen.getByText("10,003,538"));
    });

    it("renders a component with data loaded", () => {
      expect(component.asFragment()).toMatchSnapshot();
    });
  });

  describe("when data loading has an error", () => {
    const error = "you broke it";

    beforeEach(() => {
      console.error = jest.fn();
      DataLoader.loadRealtimeReportJSON.mockImplementation(() => {
        return Promise.reject(error);
      });
      component = render(
        <RealtimeVisitors
          dataHrefBase="http://www.example.com/data/"
          agency="Department of Defense"
          refreshSeconds={30}
        />,
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
