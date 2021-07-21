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
const carlos = require("../fixtures/carlos.json");

describe("Video Chat History", () => {
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
    cy.get("[data-cy=topic-2]").trigger("mouseover").click();
    cy.get("[data-cy=input-field]").type("Hello");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();
    cy.get("[data-cy=history-chat]").contains("Hello");
  });

  it("displays questions that have been asked via topic button", () => {
    visitAsGuestWithDefaultSetup(cy, "/");

    cy.get("[data-cy=header]").should("have.attr", "data-mentor", "clint");
    cy.get("[data-cy=topic-0]").trigger("mouseover").click();
    cy.get("[data-cy=topic-0]").trigger("mouseover").click();
    cy.get("[data-cy=input-send]").trigger("mouseover").click();
    cy.get("[data-cy=topic-2]").trigger("mouseover").click();
    cy.get("[data-cy=history-chat").within(($hc) => {
      cy.get("[data-cy=chat-msg-0]").contains("Where were you born?");
    });
  });

  it("displays both questions and answers as a chat", () => {
    mockDefaultSetup(cy, {
      config: { mentorsDefault: ["clint"] },
      mentorData: [clint],
      apiResponse: "response_with_feedback.json",
      gqlQueries: [cyMockGQL("userQuestionSetFeedback", null, false)],
    });
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback.json",
    });
    cy.visit("/");
    //
    cy.get("[data-cy=header]").should("have.attr", "data-mentor", "clint");
    cy.get("[data-cy=topic-2] button").trigger("mouseover").click();
    cy.get("[data-cy=history-chat]").should("exist");

    cy.get("[data-cy=input-field]").type("user msg 1");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();
    cy.get("[data-cy=input-field]").type("user msg 2");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    cy.get("[data-cy=history-chat").within(($hc) => {
      cy.get("[data-cy=chat-msg-0]").contains("user msg 1");
      cy.get("[data-cy=chat-msg-2]").contains("user msg 2");
    });
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

    cy.get("[data-cy=topic-2] button").trigger("mouseover").click();
    cy.get("[data-cy=history-chat]").should("exist");

    // write msgs
    cy.get("[data-cy=input-field]").type("Good feedback test");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();
    cy.get("[data-cy=input-field]").type("Bad feedback test");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    cy.get("[data-cy=visibility-switch]").find("input").uncheck();

    // provide feedback
    cy.get("[data-cy=history-chat").within(($hc) => {
      cy.get("[data-cy=chat-msg-0]").contains("Good feedback test");
      cy.get("[data-cy=chat-msg-1]").within(($cm) => {
        cy.get("[data-cy=feedback-btn]").should("exist");
        cy.get("[data-cy=feedback-btn]").trigger("mouseover").click();
      });
    });
    cy.get("[data-cy=click-good]").should("exist");
    cy.get("[data-cy=click-good]").should(
      "have.attr",
      "data-test-in-progress",
      "false"
    );
    cy.get("[data-cy=click-good]").trigger("mouseover").click();
    cy.get("[data-cy=selected-good]").should("be.visible");
  });

  it.only("Show different feedback answers and mentors", () => {
    mockDefaultSetup(cy, {
      config: { mentorsDefault: ["clint", "carlos"] },
      mentorData: [clint, carlos],
      apiResponse: "response_with_feedback.json",
      gqlQueries: [cyMockGQL("userQuestionSetFeedback", null, false)],
    });
    cy.visit("/");
    cy.viewport("macbook-11");
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback.json",
    });
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback2.json",
    });

    cy.get("[data-cy=topic-2] button").trigger("mouseover").click();
    cy.get("[data-cy=history-chat]").should("exist");

    // write msgs
    cy.get("[data-cy=input-field]").type("Question 1");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    cy.get("[data-cy=input-field]").type("Question 2");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();
  });

  it("can give feedback on multiple mentor answers", () => {
    mockDefaultSetup(cy, {
      config: { mentorsDefault: ["clint", "carlos"] },
      mentorData: [clint, carlos],
      apiResponse: "response_with_feedback.json",
      gqlQueries: [cyMockGQL("userQuestionSetFeedback", null, false)],
    });
    cy.visit("/");
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback.json",
    });
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback2.json",
    });

    cy.get("[data-cy=topic-2] button").trigger("mouseover").click();
    cy.get("[data-cy=history-chat]").should("exist");

    // write msgs
    cy.get("[data-cy=input-field]").type("Good feedback test");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    cy.get("[data-cy=input-field]").type("Bad feedback test");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();
    cy.get("[data-cy=visibility-switch]").find("input").uncheck();

    // provide feedback
    cy.get("[data-cy=history-chat").within(($hc) => {
      cy.get("[data-cy=chat-msg-0]").contains("Good feedback test");
      cy.get("[data-cy=chat-msg-1]").within(($cm) => {
        cy.get("[data-cy=feedback-btn]").should("exist");
        cy.get("[data-cy=feedback-btn]").trigger("mouseover").click();
      });
    });

    // good feedback
    cy.get("[data-cy=click-good]").should("exist");
    cy.get("[data-cy=click-good]").should(
      "have.attr",
      "data-test-in-progress",
      "false"
    );
    cy.get("[data-cy=click-good]").trigger("mouseover").click();
    cy.get("[data-cy=selected-good]").should("be.visible");

    // bad feedback
    cy.get("[data-cy=chat-msg-2] [data-cy=feedback-btn]")
      .trigger("mouseover")
      .click();
    cy.get("[data-cy=click-good]");
    cy.get("[data-cy=click-neutral]");
    cy.get("[data-cy=click-bad]").trigger("mouseover").click();

    // cancel feedback
    cy.get("[data-cy=chat-msg-2] [data-cy=feedback-btn]")
      .trigger("mouseover")
      .click();
    cy.get("[data-cy=click-good]");
    cy.get("[data-cy=click-bad]");
    cy.get("[data-cy=click-neutral]").trigger("mouseover").click();
  });

  it("Compare mentor's bubble colors", () => {
    mockDefaultSetup(cy, {
      config: { mentorsDefault: ["clint", "carlos"] },
      mentorData: [clint, carlos],
      apiResponse: "response_with_feedback.json",
      gqlQueries: [cyMockGQL("userQuestionSetFeedback", null, false)],
    });
    cy.visit("/");
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback.json",
    });
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback2.json",
    });

    cy.get("[data-cy=topic-2] button").trigger("mouseover").click();
    cy.get("[data-cy=history-chat]").should("exist");

    // write msgs
    cy.get("[data-cy=input-field]").type("Good feedback test");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    cy.get("[data-cy=input-field]").type("Bad feedback test");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    cy.get("[data-cy=visibility-switch]").find("input").uncheck();

    cy.get("[data-cy=history-chat").within(($hc) => {
      cy.get("[data-cy=chat-msg-1]")
        .invoke("css", "background-color")
        .then(($backgroundMentor1) => {
          cy.get("[data-cy=chat-msg-2]").should(
            "not.have.css",
            "background",
            $backgroundMentor1
          );
        });
    });
  });

  it("Answers can be toggled open to see the transcript of the response", () => {
    mockDefaultSetup(cy, {
      config: { mentorsDefault: ["clint", "carlos"] },
      mentorData: [clint, carlos],
      apiResponse: "response_with_feedback.json",
      gqlQueries: [cyMockGQL("userQuestionSetFeedback", null, false)],
    });
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback.json",
    });
    cy.visit("/");
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback.json",
    });
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback2.json",
    });

    cy.get("[data-cy=topic-2] button").trigger("mouseover").click();
    cy.get("[data-cy=history-chat]").should("exist");

    // write msgs
    cy.get("[data-cy=input-field]").type("Question 1");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    cy.get("[data-cy=input-field]").type("Question 2");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    cy.get("[data-cy=history-chat]").within(($hc) => {
      cy.get("[data-cy=chat-thread]").within(($hc) => {
        cy.get("[data-cy=visibility-switch]").should("exist");
        cy.get("[data-cy=visibility-switch]")
          .find("input")
          .should("be.checked");

        // show answers
        cy.get("[data-cy=visibility-switch]").find("input").uncheck();
        cy.get("[data-cy=chat-msg-1]").should("be.visible");
        cy.get("[data-cy=chat-msg-2]").should("be.visible");
        cy.get("[data-cy=chat-msg-4]").scrollIntoView().should("be.visible");
        cy.get("[data-cy=chat-msg-5]").scrollIntoView().should("be.visible");

        // Hide answers
        cy.get("[data-cy=visibility-switch]").find("input").check();
        cy.get("[data-cy=chat-msg-1]").should("not.be.visible");
        cy.get("[data-cy=chat-msg-2]").should("not.be.visible");
      });
    });
  });

  it("Question's answers can be toggled individually", () => {
    mockDefaultSetup(cy, {
      config: { mentorsDefault: ["clint", "carlos"] },
      mentorData: [clint, carlos],
      apiResponse: "response_with_feedback.json",
      gqlQueries: [cyMockGQL("userQuestionSetFeedback", null, false)],
    });
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback.json",
    });
    cy.visit("/");
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback.json",
    });
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback2.json",
    });
    cy.get("[data-cy=topic-2] button").trigger("mouseover").click();
    cy.get("[data-cy=history-chat]").should("exist");

    // write msgs
    cy.get("[data-cy=input-field]").type("Question 1");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    cy.get("[data-cy=input-field]").type("Question 2");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    cy.get("[data-cy=visibility-switch]").find("input").uncheck();

    cy.get("[data-cy=history-chat]").within(($hc) => {
      cy.get("[data-cy=chat-thread]").within(($hc) => {
        // Hide answers
        cy.get("[data-cy=vsbyIcon-0]").should("exist");
        cy.get("[data-cy=vsbyIcon-0]").trigger("mouseover").click();
        cy.get("[data-cy=chat-msg-0]").scrollIntoView();
        cy.get("[data-cy=chat-msg-1]").should("not.be.visible");
        cy.get("[data-cy=chat-msg-2]").should("not.be.visible");

        // Hide answers
        cy.get("[data-cy=chat-msg-3]").scrollIntoView();
        cy.get("[data-cy=vsbyIcon-3]").should("exist");
        cy.get("[data-cy=vsbyIcon-3]").trigger("mouseover").click();
        cy.get("[data-cy=chat-msg-1]").should("not.be.visible");
        cy.get("[data-cy=chat-msg-2]").should("not.be.visible");

        // show answers
        cy.get("[data-cy=vsbyIcon-3]").should("exist");
        cy.get("[data-cy=vsbyIcon-3]").trigger("mouseover").click();
        cy.get("[data-cy=chat-msg-4]").should("be.visible");
        cy.get("[data-cy=chat-msg-5]").should("be.visible");
      });
    });
  });

  it("Question's answers can be toggled individually", () => {
    mockDefaultSetup(cy, {
      config: { mentorsDefault: ["clint", "carlos"] },
      mentorData: [clint, carlos],
      apiResponse: "response_with_feedback.json",
      gqlQueries: [cyMockGQL("userQuestionSetFeedback", null, false)],
    });
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback.json",
    });
    cy.visit("/");
    cy.viewport("macbook-11");
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback.json",
    });
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback2.json",
    });

    cy.get("[data-cy=topic-2] button").trigger("mouseover").click();
    cy.get("[data-cy=history-chat]").should("exist");

    // write msgs
    cy.get("[data-cy=input-field]").type("Question 1");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    cy.get("[data-cy=input-field]").type("Question 2");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    cy.get("[data-cy=history-chat]").within(($hc) => {
      cy.get("[data-cy=chat-thread]").within(($hc) => {
        // hidden answers
        cy.get("[data-cy=chat-msg-1]").should("not.be.visible");
        cy.get("[data-cy=chat-msg-2]").should("not.be.visible");

        // hidden answers
        cy.get("[data-cy=chat-msg-3]").should("be.visible");
        cy.get("[data-cy=chat-msg-4]").should("be.visible");
      });
    });

    // write msgs
    cy.get("[data-cy=input-field]").type("Question 3");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    cy.get("[data-cy=history-chat]").within(($hc) => {
      cy.get("[data-cy=chat-thread]").within(($hc) => {
        // hidden answers
        cy.get("[data-cy=chat-msg-0]").should("be.visible");
        cy.get("[data-cy=chat-msg-1]").should("not.be.visible");
        cy.get("[data-cy=chat-msg-2]").should("not.be.visible");

        // hidden answers
        cy.get("[data-cy=chat-msg-3]").should("be.visible");
        cy.get("[data-cy=chat-msg-4]").should("not.be.visible");
        cy.get("[data-cy=chat-msg-5]").should("not.be.visible");

        // visible answers
        cy.get("[data-cy=chat-msg-6]").should("be.visible");
        cy.get("[data-cy=chat-msg-7]").should("be.visible");
        cy.get("[data-cy=chat-msg-8]").should("be.visible");
      });
    });
  });

  it("If hide and the prior bottom answer was not manually opened, then it should collapse", () => {
    mockDefaultSetup(cy, {
      config: { mentorsDefault: ["clint", "carlos"] },
      mentorData: [clint, carlos],
      apiResponse: "response_with_feedback.json",
      gqlQueries: [cyMockGQL("userQuestionSetFeedback", null, false)],
    });
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback.json",
    });
    cy.visit("/");
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback.json",
    });
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback2.json",
    });

    cy.get("[data-cy=topic-2] button").trigger("mouseover").click();
    cy.get("[data-cy=history-chat]").should("exist");

    // write msgs
    cy.get("[data-cy=input-field]").type("Question 1");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    cy.get("[data-cy=input-field]").type("Question 2");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    cy.get("[data-cy=input-field]").type("Question 3");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    cy.get("[data-cy=input-field]").type("Question 4");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    cy.get("[data-cy=history-chat]").within(($hc) => {
      cy.get("[data-cy=chat-thread]").within(($hc) => {
        // show first question's answers
        cy.get("[data-cy=vsbyIcon-0]").should("exist");
        cy.get("[data-cy=vsbyIcon-0]").trigger("mouseover").click();
        cy.get("[data-cy=chat-msg-0]").scrollIntoView();
        cy.get("[data-cy=chat-msg-1]").should("be.visible");
        cy.get("[data-cy=chat-msg-2]").should("be.visible");
      });
    });

    // hide & show toggle answers to test single state visibility
    cy.get("[data-cy=visibility-switch]").find("input").uncheck();
    cy.get("[data-cy=visibility-switch]").find("input").check();

    // first question's answers should stay opened
    cy.get("[data-cy=history-chat]").within(($hc) => {
      cy.get("[data-cy=chat-thread]").within(($hc) => {
        // visible answers
        cy.get("[data-cy=chat-msg-1]").should("be.visible");
        cy.get("[data-cy=chat-msg-2]").should("be.visible");
      });
    });
  });

  it("If switch is to 'Hide/Show' then when new answer arrives it is open at the bottom and all answers manually opened before it are left in their prior open/closed position", () => {
    mockDefaultSetup(cy, {
      config: { mentorsDefault: ["clint", "carlos"] },
      mentorData: [clint, carlos],
      apiResponse: "response_with_feedback.json",
      gqlQueries: [cyMockGQL("userQuestionSetFeedback", null, false)],
    });
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback.json",
    });
    cy.visit("/");
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback.json",
    });
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback2.json",
    });

    cy.get("[data-cy=topic-2] button").trigger("mouseover").click();
    cy.get("[data-cy=history-chat]").should("exist");

    // write msgs
    cy.get("[data-cy=input-field]").type("Question 1");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    cy.get("[data-cy=input-field]").type("Question 2");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    cy.get("[data-cy=input-field]").type("Question 3");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    cy.get("[data-cy=input-field]").type("Question 4");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    cy.get("[data-cy=history-chat]").within(($hc) => {
      cy.get("[data-cy=chat-thread]").within(($hc) => {
        // show first question's answers
        cy.get("[data-cy=vsbyIcon-0]").should("exist");
        cy.get("[data-cy=vsbyIcon-0]").trigger("mouseover").click();
        cy.get("[data-cy=chat-msg-0]").scrollIntoView();
        cy.get("[data-cy=chat-msg-1]").should("be.visible");
        cy.get("[data-cy=chat-msg-2]").should("be.visible");
      });
    });

    // hide & show toggle answers to test single state visibility
    cy.get("[data-cy=visibility-switch]").find("input").uncheck();
    cy.get("[data-cy=visibility-switch]").find("input").check();

    // first question's answers should stay opened
    cy.get("[data-cy=history-chat]").within(($hc) => {
      cy.get("[data-cy=chat-thread]").within(($hc) => {
        // visible answers
        cy.get("[data-cy=chat-msg-1]").should("be.visible");
        cy.get("[data-cy=chat-msg-2]").should("be.visible");
      });
    });

    // write msgs
    cy.get("[data-cy=input-field]").type("Question 5");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    cy.get("[data-cy=history-chat]").within(($hc) => {
      cy.get("[data-cy=chat-thread]").within(($hc) => {
        // show first question's answers
        cy.get("[data-cy=chat-msg-1]").should("be.visible");
        cy.get("[data-cy=chat-msg-2]").should("be.visible");
      });
    });

    cy.get("[data-cy=visibility-switch]").find("input").uncheck();
    cy.get("[data-cy=visibility-switch]").find("input").check();

    cy.get("[data-cy=history-chat]").within(($hc) => {
      cy.get("[data-cy=chat-thread]").within(($hc) => {
        // show first question's answers
        cy.get("[data-cy=chat-msg-2]").should("be.visible");
        cy.get("[data-cy=chat-msg-1]").should("be.visible");
        // show last question's answers
        cy.get("[data-cy=chat-msg-13]").should("be.visible");
        cy.get("[data-cy=chat-msg-14]").should("be.visible");
      });
    });
  });
});
