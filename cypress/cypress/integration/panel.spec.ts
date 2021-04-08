/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { mockDefaultSetup, mockConfig, mockMentorData } from "../support/helpers";

const clint = require("../fixtures/clint.json");
const carlos = require("../fixtures/carlos.json");
const covid = require("../fixtures/covid.json");

describe.only("Mentor panel", () => {

    it("shows if there is more than one mentor", () => {
        mockDefaultSetup(cy);
        cy.visit("/?mentor=clint&mentor=carlos");
        cy.get("#video-panel");
    });

    it("is hidden if there is only one mentor", () => {
        mockDefaultSetup(cy);
        cy.visit("/?mentor=clint");
        cy.get("#video-panel").should("not.exist");
    });

    it("displays default mentors if no mentors specified and DEFAULT_MENTORS is set", () => {
        mockDefaultSetup(cy);
        cy.intercept("**/config", { DEFAULT_MENTORS: ["clint", "carlos", "julianne"] });
        cy.visit("/");
        cy.get("#video-panel").get("#video-thumbnail-clint");
        cy.get("#video-panel").get("#video-thumbnail-carlos");
        cy.get("#video-panel").get("#video-thumbnail-julianne");
    });

    it("picking a mentor sets them as faved", () => {
        mockDefaultSetup(cy);
        cy.visit("/");
        cy.get("#video-panel")
            .get("#video-thumbnail-clint")
            .trigger('mouseover').click();
        cy.get("#video-panel")
            .get("#video-thumbnail-clint")
            .get(".star-icon");
        cy.get("#video-panel")
            .get("#video-thumbnail-carlos")
            .trigger('mouseover').click();
        cy.get("#video-panel")
            .get("#video-thumbnail-carlos")
            .get(".star-icon");
    });

    it("does not show chat-only mentors in panel", () => {
        mockConfig(cy, {});
        mockMentorData(cy, [clint, carlos, covid]);
        cy.visit("/?mentor=clint&mentor=carlos&mentor=covid");
        cy.get("#video-panel").get("#video-thumbnail-clint");
        cy.get("#video-panel").get("#video-thumbnail-carlos");
        cy.get("#video-panel").get("#video-thumbnail-covid").should("not.exist");
    })
});