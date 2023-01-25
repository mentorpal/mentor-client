/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { mockDefaultSetup } from "../support/helpers";

describe("Survey Popup After Timer", () => {
  it("not visible if postSurveyLink not in config", () => {
    mockDefaultSetup(cy, {
      config: {
        displayGuestPrompt: false,
        disclaimerDisabled: true,
        cmi5Enabled: false,
      },
    });
    cy.visit("/");
    cy.wait(500);
    cy.get("[data-cy=survey-dialog]").should("not.exist");
  });

  it("not visible if postSurveyTimer not in config", () => {
    mockDefaultSetup(cy, {
      config: {
        displayGuestPrompt: false,
        disclaimerDisabled: true,
        cmi5Enabled: false,
        postSurveyLink: "test",
      },
    });
    cy.visit("/");
    cy.wait(500);
    cy.get("[data-cy=survey-dialog]").should("not.exist");
  });

  it("not visible if userid not in url", () => {
    mockDefaultSetup(cy, {
      config: {
        displayGuestPrompt: false,
        disclaimerDisabled: true,
        cmi5Enabled: false,
        postSurveyLink: "test",
        postSurveyTimer: 1,
      },
    });
    cy.visit("/");
    cy.wait(500);
    cy.get("[data-cy=survey-dialog]").should("not.exist");
  });

  it("visible if postSurveyLink and postSurveyTimer in config, and userid in url", () => {
    mockDefaultSetup(cy, {
      config: {
        displayGuestPrompt: false,
        disclaimerDisabled: true,
        cmi5Enabled: false,
        postSurveyLink: "test",
        postSurveyTimer: 1,
      },
    });
    cy.visit("/?userid=123");
    cy.wait(500);
    cy.get("[data-cy=survey-dialog]", { timeout: 10000 }).should("exist");
  });

  it("visible if postSurveyLink and postSurveyTimer in config, and qualtricsuserid in localstorage", () => {
    mockDefaultSetup(cy, {
      config: {
        displayGuestPrompt: false,
        disclaimerDisabled: true,
        cmi5Enabled: false,
        postSurveyLink: "test",
        postSurveyTimer: 1,
      },
    });
    cy.visit("/");
    window.localStorage.setItem("qualtricsuserid", "123");
    cy.wait(500);
    cy.get("[data-cy=survey-dialog]", { timeout: 10000 }).should("exist");
  });

  it("visible if postSurveyLink in config, and postsurveytime and userid in url", () => {
    mockDefaultSetup(cy, {
      config: {
        displayGuestPrompt: false,
        disclaimerDisabled: true,
        cmi5Enabled: false,
        postSurveyLink: "test",
        postSurveyTimer: 1,
      },
    });
    cy.visit("/?postsurveytime=1&userid=123");
    cy.wait(500);
    cy.get("[data-cy=survey-dialog]", { timeout: 10000 }).should("exist");
  });

  it("visible if postSurveyLink in config, and postsurveytime in url, and qualtricsuserid in localstorage", () => {
    mockDefaultSetup(cy, {
      config: {
        displayGuestPrompt: false,
        disclaimerDisabled: true,
        cmi5Enabled: false,
        postSurveyLink: "test",
        postSurveyTimer: 1,
      },
    });
    cy.visit("/?postsurveytime=1");
    window.localStorage.setItem("qualtricsuserid", "123");
    cy.wait(500);
    cy.get("[data-cy=survey-dialog]", { timeout: 10000 }).should("exist");
  });

  it("if local storage is setup correctly and time not passed", () => {
    mockDefaultSetup(cy, {
      config: {
        displayGuestPrompt: false,
        disclaimerDisabled: true,
        cmi5Enabled: false,
        postSurveyLink: "test",
        postSurveyTimer: 1,
      },
    });
    cy.visit("/?userid=123");
    cy.get("[data-cy=survey-dialog]").should("not.exist");
  });
});
