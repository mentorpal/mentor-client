/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { addGuestParams, mockMentorData } from "./helpers";

function snapname(n) {
  return `screenshots-history-${n}`;
}

describe("History", () => {
  beforeEach(() => {
    cy.server();
    cy.viewport("iphone-x");
    mockMentorData(cy);
    cy.visit("/", {
      qs: addGuestParams(),
    });
  });

  it("does not display in topics list if no questions have been asked", () => {
    cy.get("#topics").scrollTo("right", { duration: 300 });
    cy.get("#input").matchImageSnapshot(
      snapname("is empty if no questions asked")
    );
  });

  it("displays in topics list if questions have been asked", () => {
    cy.get("#topic-0").click();
    cy.get("#input-send").click();
    cy.get("#input-field").fill("Hello");
    cy.get("#input-send").click();
    cy.get("#input-field").fill("World");
    cy.get("#input-send").click();
    cy.wait(500);
    cy.get("#topic-8").click();
    cy.get("#topic-8").scrollIntoView();
    cy.get("#input").matchImageSnapshot(snapname("displays questions asked"));
  });

  it("does not read duplicate questions", () => {
    cy.get("#input-field").fill("Hello");
    cy.get("#input-send").click();
    cy.get("#input-field").fill("World");
    cy.get("#input-send").click();
    cy.get("#input-field").fill("Hello");
    cy.get("#input-send").click();
    cy.wait(500);
    cy.get("#topic-8").click();
    cy.get("#topic-8").scrollIntoView();
    cy.get("#input").matchImageSnapshot(snapname("does not show duplicates"));
  });
});
