import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

import { delay } from "../../../../spec/support/test_utilities";
import DataLoader from "../../../lib/data_loader";
import TopVideoPlays from "../TopVideoPlays";

jest.mock("../../../lib/data_loader", () => ({
  ...jest.requireActual("../../../lib/data_loader"),
  loadDailyReportJSON: jest.fn(),
}));

describe("TopVideoPlays", () => {
  let component;
  let data;

  beforeEach(async () => {
    data = {
      name: "top-video-plays-30-days",
      query: {},
      meta: {
        name: "Top video plays 30 days",
        description: "Top 20 video plays in the last 30 days",
      },
      data: [
        {
          event_label: "video_start",
          video_title:
            "NASA Astronauts Send Fourth of July Wishes From the International Space Station",
          video_url: "https://www.youtube.com/watch?v=ijkkPoXQukY",
          total_events: "22112",
        },
        {
          event_label: "video_start",
          video_title: "Animation: The James Webb Space Telescope's Orbit",
          video_url: "https://www.youtube.com/watch?v=6cUe4oMk69E",
          total_events: "17997",
        },
        {
          event_label: "video_start",
          video_title: "How to Renew Your U.S.  Passport",
          video_url: "https://www.youtube.com/watch?v=0akd7xj6wec",
          total_events: "7568",
        },
        {
          event_label: "video_start",
          video_title:
            "Applying in Person for a U.S. Passport 2022 [Audio Description]",
          video_url: "https://www.youtube.com/watch?v=FsQHz2ZdX6E",
          total_events: "3485",
        },
        {
          event_label: "video_start",
          video_title: "HRSA's Ryan White HIV/AIDS Program 30th Anniversary",
          video_url: "https://www.youtube.com/watch?v=iQrP4n-VeFg",
          total_events: "1808",
        },
        {
          event_label: "video_start",
          video_title: "Primary Mirror Size Comparison Between Webb and Hubble",
          video_url: "https://www.youtube.com/watch?v=j3mk6tUokm4",
          total_events: "877",
        },
        {
          event_label: "video_start",
          video_title: "Online Passport Renewal: Uploading Your Photo",
          video_url: "https://www.youtube.com/watch?v=N33FJaziUgY",
          total_events: "859",
        },
        {
          event_label: "video_start",
          video_title: "Animation: The James Webb Space Telescope's Orbit",
          video_url:
            "https://www.youtube.com/watch?list=TLGG8tIphgpDAHkyNTA2MjAyNA&v=6cUe4oMk69E",
          total_events: "637",
        },
        {
          event_label: "video_start",
          video_title:
            "Animation of Asteroid Apophis’ 2029 Close Approach with Earth",
          video_url: "https://www.youtube.com/watch?v=hjJIyZKbHqc",
          total_events: "390",
        },
        {
          event_label: "video_start",
          video_title: "Animation: The James Webb Space Telescope's Orbit",
          video_url:
            "https://www.youtube.com/watch?list=TLGG8tIphgpDAHkyMzA2MjAyNA&v=6cUe4oMk69E",
          total_events: "343",
        },
        {
          event_label: "video_start",
          video_title: "Animation: The James Webb Space Telescope's Orbit",
          video_url:
            "https://www.youtube.com/watch?list=TLGG8tIphgpDAHkxOTA2MjAyNA&v=6cUe4oMk69E",
          total_events: "257",
        },
        {
          event_label: "video_start",
          video_title: "Animation: The James Webb Space Telescope's Orbit",
          video_url:
            "https://www.youtube.com/watch?list=TLGG8tIphgpDAHkxMzA2MjAyNA&v=6cUe4oMk69E",
          total_events: "224",
        },
        {
          event_label: "video_start",
          video_title: "Animation: The James Webb Space Telescope's Orbit",
          video_url:
            "https://www.youtube.com/watch?list=TLGG8tIphgpDAHkyMDA2MjAyNA&v=6cUe4oMk69E",
          total_events: "211",
        },
        {
          event_label: "video_start",
          video_title:
            "Pillars of Creation Star in New Visualization from NASA’s Hubble and Webb Telescopes",
          video_url: "https://www.youtube.com/watch?v=9ZooCy59rV0",
          total_events: "201",
        },
        {
          event_label: "video_start",
          video_title: "HRSA's Ryan White HIV/AIDS Program 30th Anniversary",
          video_url:
            "https://www.youtube.com/watch?list=TLGG8F2js94CWDcyNDA2MjAyNA&v=iQrP4n-VeFg",
          total_events: "166",
        },
        {
          event_label: "video_start",
          video_title: "Animation: The James Webb Space Telescope's Orbit",
          video_url:
            "https://www.youtube.com/watch?list=TLGG8tIphgpDAHkyNDA2MjAyNA&v=6cUe4oMk69E",
          total_events: "154",
        },
        {
          event_label: "video_start",
          video_title: "HRSA's Ryan White HIV/AIDS Program 30th Anniversary",
          video_url:
            "https://www.youtube.com/watch?list=TLGG8F2js94CWDcyMTA2MjAyNA&v=iQrP4n-VeFg",
          total_events: "151",
        },
        {
          event_label: "video_start",
          video_title: "Antarctic Ice Mass Loss 2002-2023",
          video_url: "https://www.youtube.com/watch?v=6PLBEz7o6wc",
          total_events: "146",
        },
        {
          event_label: "video_start",
          video_title: "Primary Mirror Size Comparison Between Webb and Hubble",
          video_url:
            "https://www.youtube.com/watch?list=TLGG9AelNnPkoFQxODA2MjAyNA&v=j3mk6tUokm4",
          total_events: "146",
        },
        {
          event_label: "video_start",
          video_title: "Global Warming from 1880 to 2022",
          video_url: "https://www.youtube.com/watch?v=LwRTw_7NNJs",
          total_events: "140",
        },
      ],
      totals: {},
      taken_at: "2024-07-11T14:36:05.272Z",
    };
    DataLoader.loadDailyReportJSON.mockImplementation(() => {
      return Promise.resolve(data);
    });

    component = render(
      <TopVideoPlays
        agency={"Interior"}
        dataHrefBase={"http://www.example.com/data/"}
        numberOfListingsToDisplay={10}
      />,
    );
    await waitFor(() =>
      screen.getByRole("link", {
        name: "NASA Astronauts Send Fourth of July Wishes From the International Space Station",
      }),
    );
    // Wait for barchart transition animation to complete (200 ms, set in
    // js/lib/chart_helpers/barchart.js)
    await delay(300);
  });

  it("renders a component with data loaded", () => {
    expect(component.asFragment()).toMatchSnapshot();
  });
});
