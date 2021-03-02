/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  mockDefaultSetup,
  visitAsGuestWithDefaultSetup,
} from "../support/helpers";

describe("Config", () => {
  it("disables cmi5 guest prompt if config.cmi5Enabled=false", () => {
    mockDefaultSetup(cy, { cmi5Enabled: false });
    cy.visit("/");
    cy.get("#guest-prompt").should("not.exist");
  });

  it("loads a single default mentor if mentorsDefault specifies", () => {
    mockDefaultSetup(cy, { mentorsDefault: ["clint"] });
    visitAsGuestWithDefaultSetup(cy, "/");
    cy.get("#header").contains("Clinton Anderson: Nuclear Electrician's Mate");
    cy.get("#video-panel").should("not.exist");
  });

  it("loads multiple default mentors if mentorsDefault specifies", () => {
    mockDefaultSetup(cy, { mentorsDefault: ["clint", "dan"] });
    visitAsGuestWithDefaultSetup(cy, "/");
    cy.get("#video-panel").get("#video-thumbnail-clint");
    cy.get("#video-panel").get("#video-thumbnail-dan");
  });
});
