import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

import DashboardContent from "../DashboardContent";

describe("DashboardContent", () => {
  beforeEach(async () => {
    render(
      <DashboardContent
        dataURL="http://www.example.com"
        dataPrefix="interior"
        agency="Department of Interior"
      />,
    );
    await waitFor(() =>
      screen.getByText("Department of Interior Website and App Analytics"),
    );
  });

  // Check for some subcomponents' text to ensure everything renders
  it("renders", () => {
    expect(screen.getByText("Operating Systems"));
    expect(screen.getByText("Top Web Pages and App Screens"));
    expect(screen.getByText("Languages"));
    expect(screen.getByText("Top Channels"));
  });
});
