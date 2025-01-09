import React from "react";
import PropTypes from "prop-types";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";

import Config from "../../lib/config";
import TopDownloadsAndVideoPlays from "./TopDownloadsAndVideoPlays";
import TopPagesRealtime from "./TopPagesRealtime";
import TopPagesHistorical from "./TopPagesHistorical";
import Tooltip from "../tooltip/Tooltip";

/**
 * Contains charts and other data visualizations for the top pages, top
 * downloads, and top video plays section of the site. This component is mainly
 * laying out the structure for the section, including tabs/panels, and passes
 * props necessary for getting data and displaying visualizations to child
 * components. The top pages chart, top downloads chart, and top video plays
 * displayed correspond to the time interval selected in the tabs.
 *
 *
 * Note that the 30 minutes time interval is how often Google Analytics 4
 * updates realtime reports. The dimensions/metrics needed to report on file
 * downloads are not available in the realtime reporting API, so for the 30
 * minute time interval, show top downloads and top video plays for the past day
 * (the shortest time interval allowed for the non-realtime reporting API.)
 *
 * @param {object} props the properties for the component
 * @param {string} props.dataHrefBase the URL of the base location of the data
 * to be downloaded including the agency path. In production this is proxied and
 * redirected to the S3 bucket URL.
 * @param {string} props.agency the display name for the current agency.
 * @returns {import('react').ReactElement} The rendered element
 */
function SidebarContent({ dataHrefBase, agency }) {
  const numberOfTopPagesToDisplay = 30;

  return (
    <section className="sidebar">
      <div className="sidebar__headline">
        <h2 className="margin-top-0">
          <a href="/definitions#report_realtime_top_pages">
            Top {numberOfTopPagesToDisplay} Web Pages and App Screens
          </a>
          <Tooltip
            position="top"
            content="The top webpages and/or applications based on the number of sessions for the page or hostname."
          >
            <svg
              className="usa-icon margin-bottom-neg-05 margin-left-05"
              aria-hidden="true"
              focusable="false"
              role="img"
            >
              <use xlinkHref="/assets/uswds/img/sprite.svg#info"></use>
            </svg>
          </Tooltip>
        </h2>
      </div>
      <Tabs>
        <TabList className="sidebar__tab-select__button-group usa-button-group usa-button-group--segmented">
          <Tab className="sidebar__tab-select__button-group__item usa-button-group__item">
            <a
              className="sidebar__tab-select__button usa-button"
              aria-label="30 mins"
            >
              30 mins
            </a>
          </Tab>
          <Tab className="sidebar__tab-select__button-group__item usa-button-group__item">
            <a
              className="sidebar__tab-select__button usa-button"
              aria-label="7 days"
            >
              7 days
            </a>
          </Tab>
          <Tab className="sidebar__tab-select__button-group__item usa-button-group__item">
            <a
              className="sidebar__tab-select__button usa-button"
              aria-label="30 days"
            >
              30 days
            </a>
          </Tab>
        </TabList>

        <TabPanel>
          <section className="sidebar__tab__content padding-bottom-1 border-bottom-1px border-base-light">
            <p className="margin-bottom-1">
              <strong>Users</strong> on a{" "}
              <strong>single, specific page or app screen</strong> in the last
              30 minutes. Hostnames are not currently reported in real-time, so
              only page title and screen name information is available.
            </p>
            <p className="margin-top-05 margin-bottom-105">
              <a
                href={`${dataHrefBase}/top-pages-realtime.csv`}
                aria-label="top-pages-realtime.csv"
              >
                Download the data
                <svg
                  className="usa-icon margin-bottom-neg-05 margin-left-05"
                  aria-hidden="true"
                  focusable="false"
                  role="img"
                >
                  <use xlinkHref="/assets/uswds/img/sprite.svg#file_download"></use>
                </svg>
              </a>
            </p>
            <TopPagesRealtime
              dataHrefBase={dataHrefBase}
              reportFileName="top-pages-realtime.json"
              numberOfListingsToDisplay={numberOfTopPagesToDisplay}
              refreshSeconds={Config.realtimeDataRefreshSeconds}
            />
          </section>
          <TopDownloadsAndVideoPlays
            dataHrefBase={dataHrefBase}
            agency={agency}
            downloadsReportFileName="top-downloads-yesterday"
            videoPlaysReportFileName="top-video-plays-yesterday"
            timeIntervalHeader="Yesterday"
            timeIntervalDescription="yesterday"
          />
        </TabPanel>
        <TabPanel>
          <section className="sidebar__tab__content padding-bottom-1 border-bottom-1px border-base-light">
            <p className="margin-bottom-1">
              Sessions over the last week on <strong>hostnames</strong>,
              including traffic to all web pages and app screens within that
              hostname.
            </p>
            <p className="margin-top-05 margin-bottom-105">
              <a
                href={`${dataHrefBase}/top-domains-7-days.csv`}
                aria-label="top-domains-7-days.csv"
              >
                Download the data
                <svg
                  className="usa-icon margin-bottom-neg-05 margin-left-05"
                  aria-hidden="true"
                  focusable="false"
                  role="img"
                >
                  <use xlinkHref="/assets/uswds/img/sprite.svg#file_download"></use>
                </svg>
              </a>
            </p>
            <TopPagesHistorical
              dataHrefBase={dataHrefBase}
              reportFileName="top-domains-7-days.json"
              numberOfListingsToDisplay={numberOfTopPagesToDisplay}
            />
          </section>
          <TopDownloadsAndVideoPlays
            dataHrefBase={dataHrefBase}
            agency={agency}
            downloadsReportFileName="top-downloads-7-days"
            videoPlaysReportFileName="top-video-plays-7-days"
            timeIntervalHeader="Last 7 Days"
            timeIntervalDescription="over the last week"
          />
        </TabPanel>
        <TabPanel>
          <section className="sidebar__tab__content padding-bottom-1 border-bottom-1px border-base-light">
            <p className="margin-bottom-1">
              Sessions over the last month on <strong>hostnames</strong>,
              including traffic to all web pages and app screens within that
              hostname.
            </p>
            <p className="margin-top-05 margin-bottom-105">
              <a
                href={`${dataHrefBase}/top-100000-domains-30-days.csv`}
                aria-label="top-100000-domains-30-days.csv"
              >
                Download the data
                <svg
                  className="usa-icon margin-bottom-neg-05 margin-left-05"
                  aria-hidden="true"
                  focusable="false"
                  role="img"
                >
                  <use xlinkHref="/assets/uswds/img/sprite.svg#file_download"></use>
                </svg>
              </a>
            </p>
            <TopPagesHistorical
              dataHrefBase={dataHrefBase}
              reportFileName="top-domains-30-days.json"
              numberOfListingsToDisplay={numberOfTopPagesToDisplay}
            />
          </section>
          <TopDownloadsAndVideoPlays
            dataHrefBase={dataHrefBase}
            agency={agency}
            downloadsReportFileName="top-downloads-30-days"
            videoPlaysReportFileName="top-video-plays-30-days"
            timeIntervalHeader="Last 30 Days"
            timeIntervalDescription="over the last month"
          />
        </TabPanel>
      </Tabs>
    </section>
  );
}

SidebarContent.propTypes = {
  dataHrefBase: PropTypes.string.isRequired,
  agency: PropTypes.string.isRequired,
};

export default SidebarContent;
