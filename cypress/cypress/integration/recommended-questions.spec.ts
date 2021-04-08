/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { addGuestParams, mockDefaultSetup } from "../support/helpers";

describe("Recommended questions", () => {
    it("do not appear in topic list if no questions are recommended", () => {
        mockDefaultSetup(cy);
        cy.visit("/", { qs: addGuestParams() });
        cy.get("#topics").should("not.have.value", "Recommended");
    });

    it("appear in topic list if questions are recommended", () => {
        mockDefaultSetup(cy);
        cy.visit("/", {
            qs: addGuestParams({
                recommendedQuestions: "Howdy",
            }),
        });
        cy.get("#topics").contains("Recommended");
    });

    it("appear as default topic", () => {
        mockDefaultSetup(cy);
        cy.visit("/", {
            qs: addGuestParams({
                recommendedQuestions: "Howdy",
            }),
        });
        cy.get("#topics")
            .find(".topic-selected")
            .contains("Recommended");
    });

    it("list recommended questions in question list", () => {
        mockDefaultSetup(cy);
        cy.visit("/", {
            qs: addGuestParams({
                recommendedQuestions: ["Howdy", "Partner"],
            }),
        });
        cy.get("#scrolling-questions-list").contains("Howdy");
        cy.get("#scrolling-questions-list").contains("Partner");
    });

    it("display an icon next to recommended questions", () => {
        mockDefaultSetup(cy);
        cy.visit("/", {
            qs: addGuestParams({
                recommendedQuestions: "Howdy",
            }),
        });
        cy.get("#scrolling-questions-list")
            .get(`#${CSS.escape("Howdy")}`)
            .find(".recommended-question-icon");
    });

    it("appear at the top of other topic questions", () => {
        mockDefaultSetup(cy);
        cy.visit("/", {
            qs: addGuestParams({
                recommendedQuestions: "What do you do in computer science/programming?",
            }),
        });
        cy.get("#topic-0").find(".topic-selected");
        cy.get("#topic-2").trigger('mouseover').click();
        cy.get("#topic-2").find(".topic-selected");
        cy.get("#scrolling-questions-list")
            .get("li")
            .first()
            .contains("What do you do in computer science/programming?");
        cy.get("#scrolling-questions-list")
            .get("li")
            .first()
            .find(".recommended-question-icon");
    });
});
