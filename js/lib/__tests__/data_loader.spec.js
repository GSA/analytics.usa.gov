import { startOfYesterday, subDays, subMinutes } from "date-fns";

import DataLoader from "../data_loader";
import ReportFactory from "../../../spec/factories/report";

describe("DataLoader", () => {
  let subject;

  beforeEach(() => {
    global.fetch = jest.fn();
    window.gas4 = jest.fn();
    subject = DataLoader;
  });

  describe("loadDailyReportJSON", () => {
    const fetchOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "error",
    };

    describe("when url is missing", () => {
      let actual;

      beforeEach(async () => {
        try {
          actual = await subject.loadDailyReportJSON();
        } catch (error) {
          actual = error;
        }
      });

      it("throws", () => {
        expect(actual).toEqual("Invalid URL");
      });
    });

    describe("when URL is provided", () => {
      describe("and the request is successful", () => {
        describe("and the report data has been updated sooner than the start of yesterday", () => {
          const mockData = ReportFactory.build({
            taken_at: new Date().toISOString(),
          });
          const url = "https://www.example.com/reports";
          let actual;

          beforeEach(async () => {
            global.fetch.mockImplementation(() => {
              return Promise.resolve({
                json: () => {
                  return mockData;
                },
              });
            });
            actual = await subject.loadDailyReportJSON(url);
          });

          it("sends a request with the expected params", () => {
            expect(global.fetch).toHaveBeenCalledWith(url, fetchOptions);
          });

          it("does not send a metric to GA4", () => {
            expect(global.gas4).not.toHaveBeenCalled();
          });

          it("returns the expected data", () => {
            expect(actual).toEqual(mockData);
          });
        });

        describe("and the report data has been updated previous to the start of yesterday", () => {
          const mockData = ReportFactory.build({
            taken_at: subDays(startOfYesterday(), 1).toISOString(),
          });
          const url = "https://www.example.com/reports";
          let actual;

          beforeEach(async () => {
            global.fetch.mockImplementation(() => {
              return Promise.resolve({
                json: () => {
                  return mockData;
                },
              });
            });
            actual = await subject.loadDailyReportJSON(url);
          });

          it("sends a request with the expected params", () => {
            expect(global.fetch).toHaveBeenCalledWith(url, fetchOptions);
          });

          it("sends a metric to GA4 for stale data", () => {
            expect(global.gas4).toHaveBeenCalledWith("dap_event", {
              event_category: "load_report_json",
              event_label: "stale_data",
              event_action: `GET: ${url}`,
            });
          });

          it("returns the expected data", () => {
            expect(actual).toEqual(mockData);
          });
        });
      });

      describe("and the request has an error", () => {
        const url = "https://www.example.com/reports";
        let actual;

        beforeEach(async () => {
          global.fetch.mockImplementation(() => {
            return Promise.reject("you broke it");
          });

          try {
            actual = await subject.loadDailyReportJSON(url);
          } catch (error) {
            actual = error;
          }
        });

        it("sends a request with the expected params", () => {
          expect(global.fetch).toHaveBeenCalledWith(url, fetchOptions);
        });

        it("sends a metric to GA4 for a failed request", () => {
          expect(global.gas4).toHaveBeenCalledWith("dap_event", {
            event_category: "load_report_json",
            event_label: "failed_request",
            event_action: `GET: ${url}`,
          });
        });

        it("returns an error describing the failed request", () => {
          expect(actual).toEqual(
            `Failed to load daily report JSON from ${url}`,
          );
        });
      });
    });
  });

  describe("loadRealtimeReportJSON", () => {
    const fetchOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "error",
    };

    describe("when url is missing", () => {
      let actual;

      beforeEach(async () => {
        try {
          actual = await subject.loadRealtimeReportJSON();
        } catch (error) {
          actual = error;
        }
      });

      it("throws", () => {
        expect(actual).toEqual("Invalid URL");
      });
    });

    describe("when URL is provided", () => {
      describe("and the request is successful", () => {
        describe("and the report data has been updated sooner than the start of yesterday", () => {
          const mockData = ReportFactory.build({
            taken_at: new Date().toISOString(),
          });
          const url = "https://www.example.com/reports";
          let actual;

          beforeEach(async () => {
            global.fetch.mockImplementation(() => {
              return Promise.resolve({
                json: () => {
                  return mockData;
                },
              });
            });
            actual = await subject.loadRealtimeReportJSON(url);
          });

          it("sends a request with the expected params", () => {
            expect(global.fetch).toHaveBeenCalledWith(url, fetchOptions);
          });

          it("does not send a metric to GA4", () => {
            expect(global.gas4).not.toHaveBeenCalled();
          });

          it("returns the expected data", () => {
            expect(actual).toEqual(mockData);
          });
        });

        describe("and the report data has been updated previous to the start of yesterday", () => {
          const mockData = ReportFactory.build({
            taken_at: subMinutes(new Date(), 60).toISOString(),
          });
          const url = "https://www.example.com/reports";
          let actual;

          beforeEach(async () => {
            global.fetch.mockImplementation(() => {
              return Promise.resolve({
                json: () => {
                  return mockData;
                },
              });
            });
            actual = await subject.loadRealtimeReportJSON(url);
          });

          it("sends a request with the expected params", () => {
            expect(global.fetch).toHaveBeenCalledWith(url, fetchOptions);
          });

          it("sends a metric to GA4 for stale data", () => {
            expect(global.gas4).toHaveBeenCalledWith("dap_event", {
              event_category: "load_report_json",
              event_label: "stale_data",
              event_action: `GET: ${url}`,
            });
          });

          it("returns the expected data", () => {
            expect(actual).toEqual(mockData);
          });
        });
      });

      describe("and the request has an error", () => {
        const url = "https://www.example.com/reports";
        let actual;

        beforeEach(async () => {
          global.fetch.mockImplementation(() => {
            return Promise.reject("you broke it");
          });

          try {
            actual = await subject.loadRealtimeReportJSON(url);
          } catch (error) {
            actual = error;
          }
        });

        it("sends a request with the expected params", () => {
          expect(global.fetch).toHaveBeenCalledWith(url, fetchOptions);
        });

        it("sends a metric to GA4 for a failed request", () => {
          expect(global.gas4).toHaveBeenCalledWith("dap_event", {
            event_category: "load_report_json",
            event_label: "failed_request",
            event_action: `GET: ${url}`,
          });
        });

        it("returns an error describing the failed request", () => {
          expect(actual).toEqual(
            `Failed to load realtime report JSON from ${url}`,
          );
        });
      });
    });
  });
});
