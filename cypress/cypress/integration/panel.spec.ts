/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { mockDefaultSetup } from "../support/helpers";

const clint = require("../fixtures/clint.json");
const carlos = require("../fixtures/carlos.json");
const covid = require("../fixtures/covid.json");

describe("Mentor panel", () => {
  it("shows if there is more than one mentor", () => {
    mockDefaultSetup(cy);
    cy.visit("/?mentor=clint&mentor=carlos");
    cy.get("[data-cy=video-panel]");
  });

  it("is hidden if there is only one mentor", () => {
    mockDefaultSetup(cy);
    cy.visit("/?mentor=clint");
    cy.get("[data-cy=video-panel]").should("not.exist");
  });

  it("displays default mentors if no mentors specified and DEFAULT_MENTORS is set", () => {
    mockDefaultSetup(cy);
    cy.visit("/");
    cy.get("[data-cy=video-panel]").get("[data-cy=video-thumbnail-clint]");
    cy.get("[data-cy=video-panel]").get("[data-cy=video-thumbnail-carlos]");
    cy.get("[data-cy=video-panel]").get("[data-cy=video-thumbnail-julianne]");
  });

  it("can fave mentor via star", () => {
    mockDefaultSetup(cy);
    cy.visit("/");
    cy.get("[data-cy=video-thumbnail-container-clint]").within(() => {
      cy.get("[data-cy=fave-button]")
        .click()
        .then(() => {
          cy.get("[data-cy=fave-button]").should(
            "have.css",
            "color",
            "rgb(255, 255, 0)"
          );
        });
    });
  });

  it("does not show chat-only mentors in panel", () => {
    mockDefaultSetup(cy, { mentorData: [clint, carlos, covid] });
    cy.visit("/?mentor=clint&mentor=carlos&mentor=covid");
    cy.get("[data-cy=video-panel]").get("[data-cy=video-thumbnail-clint]");
    cy.get("[data-cy=video-panel]").get("[data-cy=video-thumbnail-carlos]");
    cy.get("[data-cy=video-panel]")
      .get("[data-cy=video-thumbnail-covid]")
      .should("not.exist");
  });

  it("all classifier requests are loaded before proceeding", () => {
    mockDefaultSetup(cy);
    cy.visit("/?mentor=clint&mentor=carlos");
    cy.get("[data-cy=video-panel]");
    cy.get("[data-cy=input-field]").type("is the food good");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();
    cy.wait("@carlos-query");
    // Despite recieving a response to carlos, we are still waiting for all responses before continuing
    cy.get("[data-cy=video-thumbnail-carlos]").within(($within) => {
      cy.get("[data-cy=loading-answer-spinner]").should("exist");
    });
    cy.get("[data-cy=video-thumbnail-clint]").within(($within) => {
      cy.get("[data-cy=loading-answer-spinner]").should("exist");
    });
  });

  it("while answers are loading in (no answer yet), panels are greyed out", () => {
    mockDefaultSetup(cy);
    cy.visit("/?mentor=clint&mentor=carlos");
    cy.get("[data-cy=video-panel]");
    cy.get("[data-cy=input-field]").type("is the food good");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();
    cy.get("[data-cy=video-thumbnail-clint]").should(
      "have.css",
      "opacity",
      "0.6"
    );
    cy.get("[data-cy=video-thumbnail-carlos]").should(
      "have.css",
      "opacity",
      "0.6"
    );
  });

  it("off topic responses are slightly greyed out", () => {
    mockDefaultSetup(cy);
    cy.visit("/?mentor=clint&mentor=carlos");
    cy.get("[data-cy=video-panel]");
    cy.get("[data-cy=input-field]").type("is the food good");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();
    cy.wait("@carlos-query");
    cy.wait("@clint-query");
    cy.get("[data-cy=video-thumbnail-clint]").should(
      "have.css",
      "opacity",
      "0.8"
    );
    cy.get("[data-cy=video-thumbnail-carlos]").should(
      "have.css",
      "opacity",
      "0.8"
    );
  });

  it("if all mentors respond off topic, idling mentor answers only, other mentors do not go next", () => {
    mockDefaultSetup(cy, { noMockApi: true });
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_off_topic_2.json",
      delay: 3000,
    }).as("clint-query");
    cy.intercept("**/questions/?mentor=carlos&query=*", {
      fixture: "response_off_topic.json",
    }).as("carlos-query");
    cy.visit("/?mentor=clint&mentor=carlos");
    cy.get("[data-cy=video-thumbnail-carlos]").click();
    cy.get("[data-cy=input-field]").type("is the food good");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();
    cy.wait("@carlos-query");
    cy.wait("@clint-query");
    cy.get("[data-cy=video-thumbnail-carlos]").should("have.class", "selected");
    cy.get("[data-cy=video-thumbnail-clint]").within(() => {
      cy.get("[data-cy=answer-recieved-icon]").should("not.exist");
    });
  });

  it("if all mentors respond with the same confidence, idling mentor answers first", () => {
    mockDefaultSetup(cy, { noMockApi: true });
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_perfect_confidence.json", // this one is also off topic, but different value
      delay: 3000,
    }).as("clint-query");
    cy.intercept("**/questions/?mentor=carlos&query=*", {
      fixture: "response_perfect_confidence.json",
    }).as("carlos-query");
    cy.visit("/?mentor=clint&mentor=carlos");
    cy.get("[data-cy=video-thumbnail-carlos]").click();
    cy.get("[data-cy=input-field]").type("is the food good");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();
    cy.wait("@carlos-query");
    cy.wait("@clint-query");
    cy.get("[data-cy=video-thumbnail-carlos]").should("have.class", "selected");
  });
});
