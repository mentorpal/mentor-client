/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  visitAsGuestWithDefaultSetup,
  mockDefaultSetup,
  cyMockGQL,
} from "../support/helpers";
const clint = require("../fixtures/clint.json");
const covid = require("../fixtures/covid.json");
const carlos = require("../fixtures/carlos.json");

describe("Video Chat History", () => {
  // it("can open external links in chat with markdown", () => {
  //   mockDefaultSetup(cy, {
  //     config: { mentorsDefault: ["covid"] },
  //     mentorData: [covid],
  //     apiResponse: "response_with_markdown.json",
  //   });
  //   cy.intercept("**/questions/?mentor=*&query=*", {
  //     fixture: "response_with_markdown.json",
  //   });
  //   cy.viewport("macbook-11");
  //   cy.visit("/");
  //   cy.get("[data-cy=chat-thread]").should("exist");
  //   cy.get("[data-cy=input-field]").type("test");
  //   cy.get("[data-cy=input-send]").trigger("mouseover").click();
  //   cy.get("[data-cy=chat-msg-2]").contains("Click here");
  //   cy.get("[data-cy=chat-msg-2] a").should(
  //     "have.attr",
  //     "href",
  //     "https://www.google.com"
  //   );
  //   cy.get("[data-cy=chat-msg-2] a").should("have.attr", "target", "_blank");
  // });

  it("Answer with link", () => {
    mockDefaultSetup(cy, {
      config: { mentorsDefault: ["clint", "carlos"] },
      mentorData: [clint, carlos],
      apiResponse: "response_with_markdown2.json",
      gqlQueries: [cyMockGQL("userQuestionSetFeedback", null, false)],
    });

    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_markdown.json",
    });
    cy.intercept("**/questions/?mentor=carlos&query=*", {
      fixture: "response_with_feedback.json",
    });
    cy.viewport("macbook-11");
    cy.visit("/");

    cy.get("[data-cy=topic-2] button").trigger("mouseover").click();
    cy.get("[data-cy=history-chat]").should("exist");

    // write msgs
    cy.get("[data-cy=input-field]").type("Question 1");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    cy.get("[data-cy=input-field]").type("Question 2");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();
    cy.get("[data-cy=input-send]").trigger("mouseover").click();
  });
});
