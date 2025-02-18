import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

import { delay } from "../../../../spec/support/test_utilities";
import DataLoader from "../../../lib/data_loader";
import OperatingSystemsChart from "../OperatingSystemsChart";

jest.mock("../../../lib/data_loader", () => ({
  ...jest.requireActual("../../../lib/data_loader"),
  loadDailyReportJSON: jest.fn(),
}));

describe("OperatingSystemsChart", () => {
  let component;
  let osData;
  let windowsData;

  describe("when data is not loaded", () => {
    beforeEach(() => {
      DataLoader.loadDailyReportJSON.mockImplementation(() => {
        return Promise.resolve(null);
      });
      component = render(
        <OperatingSystemsChart dataHrefBase="http://www.example.com/data/" />,
      );
    });

    it("renders a component in loading state", () => {
      expect(component.asFragment()).toMatchSnapshot();
    });
  });

  describe("when data is loaded", () => {
    beforeEach(async () => {
      osData = {
        name: "os",
        query: {},
        meta: {
          name: "Operating Systems",
          description:
            "30 days of visits, broken down by operating system and date, for all sites. (>100 sessions)",
        },
        totals: {
          visits: 1493441196,
          by_os: {
            iOS: 545836253,
            Windows: 446590663,
            Android: 288132572,
            Macintosh: 149049201,
            Linux: 33028818,
            "(other)": 542273,
            "Chrome OS": 28865009,
            "": 24490,
            Tizen: 27195,
            "(not set)": 1272412,
            Fuchsia: 20999,
            "OS/2": 19323,
            "Firefox OS": 15342,
            "Playstation 4": 10575,
            FreeBSD: 3893,
            UNIX: 781,
            BlackBerry: 1397,
          },
        },
        taken_at: "2024-03-11T13:59:13.780Z",
      };
      windowsData = {
        name: "windows",
        query: {},
        meta: {
          name: "Windows",
          description:
            "30 days of visits from Windows users, broken down by operating system version and date, for all sites. (>100 sessions)",
        },
        totals: {
          visits: 43324723,
          by_os_version: {
            7: 388717,
            8: 457270,
            10: 33015928,
            11: 8088274,
            2000: 1194830,
            8.1: 171876,
            XP: 7722,
            Vista: 106,
          },
        },
        taken_at: "2024-03-11T14:11:24.185Z",
      };

      DataLoader.loadDailyReportJSON.mockImplementation((url) => {
        if (url.includes("os-yesterday.json")) {
          return Promise.resolve(osData);
        } else if (url.includes("windows-yesterday.json")) {
          return Promise.resolve(windowsData);
        }
      });
      component = render(
        <OperatingSystemsChart dataHrefBase="http://www.example.com/data/" />,
      );
      await waitFor(() => screen.getByText("8.1"));
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
        <OperatingSystemsChart dataHrefBase="http://www.example.com/data/" />,
      );
    });

    it("renders a component in error state", () => {
      expect(component.asFragment()).toMatchSnapshot();
    });
  });
});
