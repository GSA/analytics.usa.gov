import React from "react";
import PropTypes from "prop-types";

import Config from "../../lib/config";
import DeviceDemographics from "./DeviceDemographics";
import Engagement from "./Engagement";
import Sessions30Days from "./Sessions30Days";
import SidebarContent from "./SidebarContent";
import TrafficSources from "./TrafficSources";
import Visitors30Days from "./Visitors30Days";
import Tooltip from "../tooltip/Tooltip";
import Card from "../card/Card";
import CardContent from "../card/CardContent";
import CardGroup from "../card/CardGroup";
import RealtimeMetricCount from "../data_visualization/RealtimeMetricCount";
import RealtimeEventCount from "../data_visualization/RealtimeEventCount";
import TopCitiesRealtime from "./TopCitiesRealtime";
import TopCountriesRealtime from "./TopCountriesRealtime";
import TopLanguagesHistorical from "./TopLanguagesHistorical";
import Accordion from "../accordion/Accordion";
import AccordionHeader from "../accordion/AccordionHeader";
import AccordionContent from "../accordion/AccordionContent";

/**
 * Contains charts and other data visualizations for the main page of the site.
 * This component is mainly laying out the structure for the page and passes
 * props necessary for getting data and displaying visualizations to child
 * components.
 *
 * This component is using USWDS grid classes and expects it's parent element to
 * have class 'grid-row'
 *
 * @param {object} props the properties for the component
 * @param {string} props.dataURL the URL of the base location of the data to be
 * displayed In production this is proxied and redirected to the S3 bucket URL
 * by NGINX.
 * @param {string} props.dataPrefix the path to add to the base URL to find data
 * for the current agency.
 * @param {string} props.agency the display name for the current agency.
 * @returns {import('react').ReactElement} The rendered element
 */
