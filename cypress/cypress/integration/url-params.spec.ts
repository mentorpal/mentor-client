/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  assertLocalStorageUserDataValue,
  visitAsCustomWithDefaultSetup,
  visitAsGuestWithDefaultSetup,
} from "../support/helpers";
import {
  LS_EMAIL_KEY,
  LS_USER_ID_KEY,
  LS_X_API_EMAIL_KEY,
} from "../support/local-constants";

describe("Display Mentor Grid", () => {
  it("Displays Popup to add an username", () => {
    visitAsGuestWithDefaultSetup(cy, "/");

    // 1. show modal with userEmail field to add
    cy.get("[data-cy=username-modal-container]").within(() => {
      cy.get("[data-cy=modal-username-title]").contains(
        "Welcome to CareerFair.ai"
      );

      cy.get("[data-cy=modal-username-description]").contains(
        "We make high-quality mentoring available to students for free, using virtual agents representing real-life STEM mentors."
      );

      cy.get("[data-cy=modal-username-description]").contains(
        "If you are from the CSUF study or wish to receive information (no more than monthly) about CareerFair.ai, please put your email here:"
      );

      // 2. enter user email and sumbit it
      cy.get("[data-cy=username-field]").type("email@email.com");
      cy.get("[data-cy=sumbit-email-btn]").trigger("mouseover").click();
    });

    // 3. modal show not be visible
    cy.get("[data-cy=username-modal-container]").should("not.exist");

    // 4. wait 1 sec to load data in localStorage
    cy.wait(1000);
    assertLocalStorageUserDataValue(
      LS_EMAIL_KEY,
      "be.equal",
      "email@email.com"
    );
  });

  it("Sumbit empty and gets error", () => {
    visitAsGuestWithDefaultSetup(cy, "/");

    // 1. show modal with userEmail field to add
    cy.get("[data-cy=username-modal-container]").within(() => {
      cy.get("[data-cy=modal-username-title]").contains(
        "Welcome to CareerFair.ai"
      );

      cy.get("[data-cy=modal-username-description]").contains(
        "We make high-quality mentoring available to students for free, using virtual agents representing real-life STEM mentors."
      );

      cy.get("[data-cy=modal-username-description]").contains(
        "If you are from the CSUF study or wish to receive information (no more than monthly) about CareerFair.ai, please put your email here:"
      );

      // 2. enter user email and sumbit it
      cy.get("[data-cy=username-field]").type(" ");
      cy.get("[data-cy=sumbit-email-btn]").trigger("mouseover").click();
    });
  });

  /*
      User comes from survey, with userid in URL parameters
        - userid = userid
        - email = userid.urlparam@mentorpal.org
  */
  it("User comes from survey, with userid in URL parameters (Don't display Popup)", () => {
    visitAsCustomWithDefaultSetup(cy, "/", {
      userid: "EffectCSUFInt_R_3PucYBjF8MoAtiQ",
    });

    cy.wait(1000);
    assertLocalStorageUserDataValue(
      LS_USER_ID_KEY,
      "be.equal",
      "EffectCSUFInt_R_3PucYBjF8MoAtiQ"
    );
    cy.get("[data-cy=username-modal-container]").should("not.exist");
  });

  /*
  User comes to page and doesn't provide an email when prompted:
    - userid = <random number>-guest
    - email = <same number>.guest@mentorpal.org
  */
  it("User comes from survey, with no userid in URL parameters (Display Popup)", () => {
    visitAsGuestWithDefaultSetup(cy, "/");

    // 1. show modal with userEmail field to add
    cy.get("[data-cy=username-modal-container]").within(() => {
      cy.get("[data-cy=modal-username-title]").contains(
        "Welcome to CareerFair.ai"
      );

      cy.get("[data-cy=modal-username-description]").contains(
        "We make high-quality mentoring available to students for free, using virtual agents representing real-life STEM mentors."
      );

      cy.get("[data-cy=modal-username-description]").contains(
        "If you are from the CSUF study or wish to receive information (no more than monthly) about CareerFair.ai, please put your email here:"
      );

      // 2. enter user email and sumbit it
      cy.get("[data-cy=username-field]").type("email@email.com");
      cy.get("[data-cy=sumbit-email-btn]").trigger("mouseover").click();
    });

    // 3. modal show not be visible
    cy.get("[data-cy=username-modal-container]").should("not.exist");

    cy.wait(1000);
    assertLocalStorageUserDataValue(
      LS_EMAIL_KEY,
      "be.equal",
      "email@email.com"
    );
    cy.get("[data-cy=username-modal-container]").should("not.exist");
  });
});
