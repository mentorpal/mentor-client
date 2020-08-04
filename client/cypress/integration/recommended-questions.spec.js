/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { addGuestParams, mockMentorData } from "./helpers";

describe("Recommended questions", () => {
  beforeEach(() => {
    cy.server();
    mockMentorData(cy);
    cy.viewport("iphone-x");
  });

  it("do not appear in topic list if no questions are recommended", () => {
    cy.visit("/", { qs: addGuestParams() });
    cy.get("#topics").should("not.have.value", "Recommended");
  });

  it("appear in topic list if questions are recommended", () => {
    cy.visit("/", {
      qs: addGuestParams({
        recommended: "Howdy",
      }),
    });
    cy.get("#topics").contains("Recommended");
  });

  it("appear as default topic", () => {
    cy.visit("/", {
      qs: addGuestParams({
        recommended: "Howdy",
      }),
    });
    cy.get("#topics")
      .find(".topic-selected")
      .contains("Recommended");
  });

  it("list recommended questions in question list", () => {
    cy.visit("/", {
      qs: addGuestParams({
        recommended: ["Howdy", "Partner"],
      }),
    });
    cy.get("#scrolling-questions-list").contains("Howdy");
    cy.get("#scrolling-questions-list").contains("Partner");
  });

  it("display an icon next to recommended questions", () => {
    cy.visit("/", {
      qs: addGuestParams({
        recommended: "Howdy",
      }),
    });
    cy.get("#scrolling-questions-list")
      .get(`#${CSS.escape("Howdy")}`)
      .find(".recommended-question-icon");
  });

  it("appear at the top of other topic questions", () => {
    cy.visit("/", {
      qs: addGuestParams({
        recommended: "What is Japan like?",
      }),
    });
    cy.get("#topic-1").click();
    cy.get("#scrolling-questions-list")
      .get("li")
      .first()
      .contains("What is Japan like?");
    cy.get("#scrolling-questions-list")
      .get("li")
      .first()
      .find(".recommended-question-icon");
  });
});
