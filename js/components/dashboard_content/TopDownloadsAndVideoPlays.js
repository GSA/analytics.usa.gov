import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

import DataLoader from "../../lib/data_loader";
import TopDownloads from "./TopDownloads";
import TopVideoPlays from "./TopVideoPlays";
import Tooltip from "../tooltip/Tooltip";

/**
 * Contains charts and other data visualizations for the top downloads and top
 * video plays section of the site.
 *
 * @param {object} props the properties for the component
 * @param {string} props.dataHrefBase the URL of the base location of the data
 * to be downloaded including the agency path. In production this is proxied and
 * redirected to the S3 bucket URL.
 * @param {string} props.agency the display name for the current agency.
 * @param {string} props.downloadsReportFileName the file name of the report to
 * use as a data source for the download data visualization.
 * @param {string} props.videoPlaysReportFileName the file name of the report to
 * use as a data source for the video play data visualization.
 * @param {string} props.timeIntervalHeader the report time interval to
 * display in the header for each section.
 * @param {string} props.timeIntervalDescription the report time interval to
 * display in the subheader for each section.
 * @returns {import('react').ReactElement} The rendered element
 */
function TopDownloadsAndVideoPlays({
  dataHrefBase,
  agency,
  downloadsReportFileName,
  videoPlaysReportFileName,
  timeIntervalHeader,
  timeIntervalDescription,
}) {
  const numberOfTopDownloadsToDisplay = 10;
  const numberOfTopVideoPlaysToDisplay = 10;

  const jsonVideoDataURL = `${dataHrefBase}/${videoPlaysReportFileName}.json`;
  const csvVideoDataURL = `${dataHrefBase}/${videoPlaysReportFileName}.csv`;
  const [videoPlayData, setVideoPlayData] = useState(null);

  useEffect(() => {
    const getVideoPlayData = async () => {
      if (!videoPlayData) {
        const data = await DataLoader.loadJSON(jsonVideoDataURL);
        await setVideoPlayData(data);
      }
    };
    getVideoPlayData().catch(console.error);
  }, []);

  function __shouldDisplayVideoPlays() {
    return (
      videoPlayData &&
      videoPlayData.data &&
      Array.isArray(videoPlayData.data) &&
      videoPlayData.data.length > 2
    );
  }

  function __topDownloadsCount() {
    return __shouldDisplayVideoPlays(videoPlayData)
      ? numberOfTopDownloadsToDisplay
      : numberOfTopDownloadsToDisplay + numberOfTopVideoPlaysToDisplay;
  }

  return (
    <>
      <section className="top-downloads padding-bottom-1 border-bottom-1px border-base-light">
        <div className="top-downloads__headline">
          <h3>
            <a href="/definitions#report_top_downloads">
              Top {__topDownloadsCount()} Downloads {timeIntervalHeader}
            </a>
            <Tooltip
              position="top"
              content="Top files downloaded across all DAP participating government publicly-available websites. Updated daily for the yesterday, last 7 days, and last 30 days aggregate reports."
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
          </h3>
        </div>
        <p className="text--normal margin-top-neg-1 margin-bottom-0">
          <em>
            Top file downloads {timeIntervalDescription} on {agency} hostnames.
          </em>
        </p>
        <p className="margin-top-1 margin-bottom-0">
          <a
            href={`${dataHrefBase}/${downloadsReportFileName}.csv`}
            aria-label={`${downloadsReportFileName}.csv`}
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
        <TopDownloads
          dataHrefBase={dataHrefBase}
          reportFileName={`${downloadsReportFileName}.json`}
          numberOfListingsToDisplay={__topDownloadsCount()}
        />
      </section>
      <section className="top-video-plays">
        <div className="top-video-plays__headline">
          <h3>
            <a href="/definitions#report_top_video_plays">
              {__shouldDisplayVideoPlays()
                ? `Top ${numberOfTopVideoPlaysToDisplay} Video Plays ${timeIntervalHeader}`
                : `Top Video Plays ${timeIntervalHeader}`}
            </a>
            <Tooltip
              position="top"
              content="Top videos played across all DAP participating government publicly-available websites. Updated daily for the yesterday, last 7 days, and last 30 days aggregate reports"
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
          </h3>
        </div>
        <p className="text--normal margin-top-neg-1 margin-bottom-0">
          <em>
            {__shouldDisplayVideoPlays()
              ? `Top videos played ${timeIntervalDescription} on ${agency} hostnames.`
              : `Video play data is unavailable for ${agency} hostnames.`}
          </em>
        </p>
        <p className="margin-top-1 margin-bottom-0">
          <a
            href={csvVideoDataURL}
            aria-label={`${videoPlaysReportFileName}.csv`}
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
        {__shouldDisplayVideoPlays() ? (
          <TopVideoPlays
            videoPlayData={videoPlayData}
            numberOfListingsToDisplay={numberOfTopVideoPlaysToDisplay}
          />
        ) : (
          <div></div>
        )}
      </section>
    </>
  );
}

TopDownloadsAndVideoPlays.propTypes = {
  dataHrefBase: PropTypes.string.isRequired,
  agency: PropTypes.string.isRequired,
  downloadsReportFileName: PropTypes.string.isRequired,
  videoPlaysReportFileName: PropTypes.string.isRequired,
  timeIntervalHeader: PropTypes.string.isRequired,
  timeIntervalDescription: PropTypes.string.isRequired,
};

export default TopDownloadsAndVideoPlays;