function DashboardContent({ dataURL, dataPrefix, agency }) {
  const dataHrefBase = `${dataURL}/${dataPrefix}`;

  return (
    <>
      <div className="grid-row">
        <div className="grid-col-12">
          <h1 className="margin-top-0 text--semibold">
            {agency} Website and App Analytics
          </h1>
        </div>
      </div>
      <CardGroup>
        <Card className="card:grid-col-12 tablet:grid-col-6 desktop:grid-col-3">
          <CardContent className="white bg-palette-color-1 text-center text--bold">
            <div className="usa-card__body">
              <p className="text--header-xl margin-0">
                <a
                  href="/definitions#report_active_user_count"
                  className="white"
                >
                  <Tooltip
                    position="top"
                    content="The number of unique users who engaged with a website or app within a specified reporting timeframe."
                  >
                    Active Users
                  </Tooltip>
                </a>
              </p>
              <p className="text--header-3xl margin-bottom-0 margin-top-neg-1">
                <RealtimeMetricCount
                  dataHrefBase={dataHrefBase}
                  refreshSeconds={Config.realtimeDataRefreshSeconds}
                  metricName={"activeUsers"}
                />
              </p>
              <p className="text--header-lg margin-0">in the last 30 minutes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card:grid-col-12 tablet:grid-col-6 desktop:grid-col-3">
          <CardContent className="white bg-palette-color-2 text-center text--bold">
            <div className="usa-card__body">
              <p className="text--header-xl margin-0">
                <a
                  href="/definitions#report_first_time_user_count"
                  className="white"
                >
                  <Tooltip
                    position="top"
                    content="The number of unique users who visited a website or app for the first time within the specified reporting timeframe."
                  >
                    First Time Users
                  </Tooltip>
                </a>
              </p>
              <p className="text--header-3xl margin-bottom-0 margin-top-neg-1">
                <RealtimeEventCount
                  dataHrefBase={dataHrefBase}
                  refreshSeconds={Config.realtimeDataRefreshSeconds}
                  eventName={"first_visit"}
                />
              </p>
              <p className="text--header-lg margin-0">in the last 30 minutes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card:grid-col-12 tablet:grid-col-6 desktop:grid-col-3">
          <CardContent className="white bg-palette-color-3 text-center text--bold">
            <div className="usa-card__body">
              <p className="text--header-xl margin-0">
                <a href="/definitions#report_page_view_count" className="white">
                  <Tooltip
                    position="top"
                    content="The total number of times a web page or or screen was viewed in a specified reporting timeframe."
                  >
                    Total Views
                  </Tooltip>
                </a>
              </p>
              <p className="text--header-3xl margin-bottom-0 margin-top-neg-1">
                <RealtimeMetricCount
                  dataHrefBase={dataHrefBase}
                  refreshSeconds={Config.realtimeDataRefreshSeconds}
                  metricName={"pageviews"}
                />
              </p>
              <p className="text--header-lg margin-0">in the last 30 minutes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card:grid-col-12 tablet:grid-col-6 desktop:grid-col-3">
          <CardContent className="white bg-palette-color-4 text-center text--bold">
            <div className="usa-card__body">
              <p className="text--header-xl margin-0">
                <a
                  href="/definitions#report_file_download_count"
                  className="white"
                >
                  <Tooltip
                    position="top"
                    content="The total number of times any file (e.g. .pdf, .xls, .xlsx) was downloaded in a specified reporting timeframe."
                  >
                    Files Downloaded
                  </Tooltip>
                </a>
              </p>
              <p className="text--header-3xl margin-bottom-0 margin-top-neg-1">
                <RealtimeEventCount
                  dataHrefBase={dataHrefBase}
                  refreshSeconds={Config.realtimeDataRefreshSeconds}
                  eventName={"file_download"}
                />
              </p>
              <p className="text--header-lg margin-0">in the last 30 minutes</p>
            </div>
          </CardContent>
        </Card>
      </CardGroup>
      <CardGroup>
        <Card className="card:grid-col-12 desktop:grid-col-8">
          <CardContent>
            <div id="main_data" className="usa-card__body">
              <Accordion className="usa-accordion--bordered" multiselect={true}>
                <AccordionHeader className="section__headline margin-0">
                  <button
                    type="button"
                    className="usa-accordion__button white bg-palette-color-2"
                    aria-expanded="true"
                    aria-controls="user-locations-languages-group"
                  >
                    User Locations and Languages in the Last 30 Minutes
                    <Tooltip
                      position="top"
                      content="Top cities and countries from which user activity originated, and top language settings in user browsers. Location data may be affected by a user's VPN usage."
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
                  </button>
                </AccordionHeader>
                <AccordionContent id="user-locations-languages-group">
                  <CardGroup className="padding-top-1">
                    <Card className="card:grid-col-12 tablet:grid-col-6 desktop:grid-col-4">
                      <CardContent className="no-border desktop:padding-right-1 margin-bottom-neg-2">
                        <TopCitiesRealtime
                          dataHrefBase={dataHrefBase}
                          refreshSeconds={Config.realtimeDataRefreshSeconds}
                        />
                      </CardContent>
                    </Card>
                    <Card className="card:grid-col-12 tablet:grid-col-6 desktop:grid-col-4">
                      <CardContent className="no-border desktop:padding-x-1 margin-bottom-neg-2">
                        <TopCountriesRealtime
                          dataHrefBase={dataHrefBase}
                          refreshSeconds={Config.realtimeDataRefreshSeconds}
                        />
                      </CardContent>
                    </Card>
                    <Card className="card:grid-col-12 tablet:grid-col-6 desktop:grid-col-4">
                      <CardContent className="no-border desktop:padding-left-1 margin-bottom-neg-2">
                        <TopLanguagesHistorical dataHrefBase={dataHrefBase} />
                      </CardContent>
                    </Card>
                  </CardGroup>
                </AccordionContent>
                <AccordionHeader className="section__headline margin-0">
                  <button
                    type="button"
                    className="usa-accordion__button white bg-palette-color-2"
                    aria-expanded="true"
                    aria-controls="30-day-sessions-users"
                  >
                    30 Day Sessions and Users
                  </button>
                </AccordionHeader>
                <AccordionContent id="30-day-sessions-users">
                  <article className="min-height-small padding-top-1 padding-bottom-2 section">
                    <Sessions30Days dataHrefBase={dataHrefBase} />
                  </article>

                  <article className="section section--bordered">
                    <section className="section__subheader padding-top-2 text-center">
                      <Visitors30Days dataHrefBase={dataHrefBase} />
                    </section>
                  </article>
                </AccordionContent>
                <AccordionHeader className="section__headline margin-0">
                  <button
                    type="button"
                    className="usa-accordion__button white bg-palette-color-2"
                    aria-expanded="true"
                    aria-controls="30-day-user-engagement"
                  >
                    30 Day User Engagement
                  </button>
                </AccordionHeader>
                <AccordionContent id="30-day-user-engagement">
                  <section>
                    <Engagement dataHrefBase={dataHrefBase} />
                  </section>
                </AccordionContent>
                <AccordionHeader className="section__headline margin-0">
                  <button
                    type="button"
                    className="usa-accordion__button white bg-palette-color-2"
                    aria-expanded="true"
                    aria-controls="30-day-traffic-sources"
                  >
                    30 Day Traffic Sources
                    <Tooltip
                      position="top"
                      content="Top traffic sources for the last 30 days."
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
                  </button>
                </AccordionHeader>
                <AccordionContent id="30-day-traffic-sources">
                  <article className="min-height-large section">
                    <TrafficSources dataHrefBase={dataHrefBase} />
                  </article>
                </AccordionContent>
                <AccordionHeader className="section__headline margin-0">
                  <button
                    type="button"
                    className="usa-accordion__button white bg-palette-color-2"
                    aria-expanded="true"
                    aria-controls="30-day-demographics"
                  >
                    30 Day User Device Demographics
                    <Tooltip
                      position="top"
                      content="Devices, web browsers, operating systems, and screen resolutions that users were on when interacting with DAP-participating government websites in the past 30 days."
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
                  </button>
                </AccordionHeader>
                <AccordionContent id="30-day-demographics">
                  <article className="min-height-large section">
                    <DeviceDemographics dataHrefBase={dataHrefBase} />
                  </article>
                </AccordionContent>
              </Accordion>
            </div>
          </CardContent>
        </Card>
        <Card className="card:grid-col-12 desktop:grid-col-4">
          <CardContent>
            <div id="secondary_data" className="usa-card__body">
              <SidebarContent dataHrefBase={dataHrefBase} agency={agency} />
            </div>
          </CardContent>
        </Card>
      </CardGroup>
    </>
  );
}

DashboardContent.propTypes = {
  dataURL: PropTypes.string.isRequired,
  dataPrefix: PropTypes.string.isRequired,
  agency: PropTypes.string.isRequired,
};

export default DashboardContent;
