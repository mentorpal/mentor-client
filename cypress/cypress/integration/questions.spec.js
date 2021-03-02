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
        cy.get("#scrolling-questions-list").contains("What is Japan like?");
        cy.get("#scrolling-questions-list").contains(
            "What kind of student were you?"
        );
        cy.get("#scrolling-questions-list").contains("When did you join the Navy?");
    });

    it("changes questions when switching topics", () => {
        visitAsGuestWithDefaultSetup(cy, "/");
        cy.get("#topic-1").trigger('mouseover').click();
        cy.get("#scrolling-questions-list").contains(
            "What qualifications and experience do recruiters"
        );
        cy.get("#scrolling-questions-list").contains("What is Japan like?");

        cy.get("#topic-2").trigger('mouseover').click();
        cy.get("#scrolling-questions-list").contains(
            "What is your strategy for overcoming your hardships?"
        );
        cy.get("#scrolling-questions-list").contains(
            "What do you see as the major problems for those"
        );
    });

    it("changes questions when switching mentors", () => {
        visitAsGuestWithDefaultSetup(cy, "/");
        cy.get("#video-thumbnail-dan").trigger('mouseover').click();
        cy.get("#scrolling-questions-list").contains(
            "How is cryptology different outside of the US?"
        );

        cy.get("#video-thumbnail-carlos").trigger('mouseover').click();
        cy.get("#scrolling-questions-list").contains("What is Puerto Rico like?");

        cy.get("#video-thumbnail-julianne").trigger('mouseover').click();
        cy.get("#scrolling-questions-list").contains(
            "Where were you commissioned?"
        );

        cy.get("#video-thumbnail-clint").trigger('mouseover').click();
        cy.get("#scrolling-questions-list").contains("What is Japan like?");
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
        cy.get("#input-field").type("Are you married?");
        cy.get("#input-send").trigger('mouseover').click();
        cy.get("#scrolling-questions-list")
            .get(`#${CSS.escape("Are you married?")}`)
            .find("div")
            .invoke("attr", "style")
            .should("contain", "gray");

        cy.get("#video-thumbnail-dan").trigger('mouseover').click();
        cy.get("#scrolling-questions-list")
            .get(`#${CSS.escape("Are you married?")}`)
            .find("div")
            .invoke("attr", "style")
            .should("contain", "gray");
    });

    it("keeps greyed out questions when switching topics if new topic also has it", () => {
        visitAsGuestWithDefaultSetup(cy, "/");
        cy.get("#input-field").type("Are you married?");
        cy.get("#input-send").trigger('mouseover').click();
        cy.get("#scrolling-questions-list")
            .get(`#${CSS.escape("Are you married?")}`)
            .find("div")
            .invoke("attr", "style")
            .should("contain", "gray");

        cy.get("#topic-4").trigger('mouseover').click();
        cy.get("#scrolling-questions-list")
            .get(`#${CSS.escape("Are you married?")}`)
            .find("div")
            .invoke("attr", "style")
            .should("contain", "gray");
    });
});