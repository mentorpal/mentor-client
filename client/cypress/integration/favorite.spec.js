/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { addGuestParams, mockMentorData } from "./helpers";

describe("Favorite", () => {
  beforeEach(() => {
    cy.server();
    mockMentorData(cy);
    cy.viewport("iphone-x");
  });

  it("is not toggled by default", () => {
    cy.visit("/", { qs: addGuestParams() });
    cy.get("#fave-button")
      .invoke("attr", "style")
      .should("contain", "grey");
    cy.get("#video-thumbnail-clint");
  });

  it("can be toggled via star button", () => {
    cy.visit("/", { qs: addGuestParams() });
    cy.wait(500);
    // favorite current mentor
    cy.get("#fave-button").click();
    cy.get("#fave-button")
      .invoke("attr", "style")
      .should("contain", "yellow");
    cy.get("#video-thumbnail-clint")
      .get(".star-icon")
      .invoke("attr", "style")
      .should("contain", "yellow");
    // unfavorite current mentor
    cy.get("#fave-button").click();
    cy.get("#fave-button")
      .invoke("attr", "style")
      .should("contain", "grey");
    cy.get("#video-thumbnail-clint")
      .get(".star-icon")
      .invoke("attr", "style")
      .should("contain", "grey");
  });

  it("can be toggled via mentor panel", () => {
    cy.visit("/", { qs: addGuestParams() });
    cy.wait(500);
    // select dan
    cy.get("#video-thumbnail-dan").click();
    cy.get("#video-thumbnail-dan")
      .get(".star-icon")
      .invoke("attr", "style")
      .should("contain", "yellow");
    // select carlos
    cy.get("#video-thumbnail-carlos").click();
    cy.get("#video-thumbnail-carlos")
      .get(".star-icon")
      .invoke("attr", "style")
      .should("contain", "yellow");
    // unselect carlos
    cy.get("#video-thumbnail-carlos").click();
    cy.get("#video-thumbnail-carlos")
      .get(".star-icon")
      .invoke("attr", "style")
      .should("contain", "grey");
  });

  it("is hidden if there is only one mentor", () => {
    cy.visit(
      "/",
      addGuestParams({
        qs: {
          mentor: "clint",
        },
      })
    );
    cy.get("#fave-button").should("not.exist");
  });
});
