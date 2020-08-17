/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { mockMentorData, toGuestUrl } from "./helpers";

describe("Mentor panel", () => {
  beforeEach(() => {
    cy.server();
    mockMentorData(cy);
    cy.viewport("iphone-x");
  });

  it("shows if there is more than one mentor", () => {
    cy.visit(toGuestUrl("/?mentor=clint&mentor=dan"));
    cy.get("#video-panel");
  });

  it("is hidden if there is only one mentor", () => {
    cy.visit(toGuestUrl("/?mentor=clint"));
    cy.get("#video-panel").should("not.exist");
  });

  it("displays 4 default mentors if no mentors specified", () => {
    cy.visit("/");
    cy.get("#video-panel").get("#video-thumbnail-clint");
    cy.get("#video-panel").get("#video-thumbnail-dan");
    cy.get("#video-panel").get("#video-thumbnail-carlos");
    cy.get("#video-panel").get("#video-thumbnail-julianne");
  });

  it("loads and displays chosen mentors if mentors specified", () => {
    cy.visit(
      toGuestUrl("/?mentor=jd_thomas&mentor=mario-pais&mentor=dan-burns")
    );
    cy.get("#video-panel").get("#video-thumbnail-jd_thomas");
    cy.get("#video-panel").get("#video-thumbnail-mario-pais");
    cy.get("#video-panel").get("#video-thumbnail-dan-burns");

    cy.get("#header").contains(
      "JD Thomas: NPS Student, Lieutenant, AOPS and ASWO"
    );

    cy.get("#video-thumbnail-mario-pais").click();
    cy.get("#header").contains(
      "Mario Pais: Senior Chief, Lead NECC UMS Instructor"
    );

    cy.get("#video-thumbnail-dan-burns").click();
    cy.get("#header").contains("Dan Burns: Captain (Retired), Chief Engineer");
  });

  it("picking a mentor sets them as faved", () => {
    cy.visit("/");
    cy.get("#guest-prompt-input").type("guest");
    cy.get("#guest-prompt-input-send").click();
    cy.get("#video-panel")
      .get("#video-thumbnail-dan")
      .click();
    cy.get("#video-panel")
      .get("#video-thumbnail-dan")
      .get(".star-icon");
    cy.get("#video-panel")
      .get("#video-thumbnail-carlos")
      .click();
    cy.get("#video-panel")
      .get("#video-thumbnail-carlos")
      .get(".star-icon");
  });
});
