/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { visitAsGuestWithDefaultSetup } from "../support/helpers";

describe("History", () => {
  it("does not display in topics list if no questions have been asked", () => {
    visitAsGuestWithDefaultSetup(cy, "/");
    cy.get("[data-cy=header]").should("have.attr", "data-mentor", "clint");
    cy.get("[data-cy=topics]").should("not.have.value", "History");
  });

  it("displays in topics list if questions have been asked", () => {
    visitAsGuestWithDefaultSetup(cy, "/");
    cy.get("[data-cy=header]").should("have.attr", "data-mentor", "clint");
    cy.get("[data-cy=input-field]").type("Hello");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();
    cy.get("[data-cy=topics]").contains("History");
  });

  it("displays questions that have been asked via input", () => {
    visitAsGuestWithDefaultSetup(cy, "/");
    cy.get("[data-cy=header]").should("have.attr", "data-mentor", "clint");
    cy.get("[data-cy=input-field]").type("Hello");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();
    cy.get("[data-cy=topic-2]").trigger("mouseover").click();
    cy.get("[data-cy=scrolling-questions-list]").contains("Hello");
  });


  it.only("displays both questions and answers as a chat", () => {
    visitAsGuestWithDefaultSetup(cy, "/");
    cy.viewport('macbook-11')
    cy.get("[data-cy=header]").should("have.attr", "data-mentor", "clint");
    cy.get("[data-cy=topic-2] button").trigger("mouseover").click();
    cy.get("[data-cy=history-chat]").should('exist');
    cy.get("[data-cy=input-field]").type("user msg 1");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();
    cy.get("[data-cy=chat-msg-0]");
    cy.get("[data-cy=chat-msg-1]").contains("user msg 1");
    cy.get("[data-cy=chat-msg-2]").contains("I'm thirty seven years old.");
    
    
    
    // cy.get("[data-cy=history]").within(($hc) => {
    //   cy.get("[data-cy=msg-user-1]").contains("user msg 1");
    // });
  });

  it("displays questions that have been asked via topic button", () => {
    visitAsGuestWithDefaultSetup(cy, "/");
    cy.get("[data-cy=header]").should("have.attr", "data-mentor", "clint");
    cy.get("[data-cy=topic-0]").trigger("mouseover").click();
    cy.get("[data-cy=topic-0]").trigger("mouseover").click();
    cy.get("[data-cy=input-send]").trigger("mouseover").click();
    cy.get("[data-cy=topic-2]").trigger("mouseover").click();
    cy.get("[data-cy=scrolling-questions-list]").contains(
      "Where were you born?"
    );
  });

  it("displays most recent questions at the top", () => {
    visitAsGuestWithDefaultSetup(cy, "/");
    cy.get("[data-cy=header]").should("have.attr", "data-mentor", "clint");
    cy.get("[data-cy=input-field]").type("Hello");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();
    cy.get("[data-cy=topic-2]").trigger("mouseover").click();
    cy.get("[data-cy=scrolling-questions-list]").should(
      "have.attr",
      "data-topic",
      "History"
    );
    cy.get("[data-cy=scrolling-questions-list]")
      .get("li")
      .first()
      .contains("Hello");
    cy.get("[data-cy=input-field]").type("World");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();
    cy.get("[data-cy=scrolling-questions-list]")
      .get("li")
      .first()
      .contains("World");
  });

  it("does not read duplicate questions", () => {
    visitAsGuestWithDefaultSetup(cy, "/");
    cy.get("[data-cy=header]").should("have.attr", "data-mentor", "clint");
    cy.get("[data-cy=input-field]").type("Hello");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();
    cy.get("[data-cy=topic-2]").trigger("mouseover").click();
    cy.get("[data-cy=scrolling-questions-list]").should(
      "have.attr",
      "data-topic",
      "History"
    );
    cy.get("[data-cy=scrolling-questions-list]").contains("Hello");
    cy.get("[data-cy=input-field]").type("World");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();
    cy.get("[data-cy=scrolling-questions-list]").contains("Hello");
    cy.get("[data-cy=scrolling-questions-list]").contains("World");
    cy.get("[data-cy=scrolling-questions-list]")
      .find("li")
      .should("have.length", 2);
    cy.get("[data-cy=scrolling-questions-list]")
      .get("li")
      .first()
      .contains("World");
    cy.get("[data-cy=input-field]").type("Hello");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();
    cy.get("[data-cy=scrolling-questions-list]").contains("Hello");
    cy.get("[data-cy=scrolling-questions-list]").contains("World");
    cy.get("[data-cy=scrolling-questions-list]")
      .find("li")
      .should("have.length", 2);
    cy.get("[data-cy=scrolling-questions-list]")
      .get("li")
      .first()
      .contains("World");
  });
});
