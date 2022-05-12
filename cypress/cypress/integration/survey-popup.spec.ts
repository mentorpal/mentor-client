/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu
The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { visitAsGuestWithDefaultSetup } from "../support/helpers";

describe("Disclaimer Survey Popup Button", () => {
  it("Only visible is qualtricsuserid exists in local storage", () => {
    visitAsGuestWithDefaultSetup(cy, "/");
    cy.get("[data-cy=header-disclimer-btn]").invoke("mouseover").click();
    cy.get("[data-cy=header-survey-popup-btn]").should("not.be.visible");
    visitAsGuestWithDefaultSetup(cy, "/?postsurveytime=10&userid=123");
    cy.get("[data-cy=header-disclimer-btn]").invoke("mouseover").click();
    cy.get("[data-cy=disclaimer-text]").should(
      "contain.text",
      "Disclaimer: The CareerFair.AI rese"
    );
    cy.get("[data-cy=header-survey-popup-btn]")
      .scrollIntoView()
      .should("be.visible");
  });

  it("If just qualtrics id is set nad nothing else, make sure to display link", () => {
    visitAsGuestWithDefaultSetup(cy, "/");
    window.localStorage.setItem("qualtricsuserid", "123");
    cy.get("[data-cy=header-disclimer-btn]").invoke("mouseover").click();
    cy.get("[data-cy=disclaimer-text]").should(
      "contain.text",
      "Disclaimer: The CareerFair.AI rese"
    );
    cy.get("[data-cy=header-survey-popup-btn]")
      .scrollIntoView()
      .invoke("mouseover")
      .click();
    cy.get("[data-cy=survey-dialog]").should("be.visible");
    cy.get("[data-cy=survey-dialog-title]").should("be.visible");
    cy.get("[data-cy=survey-link]").should("be.visible");
  });

  it("Does not display link if local storage is setup correctly and time not passed", () => {
    visitAsGuestWithDefaultSetup(cy, "/?postsurveytime=10&userid=123");
    cy.get("[data-cy=header-disclimer-btn]").should("be.visible");
    cy.get("[data-cy=header-disclimer-btn]").invoke("mouseover").click();
    cy.get("[data-cy=header-survey-popup-btn]").invoke("mouseover").click();
    cy.get("[data-cy=survey-dialog]").should("be.visible");
    cy.get("[data-cy=survey-dialog-title]").should("be.visible");
    cy.get("[data-cy=survey-link]").should("not.exist");
  });
});

describe("Survey Popup After Timer", () => {
  it("If local storage setup, and after waiting the proper amount of time, pops up on its own", () => {
    visitAsGuestWithDefaultSetup(cy, "/?postsurveytime=10&userid=123");
    cy.wait(10000);
    cy.get("[data-cy=survey-dialog]").should("be.visible");
    cy.get("[data-cy=survey-dialog-title]").should("be.visible");
    cy.get("[data-cy=survey-link]").should("be.visible");
  });
});
