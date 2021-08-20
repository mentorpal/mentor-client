/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { addGuestParams, mockDefaultSetup } from "../support/helpers";

describe("Recommended questions", () => {
  it("do not appear in topic list if no questions are recommended", () => {
    mockDefaultSetup(cy);
    cy.visit("/", { qs: addGuestParams() });
    cy.get("[data-cy=topics]").should("not.have.value", "Recommended");
  });

  it("appear in topic list if questions are recommended", () => {
    mockDefaultSetup(cy);
    cy.visit("/", {
      qs: addGuestParams({
        recommendedQuestions: "Howdy",
      }),
    });
    cy.get("[data-cy=topics]").contains("Recommended");
  });

  it("appear as default topic", () => {
    mockDefaultSetup(cy);
    cy.visit("/", {
      qs: addGuestParams({
        recommendedQuestions: "Howdy",
      }),
    });
    cy.get("[data-cy=topics]")
      .trigger("mouseover")
      .click()
      .get("div>li")
      .eq(0)
      .contains("Recommended");
  });

  it("list recommended questions in question list", () => {
    mockDefaultSetup(cy);
    cy.visit("/", {
      qs: addGuestParams({
        recommendedQuestions: ["Howdy", "Partner"],
      }),
    });
    cy.get("[data-cy=scrolling-questions-list]").contains("Howdy");
    cy.get("[data-cy=scrolling-questions-list]").contains("Partner");
  });

  it("display an icon next to recommended questions", () => {
    mockDefaultSetup(cy);
    cy.visit("/", {
      qs: addGuestParams({
        recommendedQuestions: "Howdy",
      }),
    });
    cy.get("[data-cy=scrolling-questions-list]")
      .get(`[data-cy=${CSS.escape("Howdy")}]`)
      .find(".recommended-question-icon");
  });

  it("appear at the top of other topic questions", () => {
    mockDefaultSetup(cy);
    cy.visit("/", {
      qs: addGuestParams({
        recommendedQuestions: "Are you fun at parties?",
      }),
    });
    cy.get("[data-cy=topics]")
      .trigger("mouseover")
      .click()
      .get("div>li")
      .eq(0)
      .should("not.have.attr", "data-test", "About Me");
    cy.get("[data-cy=close-topics]").trigger("mouseover").click();

    cy.get("[data-cy=topics]")
      .trigger("mouseover")
      .click()
      .get("div>li")
      .eq(2)
      .trigger("mouseover")
      .click();

    cy.get("[data-cy=topics]")
      .trigger("mouseover")
      .click()
      .get("div>li")
      .eq(2)
      .should("have.attr", "data-test", "About the Job");
    cy.get("[data-cy=close-topics]").trigger("mouseover").click();

    cy.get("[data-cy=scrolling-questions-list]")
      .get("li")
      .first()
      .contains("Are you fun at parties?");
    cy.get("[data-cy=scrolling-questions-list]")
      .get("li")
      .first()
      .find(".recommended-question-icon");
  });
});
