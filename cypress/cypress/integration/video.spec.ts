/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { mockDefaultSetup, cyMockGQL } from "../support/helpers";
const clint = require("../fixtures/clint.json");
const carlos = require("../fixtures/carlos.json");
const FAKE_STYLE_HEADER_LOGO =
  "http://scribe.usc.edu/wp-content/uploads/2021/02/PrimShield_Word_SmUse_Gold-Wh_RGB-1.png";

describe("Video Mentor", () => {
  it("Display mentor-name card over the left-corner of the video", () => {
    mockDefaultSetup(cy, {
      config: { mentorsDefault: ["clint"] },
      mentorData: [clint],
      apiResponse: "response_with_feedback.json",
    });
    cy.visit("/");

    cy.get("[data-cy=header]").should("have.attr", "data-mentor", "clint");
    cy.get("[data-cy=header]").contains(
      "Clinton Anderson: Nuclear Electrician's Mate"
    );

    cy.get("[data-cy=video-container").within(($hc) => {
      cy.get("[data-cy=mentor-name-card]").should("exist");
    });

    cy.get("[data-cy=history-tab]").trigger("mouseover").click();
    cy.get("[data-cy=history-chat]").should("exist");
    // write msgs
    cy.get("[data-cy=input-field]").type("Question 1");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();
    // display card over a corner of the video
    cy.get("[data-cy=mentor-name-card]").should("exist");
  });

  it("Display mentor-name card & star over the left-corner of the video", () => {
    mockDefaultSetup(cy, {
      config: { mentorsDefault: ["clint", "carlos"] },
      mentorData: [clint, carlos],
      apiResponse: "response_with_feedback.json",
      gqlQueries: [
        cyMockGQL("UserQuestionSetFeedback", { userQuestionSetFeedback: null }),
      ],
    });
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback.json",
    });
    cy.visit("/");

    // Mentor Card in the beggining
    cy.get("[data-cy=video-container").within(($hc) => {
      cy.get("[data-cy=mentor-name-card]").should("exist");
      cy.get("[data-cy=mentorname-faveicon-wrapper]").within(($hc) => {
        cy.get("[data-cy=mentor-name]")
          .should("exist")
          .contains("Clinton Anderson");
        cy.get("[data-cy=fave-button]").should("exist");
      });
    });

    cy.get("[data-cy=header]").should("have.attr", "data-mentor", "clint");
    cy.get("[data-cy=history-tab]").trigger("mouseover").click();
    cy.get("[data-cy=history-chat]").should("exist");

    cy.get("[data-cy=input-field]").type("user msg 1");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    cy.get("[data-cy=history-chat").within(($hc) => {
      cy.get("[data-cy=chat-msg-1]").contains("user msg 1");
    });

    // Mentor Card at the end
    cy.get("[data-cy=video-container").within(($hc) => {
      cy.get("[data-cy=mentor-name-card]").should("exist");
      cy.get("[data-cy=mentorname-faveicon-wrapper]").within(($hc) => {
        cy.get("[data-cy=mentor-name]")
          .should("exist")
          .contains("Clinton Anderson");
        cy.get("[data-cy=fave-button]").should("exist");
      });
    });
  });

  it("Title Header for one mentor", () => {
    mockDefaultSetup(cy, {
      config: {
        cmi5Enabled: false,
        mentorsDefault: ["clint"],
        styleHeaderColor: "#990000",
        styleHeaderTextColor: "#FFFFFF",
        styleHeaderLogo: FAKE_STYLE_HEADER_LOGO,
      },
      mentorData: [clint],
    });
    cy.viewport(1200, 700);
    cy.intercept(FAKE_STYLE_HEADER_LOGO, { fixture: "uscheader2.png" });
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback.json",
    });
    cy.visit("/");

    cy.get("[data-cy=header]")
      .within(($h) => {
        cy.get("img")
          .should("have.attr", "src")
          .and("eq", FAKE_STYLE_HEADER_LOGO);
        cy.get("p").should("have.css", "color", "rgb(255, 255, 255)");
      })
      .should("have.css", "background-color", "rgb(153, 0, 0)")
      .contains("Clinton Anderson: Nuclear Electrician's Mate");
  });

  it("Title Header for two or more mentors", () => {
    mockDefaultSetup(cy, {
      config: {
        cmi5Enabled: false,
        mentorsDefault: ["clint", "carlos"],
        styleHeaderColor: "#990000",
        styleHeaderTextColor: "#FFFFFF",
        styleHeaderLogo: FAKE_STYLE_HEADER_LOGO,
      },
      mentorData: [clint, carlos],
    });
    cy.viewport(1200, 700);
    cy.intercept(FAKE_STYLE_HEADER_LOGO, { fixture: "uscheader2.png" });
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback.json",
    });
    cy.visit("/");

    cy.get("[data-cy=header]")
      .within(($h) => {
        cy.get("img")
          .should("have.attr", "src")
          .and("eq", FAKE_STYLE_HEADER_LOGO);
        cy.get("p").should("have.css", "color", "rgb(255, 255, 255)");
      })
      .should("have.css", "background-color", "rgb(153, 0, 0)")
      .contains("Mentor Panel");
  });
});