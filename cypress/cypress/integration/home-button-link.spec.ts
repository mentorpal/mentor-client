/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  EMAIL_URL_PARAM_KEY,
  QUALTRICS_USER_ID_URL_PARAM_KEY,
  REGISTRATION_ID_KEY,
  SESSION_URL_PARAM_KEY,
} from "../support/local-constants";
import { mockDefaultSetup } from "../support/helpers";

describe("url params provided for home button click", () => {
  it("No userid, userEmail, or refferer, should send sessionId and registrationid", () => {
    mockDefaultSetup(cy, {
      config: {
        displayGuestPrompt: false,
      },
    });
    cy.visit("/");
    cy.get("[data-cy=home-button]").invoke("removeAttr", "target").click();
    cy.url()
      .should("include", `${REGISTRATION_ID_KEY}=`)
      .should("include", `${SESSION_URL_PARAM_KEY}=`)
      .should("not.include", `${EMAIL_URL_PARAM_KEY}=`)
      .should("not.include", `${QUALTRICS_USER_ID_URL_PARAM_KEY}=`);

    cy.visit("/?sessionId=123&registrationId=456");
    cy.get("[data-cy=home-button]").invoke("removeAttr", "target").click();
    cy.url()
      .should("include", `${REGISTRATION_ID_KEY}=`)
      .should("include", `${SESSION_URL_PARAM_KEY}=`)
      .should("not.include", `${EMAIL_URL_PARAM_KEY}=`)
      .should("not.include", `${QUALTRICS_USER_ID_URL_PARAM_KEY}=`);
  });

  it("Provided userid is passed along", () => {
    mockDefaultSetup(cy, {
      config: {
        displayGuestPrompt: false,
      },
    });
    cy.visit("/?userid=123");
    cy.get("[data-cy=home-button]").invoke("removeAttr", "target").click();
    cy.url()
      .should("include", `${REGISTRATION_ID_KEY}=`)
      .should("include", `${SESSION_URL_PARAM_KEY}=`)
      .should("not.include", `${EMAIL_URL_PARAM_KEY}=`)
      .should("include", `${QUALTRICS_USER_ID_URL_PARAM_KEY}=123`);
  });

  it("Provided userEmail is passed along", () => {
    mockDefaultSetup(cy, {
      config: {
        displayGuestPrompt: false,
      },
    });
    cy.visit("/?userEmail=123@mentorpal.org");
    cy.get("[data-cy=home-button]").invoke("removeAttr", "target").click();

    cy.url()
      .should("include", `${REGISTRATION_ID_KEY}=`)
      .should("include", `${SESSION_URL_PARAM_KEY}=`)
      .should(
        "include",
        `${EMAIL_URL_PARAM_KEY}=${encodeURIComponent("123@mentorpal.org")}`
      )
      .should("not.include", `${QUALTRICS_USER_ID_URL_PARAM_KEY}=`);
  });

  it("Provided userId, userEmail, and refferrer are passed along", () => {
    mockDefaultSetup(cy, {
      config: {
        displayGuestPrompt: false,
      },
    });
    cy.visit("/?userid=123&sessionId=321&userEmail=test@mentorpal.org");
    cy.get("[data-cy=home-button]").invoke("removeAttr", "target").click();

    cy.url()
      .should("include", `${REGISTRATION_ID_KEY}=`)
      .should("include", `${SESSION_URL_PARAM_KEY}=321`)
      .should(
        "include",
        `${EMAIL_URL_PARAM_KEY}=${encodeURIComponent("test@mentorpal.org")}`
      )
      .should("include", `${QUALTRICS_USER_ID_URL_PARAM_KEY}=123`);
  });
});
