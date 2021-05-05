/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { mockDefaultSetup } from "../support/helpers";

describe("Guest Prompt", () => {
  it("does not prompt if cmi5 is not enabled", () => {
    mockDefaultSetup(cy, { config: { cmi5Enabled: false } });
    cy.visit("/");
    cy.get("[data-cy=guest-prompt]").should("not.exist");
  });

  it("prompts anonymous user for a guest name when cmi5 enabled", () => {
    mockDefaultSetup(cy, { config: { cmi5Enabled: true } });
    cy.visit("/");
    cy.get("[data-cy=guest-prompt]").should("exist");
    cy.get("[data-cy=guest-prompt-header]").contains("Enter a guest name:");
    cy.get("[data-cy=guest-prompt-input]").should("exist");
  });

  it("does not play video until there is a session user when cmi5 enabled", () => {
    mockDefaultSetup(cy, { config: { cmi5Enabled: true } });
    cy.visit("/");
    cy.get("[data-cy=video-container]").should(
      "have.attr",
      "data-test-playing",
      "false"
    );
  });

  it("reloads with a guest session on submit name via guest prompt", () => {
    mockDefaultSetup(cy, { config: { cmi5Enabled: true } });
    cy.visit("/");
    cy.get("[data-cy=guest-prompt-input]").type("guestuser1");
    cy.get("[data-cy=guest-prompt-input-send]").trigger("mouseover").click();
    cy.url().should("include", "actor=");
    cy.url().should("include", "guestuser1");
    cy.get("[data-cy=guest-prompt]").should("not.exist");
    cy.get("[data-cy=video-container] video").should("exist");
    cy.get("[data-cy=video-container] video").should(
      "have.attr",
      "autoplay",
      "autoplay"
    );
  });

  it("loads a single specific mentor", () => {
    mockDefaultSetup(cy, { config: { cmi5Enabled: true } });
    cy.visit("/?mentor=clint");
    cy.get("[data-cy=guest-prompt-input]").type("guestuser1");
    cy.get("[data-cy=guest-prompt-input-send]").trigger("mouseover").click();
    cy.url().should("include", "actor=");
    cy.url().should("include", "guestuser1");
    cy.get("[data-cy=guest-prompt]").should("not.exist");
    cy.get("[data-cy=video-container] video").should("exist");
    cy.get("[data-cy=video-container] video").should(
      "have.attr",
      "autoplay",
      "autoplay"
    );
  });

  it("accepts enter in guest-name input field as submit", () => {
    mockDefaultSetup(cy, { config: { cmi5Enabled: true } });
    cy.visit("/");
    cy.get("[data-cy=guest-prompt-input]").type("guestuser2\n");
    cy.url().should("include", "actor=");
    cy.url().should("include", "guestuser2");
    cy.get("[data-cy=guest-prompt]").should("not.exist");
    cy.get("[data-cy=video-container] video").should("exist");
    cy.get("[data-cy=video-container] video").should(
      "have.attr",
      "autoplay",
      "autoplay"
    );
  });
});
