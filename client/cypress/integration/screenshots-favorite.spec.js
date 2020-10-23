/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { addGuestParams, mockMentorData } from "./helpers";

function snapname(n) {
  return `screenshots-favorite-${n}`;
}

describe("Favorite", () => {
  beforeEach(() => {
    cy.server();
    cy.viewport("iphone-x");
    mockMentorData(cy);
    cy.visit("/", {
      qs: addGuestParams(),
    });
  });

  it("is not toggled by default", () => {
    cy.wait(500);
    cy.matchImageSnapshot(snapname("off"));
  });

  it("can be toggled", () => {
    cy.wait(500);
    cy.get("#fave-button").click();
    cy.matchImageSnapshot(snapname("on"));
  });

  it("is hidden if there is only one mentor", () => {
    cy.visit("/", {
      qs: addGuestParams({ mentor: "clint" }),
    });
    cy.wait(500);
    cy.matchImageSnapshot(snapname("hidden"));
  });
});
