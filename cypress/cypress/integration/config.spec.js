/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { mockDefaultSetup, visitAsGuestWithDefaultSetup } from "../support/helpers";

describe("Config", () => {
    it("disables cmi5 guest prompt if DISABLE_CMI5=true", () => {
        mockDefaultSetup(cy, { DISABLE_CMI5: true });
        cy.intercept("**/config", { DISABLE_CMI5: true });
        cy.visit("/");
        cy.get("#guest-prompt").should("not.exist");
    });

    it("loads a single default mentor if DEFAULT_MENTORS=clint", () => {
        mockDefaultSetup(cy, { DEFAULT_MENTORS: "clint" });
        visitAsGuestWithDefaultSetup(cy, "/");
        cy.get("#header").contains("Clinton Anderson: Nuclear Electrician's Mate");
        cy.get("#video-panel").should("not.exist");
    });

    it("loads multiple default mentors if DEFAULT_MENTORS=clint,dan", () => {
        mockDefaultSetup(cy, { DEFAULT_MENTORS: "clint,dan" });
        visitAsGuestWithDefaultSetup(cy, "/");
        cy.get("#video-panel").get("#video-thumbnail-clint");
        cy.get("#video-panel").get("#video-thumbnail-dan");
    });

    it("shows chat instead of video if USE_CHAT_INTERFACE=true", () => {
        mockDefaultSetup(cy, { DEFAULT_MENTORS: "clint", USE_CHAT_INTERFACE: true });
        visitAsGuestWithDefaultSetup(cy, "/");
        cy.get("#chat-thread").should("exist");
        cy.get("#video-container").should("not.exist");
    });
});