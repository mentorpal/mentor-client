/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { mockDefaultSetup } from "../support/helpers";

const clint = require("../fixtures/clint.json");
const carlos = require("../fixtures/carlos.json");

describe("Config", () => {
  it("disables cmi5 guest prompt if config.cmi5Enabled=false", () => {
    mockDefaultSetup(cy, { config: { cmi5Enabled: false } });
    cy.visit("/");
    cy.get("[data-cy=guest-prompt]").should("not.exist");
  });

  it("enables cmi5 guest prompt if config.cmi5Enabled=false", () => {
    mockDefaultSetup(cy, { config: { cmi5Enabled: true } });
    cy.visit("/");
    cy.get("[data-cy=guest-prompt]").should("exist");
  });

  it("loads a single default mentor if mentorsDefault specifies", () => {
    mockDefaultSetup(cy, {
      config: { mentorsDefault: ["clint"] },
      mentorData: [clint],
    });
    cy.visit("/");
    cy.get("[data-cy=header]").contains(
      "Clinton Anderson: Nuclear Electrician's Mate"
    );
    cy.get("[data-cy=video-panel]").should("not.exist");
  });

  it("loads multiple default mentors if mentorsDefault specifies", () => {
    mockDefaultSetup(cy, {
      config: { mentorsDefault: ["clint", "carlos"] },
      mentorData: [clint, carlos],
    });
    cy.visit("/");
    cy.get("[data-cy=video-panel]").get("[data-cy=video-thumbnail-clint]");
    cy.get("[data-cy=video-panel]").get("[data-cy=video-thumbnail-carlos]");
  });
});
