/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { visitAsGuestWithDefaultSetup } from "../support/helpers";

describe("Questions list", () => {

    it("displays list of questions for selected topic", () => {
        visitAsGuestWithDefaultSetup(cy, "/");
        cy.get("#scrolling-questions-list").contains("Where were you born?");
        cy.get("#scrolling-questions-list").contains("What do you do in computer science");
        cy.get("#scrolling-questions-list").contains("What qualifications and experience do recruiters").should("not.exist");
    });

    it("changes questions when switching topics", () => {
        visitAsGuestWithDefaultSetup(cy, "/");
        cy.get("#topic-1").trigger('mouseover').click();
        cy.get("#scrolling-questions-list").contains("Where were you born?").should("not.exist");
        cy.get("#scrolling-questions-list").contains("What do you do in computer science").should("not.exist");
        cy.get("#scrolling-questions-list").contains("What qualifications and experience do recruiters");
    });

    it("changes questions when switching mentors", () => {
        visitAsGuestWithDefaultSetup(cy, "/");
        cy.get("#scrolling-questions-list").contains("What do you do in computer science");
        cy.get("#scrolling-questions-list").contains("What do you do in the marines?").should("not.exist");
        cy.get("#video-thumbnail-carlos").trigger('mouseover').click();
        cy.get("#scrolling-questions-list").contains("What do you do in computer science").should("not.exist");
        cy.get("#scrolling-questions-list").contains("What do you do in the marines?");
        cy.get("#video-thumbnail-julianne").trigger('mouseover').click();
        cy.get("#scrolling-questions-list").contains("What do you do in computer science/programming?").should("not.exist");
        cy.get("#scrolling-questions-list").contains("What do you do in the marines?").should("not.exist");
    });

    it("greys out questions that have been asked (via topic button)", () => {
        visitAsGuestWithDefaultSetup(cy, "/");
        cy.get("#scrolling-questions-list")
            .get(`#${CSS.escape("Where were you born?")}`)
            .find("div")
            .invoke("attr", "style")
            .should("contain", "black");
        cy.get("#topic-1").trigger('mouseover').click();
        cy.get("#topic-0").trigger('mouseover').click();
        cy.get("#input-send").trigger('mouseover').click();
        cy.get("#scrolling-questions-list")
            .get(`#${CSS.escape("Where were you born?")}`)
            .find("div")
            .invoke("attr", "style")
            .should("contain", "gray");
    });

    it("greys out questions that have been asked (via input field)", () => {
        visitAsGuestWithDefaultSetup(cy, "/");
        cy.get("#input-field").type("where were you born?");
        cy.get("#input-send").trigger('mouseover').click();
        cy.get("#scrolling-questions-list")
            .get(`#${CSS.escape("Where were you born?")}`)
            .find("div")
            .invoke("attr", "style")
            .should("contain", "gray");
    });

    it("keeps greyed out questions when switching mentors if new mentor also has it", () => {
        visitAsGuestWithDefaultSetup(cy, "/");
        cy.get("#input-field").type("where were you born?");
        cy.get("#input-send").trigger('mouseover').click();
        cy.get("#scrolling-questions-list")
            .get(`#${CSS.escape("Where were you born?")}`)
            .find("div")
            .invoke("attr", "style")
            .should("contain", "gray");
        cy.get("#video-thumbnail-carlos").trigger('mouseover').click();
        cy.get("#scrolling-questions-list")
            .get(`#${CSS.escape("Where were you born?")}`)
            .find("div")
            .invoke("attr", "style")
            .should("contain", "gray");
    });

    it("keeps greyed out questions when switching topics if new topic also has it", () => {
        visitAsGuestWithDefaultSetup(cy, "/");
        cy.get("#input-field").type("What do you do in computer science/programming?");
        cy.get("#input-send").trigger('mouseover').click();
        cy.get("#scrolling-questions-list")
            .get(`#${CSS.escape("What do you do in computer science/programming?")}`)
            .find("div")
            .invoke("attr", "style")
            .should("contain", "gray");
        cy.get("#topic-1").trigger('mouseover').click();
        cy.get("#scrolling-questions-list")
            .get(`#${CSS.escape("What do you do in computer science/programming?")}`)
            .find("div")
            .invoke("attr", "style")
            .should("contain", "gray");
    });
});