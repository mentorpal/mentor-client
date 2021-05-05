/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { visitAsGuestWithDefaultSetup } from "../support/helpers";

describe("Topics list", () => {
    it("shows topics for current mentor", () => {
        visitAsGuestWithDefaultSetup(cy, "/");
        cy.get("[data-cy=topics]").contains("About Me");
        cy.get("[data-cy=topics]").contains("About the Job");
    });

    it("has default topic selected", () => {
        visitAsGuestWithDefaultSetup(cy, "/");
        cy.get("[data-cy=topics]")
            .find(".topic-selected")
            .should("have.length", 1);
        cy.get("[data-cy=topic-0]").find(".topic-selected");
    });

    it("can select a topic", () => {
        visitAsGuestWithDefaultSetup(cy, "/");
        cy.get("[data-cy=topic-1]").trigger('mouseover').click();
        cy.get("[data-cy=topics]")
            .find(".topic-selected")
            .should("have.length", 1);
        cy.get("[data-cy=topic-1]").find(".topic-selected");
    });

    it("can collapse questions list by clicking selected topic", () => {
        visitAsGuestWithDefaultSetup(cy, "/");
        cy.get("[data-cy=scrolling-questions-list]")
        cy.get("[data-cy=topic-0]").trigger('mouseover').click();
        cy.get("[data-cy=topic-0]").find(".topic-selected").should("not.exist");
        cy.get("[data-cy=scrolling-questions-list]").should("not.exist")
    })

    it("changes topics when selecting a mentor", () => {
        visitAsGuestWithDefaultSetup(cy, "/");
        cy.get("[data-cy=video-thumbnail-carlos]").should("have.attr", "data-ready", "true")
        cy.get("[data-cy=video-thumbnail-carlos]").trigger('mouseover').click();
        cy.get("[data-cy=topics]").contains("About Me");
        cy.get("[data-cy=topics]").contains("About the Job");

        cy.get("[data-cy=video-thumbnail-julianne]").should("have.attr", "data-ready", "true")
        cy.get("[data-cy=video-thumbnail-julianne]").trigger('mouseover').click();
        cy.get("[data-cy=topics]").contains("About Me");
        cy.get("[data-cy=topics]").contains("Challenges");
    });

    it("keeps selected topic when switching mentors if new mentor has it", () => {
        visitAsGuestWithDefaultSetup(cy, "/");
        cy.get("[data-cy=topic-1]").trigger('mouseover').click();
        cy.get("[data-cy=topic-1]").find(".topic-selected");
        cy.get("[data-cy=video-thumbnail-carlos]").should("have.attr", "data-ready", "true")
        cy.get("[data-cy=video-thumbnail-carlos]").trigger('mouseover').click();
        cy.get("[data-cy=topic-1]").find(".topic-selected");
    });

    it("does not keep selected topic when switching mentors if new mentor does not have it", () => {
        visitAsGuestWithDefaultSetup(cy, "/");
        cy.get("[data-cy=topic-1]").trigger('mouseover').click();
        cy.get("[data-cy=topic-1]").find(".topic-selected");
        cy.get("[data-cy=video-thumbnail-julianne]").should("have.attr", "data-ready", "true")
        cy.get("[data-cy=video-thumbnail-julianne]").trigger('mouseover').click();
        cy.get("[data-cy=topic-1]").not(".topic-selected");
    });

    it("recommends a topic-relevant question for current mentor when topic is selected", () => {
        visitAsGuestWithDefaultSetup(cy, "/");
        cy.get("[data-cy=topic-1]").trigger('mouseover').click();
        cy.get("[data-cy=input-field-wrapper]").should("have.attr", "data-topic", "About the Job")
        cy.get("[data-cy=input-field]").contains(
            "What qualifications and experience do recruiters"
        );
    });

    it("recommends different topic-relevant question for different current mentor", () => {
        visitAsGuestWithDefaultSetup(cy, "/");
        cy.get("[data-cy=video-thumbnail-julianne]").should("have.attr", "data-ready", "true")
        cy.get("[data-cy=video-thumbnail-julianne]").trigger('mouseover').click();
        cy.get("[data-cy=topic-1]").trigger('mouseover').click();
        cy.get("[data-cy=input-field-wrapper]").should("have.attr", "data-topic", "Challenges")
        cy.get("[data-cy=input-field]").contains("Were you worried about starting college?");
    });

    it("does not recommend a topic question that has already been asked (via manual input)", () => {
        visitAsGuestWithDefaultSetup(cy, "/");
        cy.get("[data-cy=input-field]").type("where were you born?");
        cy.get("[data-cy=input-send]").trigger('mouseover').click();
        cy.get("[data-cy=topic-1]").trigger('mouseover').click();
        cy.get("[data-cy=input-field-wrapper]").should("have.attr", "data-topic", "About the Job")
        cy.get("[data-cy=topic-0]").trigger('mouseover').click();
        cy.get("[data-cy=input-field-wrapper]").should("have.attr", "data-topic", "About Me")
        cy.get("[data-cy=input-field]").contains("Are you fun at parties?");
    });

    it("does not recommend a topic question that has already been asked (via topic button)", () => {
        visitAsGuestWithDefaultSetup(cy, "/");
        cy.get("[data-cy=topic-1]").trigger('mouseover').click();
        cy.get("[data-cy=topic-0]").trigger('mouseover').click();
        cy.get("[data-cy=input-send]").trigger('mouseover').click();
        cy.get("[data-cy=topic-1]").trigger('mouseover').click();
        cy.get("[data-cy=input-field-wrapper]").should("have.attr", "data-topic", "About the Job")
        cy.get("[data-cy=topic-0]").trigger('mouseover').click();
        cy.get("[data-cy=input-field-wrapper]").should("have.attr", "data-topic", "About Me")
        cy.get("[data-cy=input-field]").contains("Are you fun at parties?");
    });

    it("skips topic questions that have already been asked", () => {
        visitAsGuestWithDefaultSetup(cy, "/");
        cy.get("[data-cy=input-field]").type("where were you born?");
        cy.get("[data-cy=input-send]").trigger('mouseover').click();
        cy.get("[data-cy=topic-1]").trigger('mouseover').click();
        cy.get("[data-cy=input-field-wrapper]").should("have.attr", "data-topic", "About the Job")
        cy.get("[data-cy=topic-0]").trigger('mouseover').click();
        cy.get("[data-cy=input-field-wrapper]").should("have.attr", "data-topic", "About Me")
        cy.get("[data-cy=input-field]").contains("Are you fun at parties");
    });
});