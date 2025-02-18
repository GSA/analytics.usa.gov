import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

import { delay } from "../../../../spec/support/test_utilities";
import DataLoader from "../../../lib/data_loader";
import TopLanguages from "../TopLanguages";

jest.mock("../../../lib/data_loader", () => ({
  ...jest.requireActual("../../../lib/data_loader"),
  loadDailyReportJSON: jest.fn(),
}));

describe("TopLanguages", () => {
  let component;
  let data;

  describe("when data is not loaded", () => {
    beforeEach(() => {
      DataLoader.loadDailyReportJSON.mockImplementation(() => {
        return Promise.resolve(null);
      });
      component = render(
        <TopLanguages dataHrefBase="http://www.example.com/data/" />,
      );
    });

    it("renders a component in loading state", () => {
      expect(component.asFragment()).toMatchSnapshot();
    });
  });

  describe("when data is loaded", () => {
    beforeEach(async () => {
      data = {
        name: "language",
        query: {},
        meta: {
          name: "Browser Language",
          description:
            "90 days of visits by browser language for all sites. (>10 sessions)",
        },
        totals: {
          visits: 4188421693,
          by_language: {
            English: 3811038327,
            Spanish: 220470343,
            Chinese: 38326396,
            French: 19117303,
            Japanese: 10171020,
            Portuguese: 11105949,
            German: 12988378,
            Italian: 6472652,
            Korean: 7082855,
            Russian: 10095454,
            Turkish: 5535267,
            Dutch: 3992621,
            Indonesian: 3077390,
            Polish: 2972422,
            Arabic: 3796983,
            Swedish: 2399832,
            Vietnamese: 2266598,
            Ukrainian: 1544534,
            "Norwegian Bokmål": 1414679,
            Danish: 1425160,
            Thai: 1294188,
          },
          by_language_code: {
            "en-us": 3592299784,
            "en-gb": 130460030,
            "es-419": 72377307,
            "es-us": 67268257,
            "es-es": 39872015,
            "zh-cn": 32226679,
            "en-ca": 29103005,
            "es-mx": 21143602,
            en: 18722007,
            "en-au": 16075630,
            "en-in": 14356792,
            "fr-fr": 12075009,
            es: 10618147,
            ja: 9335163,
            "pt-br": 9117027,
            "de-de": 9087969,
            "it-it": 5573122,
            "ko-kr": 5547917,
            "ru-ru": 5110051,
            "tr-tr": 5003308,
          },
        },
        taken_at: "2024-03-11T17:07:19.627Z",
      };

      DataLoader.loadDailyReportJSON.mockImplementation(() => {
        return Promise.resolve(data);
      });
      component = render(
        <TopLanguages dataHrefBase="http://www.example.com/data/" />,
      );
      await waitFor(() => screen.getByText("Chinese"));
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
        <TopLanguages dataHrefBase="http://www.example.com/data/" />,
      );
    });

    it("renders a component in error state", () => {
      expect(component.asFragment()).toMatchSnapshot();
    });
  });
});
