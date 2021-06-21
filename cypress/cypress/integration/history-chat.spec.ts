/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  visitAsGuestWithDefaultSetup,
  mockDefaultSetup,
  cyMockGQL,
} from "../support/helpers";
const clint = require("../fixtures/clint.json");

describe("Video Chat History", () => {
  it("does not display in topics list if no questions have been asked", () => {
    visitAsGuestWithDefaultSetup(cy, "/");
    cy.viewport("macbook-11");
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
    cy.viewport("macbook-11");
    cy.get("[data-cy=header]").should("have.attr", "data-mentor", "clint");
    cy.get("[data-cy=topic-2]").trigger("mouseover").click();
    cy.get("[data-cy=input-field]").type("Hello");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();
    cy.get("[data-cy=history-chat]").contains("Hello");
  });

  it("displays both questions and answers as a chat", () => {
    mockDefaultSetup(cy, {
      config: { mentorsDefault: ["clint"] },
      mentorData: [clint],
      apiResponse: "response_with_feedback.json",
      gqlQueries: [cyMockGQL("userQuestionSetFeedback", null, false)],
    });
    cy.visit("/");
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback.json",
    });
    cy.viewport("macbook-11");
    cy.get("[data-cy=header]").should("have.attr", "data-mentor", "clint");
    cy.get("[data-cy=topic-2] button").trigger("mouseover").click();
    cy.get("[data-cy=history-chat]").should("exist");

    // Send first test message
    cy.get("[data-cy=input-field]").type("user msg 1");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();
    cy.get("[data-cy=input-field]").type("user msg 2");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();
    // cy.get("[data-cy=chat-msg-0]");
    // cy.get("[data-cy=chat-msg-1]").contains("user msg 1");
    // cy.get("[data-cy=chat-msg-2]").contains("I'm thirty seven years old.");

    // // Send second test message
    // cy.get("[data-cy=input-field]").type("user msg 2");
    // cy.get("[data-cy=input-send]").trigger("mouseover").click();
    // cy.get("[data-cy=chat-msg-3]");
    // cy.get("[data-cy=chat-msg-3]").contains("user msg 2");
    // cy.get("[data-cy=chat-msg-4]").contains("I'm thirty seven years old.");
    // cy.get("[data-cy=history]").within(($hc) => {
    //   cy.get("[data-cy=msg-user-1]").contains("user msg 1");
    // });
  });

  it("can give feedback on mentor answer", () => {
    mockDefaultSetup(cy, {
      config: { mentorsDefault: ["clint"] },
      mentorData: [clint],
      apiResponse: "response_with_feedback.json",
      gqlQueries: [cyMockGQL("userQuestionSetFeedback", null, false)],
    });
    cy.visit("/");
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback.json",
    });
    cy.viewport("macbook-11");
    cy.get("[data-cy=topic-2] button").trigger("mouseover").click();
    cy.get("[data-cy=history-chat]").should("exist");
    cy.get("[data-cy=input-field]").type("user msg 1");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();
    cy.get("[data-cy=history-chat").within($hc => {
      cy.get("[data-cy=chat-msg-0]").contains("user msg 1");
      cy.get("[data-cy=chat-msg-1]").within($cm => {
        cy.get('[data-cy=feedback-btn]').should("exist")
        cy.get("[data-cy=feedback-btn]").trigger("mouseover").click();
      });
    })
    cy.get("[data-cy=click-good]").should('exist')
    cy.get("[data-cy=click-good]").should('have.attr', 'data-test-in-progress', "false")
    cy.get("[data-cy=click-good]").trigger("mouseover").click();
    cy.get("[data-cy=click-good]").should('have.attr', 'data-test-in-progress', "true")




    // cy.get("[data-cy=chat-msg-3]").contains("user msg 2");
    // // Check if feedback toggle exists
    // cy.get(
    //   "[data-cy=chat-msg-4] [data-cy=feedback-btn] [data-cy=neutral]"
    // ).should("exist");

    // // click on feedback options
    // cy.get("[data-cy=chat-msg-4] [data-cy=feedback-btn]")
    //   .trigger("mouseover")
    //   .click();
    // cy.get("[data-cy=click-good]");
    // cy.get("[data-cy=click-neutral]");
    // // click on good feedback
    // cy.get("[data-cy=click-good]").trigger("mouseover").click();
  });

  it("Answers can be toggled open to see the transcript of the response", () => {
    mockDefaultSetup(cy, {
      config: { mentorsDefault: ["clint"] },
      mentorData: [clint],
      apiResponse: "response_with_feedback.json",
      gqlQueries: [cyMockGQL("userQuestionSetFeedback", null, false)],
    });
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback.json",
    });
    cy.viewport("macbook-11");
    cy.visit("/");

    // third test message
    cy.get("[data-cy=input-field]").type("test visibility toggle");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();
    cy.get("[data-cy=chat-msg-6]").contains("Give me feedback.");

    // // hide answer
    cy.get("[data-cy=eyeIcon-5]").trigger("mouseover").click();
    cy.get("[data-cy=chat-msg-6]").should("not.visible");
    cy.wait(3000);
    // show answer
    cy.get("[data-cy=eyeIcon-5]").trigger("mouseover").click();
    cy.get("[data-cy=chat-msg-6]").should("be.visible");

    // click on feedback options
    cy.get("[data-cy=chat-msg-6] [data-cy=feedback-btn]")
      .trigger("mouseover")
      .click();
    cy.get("[data-cy=click-bad]");
    cy.get("[data-cy=click-neutral]");
    // click on good feedback
    cy.get("[data-cy=click-bad]").trigger("mouseover").click();

    // eyeIcon-1
  });

  it("Answers are collapsed by default except the most recent", () => {
    // visitAsGuestWithDefaultSetup(cy, "/");
    mockDefaultSetup(cy, {
      config: { mentorsDefault: ["clint"] },
      mentorData: [clint],
      apiResponse: "response_with_feedback.json",
      gqlQueries: [cyMockGQL("userQuestionSetFeedback", null, false)],
    });
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback.json",
    });
    cy.viewport("macbook-11");
    cy.get("[data-cy=visibility-switch]").should("exist");
    cy.get("[data-cy=visibility-switch]").find("input").should("be.checked");
    cy.get("[data-cy=chat-msg-2]").should("not.visible");
    cy.get("[data-cy=chat-msg-4]").should("not.visible");
    cy.get("[data-cy=chat-msg-6]").should("be.visible");
  });

  it("When a new answer arrives, it is always open when it lands (regardless of switch)", () => {
    // visitAsGuestWithDefaultSetup(cy, "/");
    mockDefaultSetup(cy, {
      config: { mentorsDefault: ["clint"] },
      mentorData: [clint],
      apiResponse: "response_with_feedback.json",
      gqlQueries: [cyMockGQL("userQuestionSetFeedback", null, false)],
    });
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback.json",
    });
    cy.viewport("macbook-11");
    cy.get("[data-cy=visibility-switch]").should("exist");
    cy.get("[data-cy=visibility-switch]").find("input").should("be.checked");
    cy.get("[data-cy=chat-msg-2]").should("not.visible");
    cy.get("[data-cy=chat-msg-4]").should("not.visible");

    // new test message
    cy.get("[data-cy=input-field]").type(
      "New message is always open when it lands"
    );
    cy.get("[data-cy=input-send]").trigger("mouseover").click();
    cy.get("[data-cy=chat-msg-6]").should("not.visible");
    cy.get("[data-cy=chat-msg-8]").should("be.visible");

    // uncheck and check visibility switch (it is always open when regardless of switch)
    cy.get("[data-cy=visibility-switch]").find("input").uncheck();
    cy.wait(2000);
    cy.get("[data-cy=chat-msg-8]").scrollIntoView().should("be.visible");
    cy.wait(2000);
    cy.get("[data-cy=visibility-switch]").find("input").check();
    cy.wait(2000);
    cy.get("[data-cy=chat-msg-8]").scrollIntoView().should("be.visible");
  });

  it("If switch is set to Hide, then hides all answers ", () => {
    // visitAsGuestWithDefaultSetup(cy, "/");
    mockDefaultSetup(cy, {
      config: { mentorsDefault: ["clint"] },
      mentorData: [clint],
      apiResponse: "response_with_feedback.json",
      gqlQueries: [cyMockGQL("userQuestionSetFeedback", null, false)],
    });
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback.json",
    });
    cy.viewport("macbook-11");
    cy.get("[data-cy=visibility-switch]").should("exist");
    cy.get("[data-cy=visibility-switch]").find("input").should("be.checked");

    // check answers are hidden
    cy.get("[data-cy=chat-msg-2]").should("not.visible");
    cy.get("[data-cy=chat-msg-4]").should("not.visible");
    cy.get("[data-cy=chat-msg-6]").should("not.visible");
  });

  it("If switch is set to Show, then opens all answers", () => {
    // visitAsGuestWithDefaultSetup(cy, "/");
    mockDefaultSetup(cy, {
      config: { mentorsDefault: ["clint"] },
      mentorData: [clint],
      apiResponse: "response_with_feedback.json",
      gqlQueries: [cyMockGQL("userQuestionSetFeedback", null, false)],
    });
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback.json",
    });
    cy.viewport("macbook-11");
    cy.get("[data-cy=visibility-switch]").should("exist");
    cy.get("[data-cy=visibility-switch]").find("input").should("be.checked");
    cy.get("[data-cy=visibility-switch]").find("input").uncheck();

    // check answers are shown
    cy.get("[data-cy=chat-msg-2]").scrollIntoView().should("be.visible");
    cy.get("[data-cy=chat-msg-4]").scrollIntoView().should("be.visible");
    cy.get("[data-cy=chat-msg-6]").scrollIntoView().should("be.visible");
  });

  it("If switch is to *Hide* then when new answer arrives it is open at the bottom and all answers manually opened before it are left in their prior open/closed position", () => {
    // visitAsGuestWithDefaultSetup(cy, "/");
    mockDefaultSetup(cy, {
      config: { mentorsDefault: ["clint"] },
      mentorData: [clint],
      apiResponse: "response_with_feedback.json",
      gqlQueries: [cyMockGQL("userQuestionSetFeedback", null, false)],
    });
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback.json",
    });
    cy.viewport("macbook-11");

    // visibility for answers is hidden
    cy.get("[data-cy=visibility-switch]").find("input").check();
    cy.get("[data-cy=visibility-switch]").should("exist");
    cy.get("[data-cy=visibility-switch]").find("input").should("be.checked");

    // show answer of question 3
    cy.get("[data-cy=eyeIcon-3]").trigger("mouseover").click();
    cy.get("[data-cy=chat-msg-4]").scrollIntoView().should("be.visible");

    // new answer arrives
    cy.get("[data-cy=input-field]").type("answer 2 should be visible");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    // answer 4 should saty open even if switch is hidden
    cy.get("[data-cy=chat-msg-4]").scrollIntoView().should("be.visible");
  });

  it("If switch is to *Show* then when new answer arrives it is open and all other answers are left in their prior open/closed position", () => {
    // visitAsGuestWithDefaultSetup(cy, "/");
    mockDefaultSetup(cy, {
      config: { mentorsDefault: ["clint"] },
      mentorData: [clint],
      apiResponse: "response_with_feedback.json",
      gqlQueries: [cyMockGQL("userQuestionSetFeedback", null, false)],
    });
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback.json",
    });
    cy.viewport("macbook-11");

    // visibility for answers is hidden
    cy.get("[data-cy=visibility-switch]").find("input").uncheck();
    cy.get("[data-cy=visibility-switch]").should("exist");
    cy.get("[data-cy=visibility-switch]").find("input").should("not.checked");

    // hide answer of question 3
    cy.get("[data-cy=eyeIcon-3]").trigger("mouseover").click();
    cy.get("[data-cy=chat-msg-4]").should("not.be.visible");

    // new answer arrives
    cy.get("[data-cy=input-field]").type("answer 2 shouldn't be visible");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    // answer 4 should saty open even if switch is hidden
    // cy.get("[data-cy=chat-msg-4]").scrollIntoView().should('be.visible');
  });

  it("Button toggles in transcript to expand/collapse all answers ", () => {
    // visitAsGuestWithDefaultSetup(cy, "/");
    mockDefaultSetup(cy, {
      config: { mentorsDefault: ["clint"] },
      mentorData: [clint],
      apiResponse: "response_with_feedback.json",
      gqlQueries: [cyMockGQL("userQuestionSetFeedback", null, false)],
    });
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback.json",
    });
    cy.viewport("macbook-11");

    // visibility-reset-btn test
    cy.get("[data-cy=visibility-reset-btn]").should("exist");
    cy.get("[data-cy=visibility-reset-btn]").trigger("mouseover").click();

    // hide all answers
    cy.get("[data-cy=visibility-switch]").find("input").check();

    // check all answers are hidden
    cy.get("[data-cy=chat-msg-2]").should("not.be.visible");
    cy.get("[data-cy=chat-msg-4]").should("not.be.visible");
    cy.get("[data-cy=chat-msg-6]").should("not.be.visible");
    cy.get("[data-cy=chat-msg-8]").should("not.be.visible");
    cy.get("[data-cy=chat-msg-10]").should("not.be.visible");
    cy.get("[data-cy=chat-msg-12]").scrollIntoView().should("be.visible");

    // show all answers
    cy.get("[data-cy=visibility-switch]").find("input").uncheck();

    // check all answers are shown
    cy.get("[data-cy=chat-msg-2]").scrollIntoView().should("be.visible");
    cy.get("[data-cy=chat-msg-4]").scrollIntoView().should("be.visible");
    cy.get("[data-cy=chat-msg-6]").scrollIntoView().should("be.visible");
    cy.get("[data-cy=chat-msg-8]").scrollIntoView().should("be.visible");
    cy.get("[data-cy=chat-msg-10]").scrollIntoView().should("be.visible");
    cy.get("[data-cy=chat-msg-12]").scrollIntoView().should("be.visible");
  });

  // -----------------------------------------------------------------------------------------

  it("displays questions that have been asked via topic button", () => {
    visitAsGuestWithDefaultSetup(cy, "/");
    cy.viewport("macbook-11");
    cy.get("[data-cy=header]").should("have.attr", "data-mentor", "clint");
    cy.get("[data-cy=topic-0]").trigger("mouseover").click();
    cy.get("[data-cy=topic-0]").trigger("mouseover").click();
    cy.get("[data-cy=input-send]").trigger("mouseover").click();
    cy.get("[data-cy=topic-2]").trigger("mouseover").click();
    cy.get("[data-cy=history-chat]").contains("Where were you born?");
  });

  it("displays most recent questions at the top", () => {
    visitAsGuestWithDefaultSetup(cy, "/");
    cy.viewport("macbook-11");
    cy.get("[data-cy=header]").should("have.attr", "data-mentor", "clint");
    cy.get("[data-cy=input-field]").type("Hello");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();
    cy.wait(500);
    cy.get("[data-cy=input-send]").trigger("mouseover").click();
    cy.get("[data-cy=topic-2]").trigger("mouseover").click();
    cy.get("[data-cy=history-chat]").should(
      "have.attr",
      "data-topic",
      "History"
    );
    cy.get("[data-cy=history-chat]").get("li").first().contains("Hello");
    cy.get("[data-cy=input-field]").type("World");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();
    cy.get("[data-cy=history-chat]").get("li").contains("World");
  });

  it("does not read duplicate questions", () => {
    visitAsGuestWithDefaultSetup(cy, "/");
    cy.viewport("macbook-11");
    cy.get("[data-cy=header]").should("have.attr", "data-mentor", "clint");
    cy.get("[data-cy=input-field]").type("Hello");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();
    cy.get("[data-cy=topic-2]").trigger("mouseover").click();
    cy.get("[data-cy=history-chat]").should(
      "have.attr",
      "data-topic",
      "History"
    );
    cy.wait(500);
    cy.get("[data-cy=input-send]").trigger("mouseover").click();
    cy.get("[data-cy=history-chat]").contains("Hello");
    cy.get("[data-cy=input-field]").type("World");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();
    cy.get("[data-cy=history-chat]").contains("Hello");
    cy.get("[data-cy=history-chat]").contains("World");
    cy.get("[data-cy=history-chat]").find("li").should("have.length", 5);
    cy.get("[data-cy=history-chat]").get("li").contains("World");
    // cy.get("[data-cy=input-field]").type("Hello");
    // cy.get("[data-cy=input-send]").trigger("mouseover").click();
    // cy.get("[data-cy=history-chat]").contains("Hello");
    // cy.get("[data-cy=history-chat]").contains("World");
    // cy.get("[data-cy=history-chat]")
    //   .find("li")
    //   .should("have.length", 2);
    // cy.get("[data-cy=history-chat]")
    //   .get("li")
    //   .first()
    //   .contains("World");
  });
});
