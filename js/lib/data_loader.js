import { startOfYesterday, isBefore, parseISO, subMinutes } from "date-fns";

/**
 * Handles loading JSON data from remote sources
 */
class DataLoader {
  /**
   * Uses the browser fetch method to make calls to the provided URL to retrieve
   * JSON data for daily reports.  If the request fails or the data retrieved is
   * stale, sends corresponding metrics to GA4 using the DAP code's gas4
   * function.
   *
   * @param {string} url The URL for which to fetch data.
   * @returns {Promise<*>} the response body from the URL parsed to JSON.
   */
  static async loadDailyReportJSON(url) {
    if (!url) {
      return Promise.reject("Invalid URL");
    }

    let response;

    try {
      response = await DataLoader.#getJSON(url);
      if (this.#responseDataBefore(response, startOfYesterday())) {
        gas4("dap_event", {
          event_category: "load_report_json",
          event_label: "stale_data",
          event_action: `GET: ${url}`,
        });
      }
      return response;
    } catch (e) {
      gas4("dap_event", {
        event_category: "load_report_json",
        event_label: "failed_request",
        event_action: `GET: ${url}`,
      });
      console.log(e);
      return Promise.reject(`Failed to load daily report JSON from ${url}`);
    }
  }

  /**
   * Uses the browser fetch method to make calls to the provided URL to retrieve
   * JSON data for realtime reports.  If the request fails or the data retrieved
   * is stale, sends corresponding metrics to GA4 using the DAP code's gas4
   * function.
   *
   * @param {string} url The URL for which to fetch data.
   * @returns {Promise<*>} the response body from the URL parsed to JSON.
   */
  static async loadRealtimeReportJSON(url) {
    if (!url) {
      return Promise.reject("Invalid URL");
    }

    let response;

    try {
      response = await DataLoader.#getJSON(url);
      if (this.#responseDataBefore(response, this.#minutesAgo(45))) {
        gas4("dap_event", {
          event_category: "load_report_json",
          event_label: "stale_data",
          event_action: `GET: ${url}`,
        });
      }
    } catch (e) {
      gas4("dap_event", {
        event_category: "load_report_json",
        event_label: "failed_request",
        event_action: `GET: ${url}`,
      });
      return Promise.reject(`Failed to load realtime report JSON from ${url}`);
    }

    return response;
  }

  static async #getJSON(url) {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "error",
    });
    const json = await response.json();

    return json;
  }

  static #responseDataBefore(response, referenceDate) {
    const responseDataTakenAt = parseISO(response.taken_at);

    return isBefore(responseDataTakenAt, referenceDate);
  }

  static #minutesAgo(minutes) {
    return subMinutes(new Date(), minutes);
  }
}

export default DataLoader;
