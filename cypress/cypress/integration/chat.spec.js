/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { mockDefaultSetup } from "../support/helpers";

describe("Chat", () => {
    it("does not show if USE_CHAT_INTERFACE env is not set", () => {
        mockDefaultSetup(cy);
        cy.intercept("**/config", { DEFAULT_MENTORS: "clint", DISABLE_CMI5: true });
        cy.visit("/");
        cy.get("#video-container").should("exist");
        cy.get("#chat-thread").should("not.exist");
    });

    it("does not show if USE_CHAT_INTERFACE env is set false", () => {
        mockDefaultSetup(cy, { DEFAULT_MENTORS: "clint", DISABLE_CMI5: true, USE_CHAT_INTERFACE: false });
        cy.visit("/");
        cy.get("#video-container").should("exist");
        cy.get("#chat-thread").should("not.exist");
    });

    it("replaces video if USE_CHAT_INTERFACE env is set true", () => {
        cy.intercept("**/mentors/clint/data", { fixture: "clint.json" });
        cy.intercept("**/questions/?mentor=*&query=*", { fixture: "clint_response.json" });
        cy.intercept("**/config", { DEFAULT_MENTORS: "clint", DISABLE_CMI5: true, USE_CHAT_INTERFACE: true });
        cy.viewport("iphone-x");
        cy.visit("/");
        cy.get("#chat-thread").should("exist");
        cy.get("#video-container").should("not.exist");
        cy.get("#chat-msg-0").contains("My name is EMC Clint Anderson. I was born in California and I have lived there most of my life. I graduated from Paramount and a couple of years after I finished high school, I joined the US Navy. I was an Electrician's Mate. I served on an aircraft carrier for eight years and then afterwards, I went to the United States Navy Reserve. During that time I started going to school with some of the abundant benefits that the military reserve has given me and I started working with various companies.");
        cy.get("#input-field").type("how old are you");
        cy.get("#input-send").trigger('mouseover').click();
        cy.get("#chat-msg-1").contains("how old are you");
        cy.get("#chat-msg-2").contains("I'm thirty seven years old.");
    });
});