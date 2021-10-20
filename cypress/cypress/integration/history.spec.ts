/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import {
  visitAsGuestWithDefaultSetup,
  mockDefaultSetup,
  cyMockGQL,
  addGuestParams,
} from "../support/helpers";
const clint = require("../fixtures/clint.json");
const carlos = require("../fixtures/carlos.json");

describe("Chat History (Video Mentors)", () => {
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
  });

  it("displays questions that have been asked via input", () => {
    visitAsGuestWithDefaultSetup(cy, "/");
    cy.get("[data-cy=header]").should("have.attr", "data-mentor", "clint");

    cy.get("[data-cy=input-field]").type("Hello");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();
    cy.get("[data-cy=history-chat]").contains("Hello");
  });

  it("displays questions that have been asked via topic button", () => {
    visitAsGuestWithDefaultSetup(cy, "/");
    cy.get("[data-cy=header]").should("have.attr", "data-mentor", "clint");
    cy.get("[data-cy=input-field]").type("Where were you born?");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    cy.get("[data-cy=history-chat").within(($hc) => {
      cy.get("[data-cy=chat-msg-1]").contains("Where were you born?");
    });
  });

  it("Opens up recommended questions by default it they exists", () => {
    mockDefaultSetup(cy, {
      config: { mentorsDefault: ["clint"] },
      mentorData: [clint],
      apiResponse: "response_with_feedback.json",
    });
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback3.json",
    });
    // video intercept
    cy.intercept("http://videos.org/answer_id.mp4", {
      fixture: "video_response.mp4",
    });
    cy.visit("/", {
      qs: addGuestParams({
        recommendedQuestions: "Are you fun at parties?",
      }),
    });
    cy.get("[data-cy=header]").should("have.attr", "data-mentor", "clint");
    cy.get("[data-cy=topics]").within(() => {
      cy.get("button").eq(1).should("have.attr", "data-test", "Recommended");
    });
    cy.get("[data-cy=topic-tab]").trigger("mouseover").click();
    cy.get("[data-cy=topics-questions-list]").within(() => {
      cy.get("[data-cy=topic-opt-item-0]").trigger("mouseover").click();
    });
    cy.get("[data-cy=topics-questions-list]").within(() => {
      cy.get("li").eq(0).should("have.attr", "data-active-tab", "active");
    });
  });

  it("Opens up history if no recommended questions", () => {
    mockDefaultSetup(cy, {
      config: { mentorsDefault: ["clint"] },
      mentorData: [clint],
      apiResponse: "response_with_feedback.json",
    });
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback3.json",
    });
    // video intercept
    cy.intercept("http://videos.org/answer_id.mp4", {
      fixture: "video_response.mp4",
    });
    cy.visit("/");
    cy.get("[data-cy=header]").should("have.attr", "data-mentor", "clint");
  });

  it("displays both questions and answers as a chat", () => {
    mockDefaultSetup(cy, {
      config: { mentorsDefault: ["clint", "carlos"] },
      mentorData: [clint, carlos],
      apiResponse: "response_with_feedback.json",
    });
    cy.visit("/");
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback3.json",
    });
    // video intercept
    cy.intercept("http://videos.org/answer_id.mp4", {
      fixture: "video_response.mp4",
    });
    cy.visit("/");

    cy.get("[data-cy=history-chat]").should("exist");

    cy.get("[data-cy=input-field]").type("user msg 1");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    // wait for it to finish
    cy.get("[data-cy=video-container]", { timeout: 30000 }).should(
      "have.attr",
      "data-test-replay",
      "http://videos.org/answer_id.mp4"
    );
    cy.get("[data-cy=history-chat").within(($hc) => {
      cy.get("[data-cy=chat-thread]").within(($hc) => {
        cy.get("[data-cy=chat-msg-1]").contains("user msg 1");
        cy.get("[data-cy=chat-msg-2]").contains("Give me feedback");
        cy.get("[data-cy=chat-msg-3]").contains("Give me feedback");
      });
    });
  });

  it("can give feedback on mentor answer", () => {
    mockDefaultSetup(cy, {
      config: { mentorsDefault: ["clint", "carlos"] },
      mentorData: [clint, carlos],
      apiResponse: "response_with_feedback.json",
      gqlQueries: [
        cyMockGQL("UserQuestionSetFeedback", {
          userQuestionSetFeedback: null,
        }),
      ],
    });
    cy.visit("/");
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback3.json",
    });
    cy.intercept("**/questions/?mentor=carlos&query=*", {
      fixture: "response_with_feedback2.json",
    });
    // video intercept
    cy.intercept("http://videos.org/answer_id.mp4", {
      fixture: "video_response.mp4",
    });
    cy.visit("/");

    cy.get("[data-cy=history-chat]").should("exist");

    // write msgs
    cy.get("[data-cy=input-field]").type("Good feedback test");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    // wait for it to finish
    cy.get("[data-cy=video-container]", { timeout: 30000 }).should(
      "have.attr",
      "data-test-replay",
      "http://videos.org/answer_id.mp4"
    );

    cy.get("[data-cy=visibility-switch]").find("input").check();

    // provide feedback
    cy.get("[data-cy=history-chat").within(($hc) => {
      cy.get("[data-cy=chat-msg-1]").contains("Good feedback test");
      cy.get("[data-cy=chat-msg-2]").within(($cm) => {
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

  it("Show different feedback answers and mentors", () => {
    mockDefaultSetup(cy, {
      config: { mentorsDefault: ["clint", "carlos"] },
      mentorData: [clint, carlos],
      apiResponse: "response_with_feedback.json",
      gqlQueries: [
        cyMockGQL("UserQuestionSetFeedback", {
          userQuestionSetFeedback: null,
        }),
      ],
    });
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback3.json",
    });
    cy.intercept("**/questions/?mentor=carlos&query=*", {
      fixture: "response_with_feedback2.json",
    });
    // video intercept
    cy.intercept("http://videos.org/answer_id.mp4", {
      fixture: "video_response.mp4",
    });
    cy.visit("/");
    cy.viewport(1200, 800);

    cy.get("[data-cy=history-chat]").should("exist");

    // write msgs
    cy.get("[data-cy=input-field]").type("Good feedback test");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    // wait for it to finish
    cy.get("[data-cy=video-container]", { timeout: 30000 }).should(
      "have.attr",
      "data-test-replay",
      "http://videos.org/answer_id.mp4"
    );

    cy.get("[data-cy=input-field]").type("Bad feedback test");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    // wait for it to finish
    cy.get("[data-cy=video-container]", { timeout: 30000 }).should(
      "have.attr",
      "data-test-replay",
      "http://videos.org/answer_id.mp4"
    );

    cy.get("[data-cy=visibility-switch]").find("input").check();

    // provide feedback
    cy.get("[data-cy=history-chat").within(($hc) => {
      cy.get("[data-cy=chat-msg-1]").contains("Good feedback test");
      cy.get("[data-cy=chat-msg-2]")
        .scrollIntoView()
        .within(($cm) => {
          cy.get("[data-cy=feedback-btn]").should("exist").should("exist");
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
    cy.get("[data-cy=chat-msg-2]")
      .scrollIntoView()
      .within(() => {
        cy.get("[data-cy=selected-good]").should("be.visible");
      });

    // provide bad feedback
    cy.get("[data-cy=history-chat").within(($hc) => {
      cy.get("[data-cy=chat-thread]").within(($hc) => {
        cy.get("[data-cy=chat-msg-4]")
          .scrollIntoView()
          .should("be.visible")
          .contains("Bad feedback test");
        cy.get("[data-cy=chat-msg-6]")
          .scrollIntoView()

          .within(($cm) => {
            cy.get("[data-cy=feedback-btn]").should("exist").should("exist");
            cy.get("[data-cy=feedback-btn]").trigger("mouseover").click();
          });
      });
    });
    cy.get("[data-cy=click-bad]").should("exist");
    cy.get("[data-cy=click-bad]").trigger("mouseover").click();

    cy.get("[data-cy=chat-msg-6]")
      .scrollIntoView()
      .within(() => {
        cy.get("[data-cy=selected-bad]").should("be.visible");
      });
  });

  it("can give feedback on multiple mentor answers", () => {
    mockDefaultSetup(cy, {
      config: { mentorsDefault: ["clint", "carlos"] },
      mentorData: [clint, carlos],
      apiResponse: "response_with_feedback.json",
      gqlQueries: [
        cyMockGQL("UserQuestionSetFeedback", {
          userQuestionSetFeedback: null,
        }),
      ],
    });
    cy.visit("/");
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback3.json",
    });
    cy.intercept("**/questions/?mentor=carlos&query=*", {
      fixture: "response_with_feedback2.json",
    });
    // video intercept
    cy.intercept("http://videos.org/answer_id.mp4", {
      fixture: "video_response.mp4",
    });

    cy.get("[data-cy=history-chat]").should("exist");

    // write msgs
    cy.get("[data-cy=input-field]").type("Good feedback test");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    cy.get("[data-cy=input-field]").type("Bad feedback test");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    // wait for it to finish
    cy.get("[data-cy=video-container]", { timeout: 30000 }).should(
      "have.attr",
      "data-test-replay",
      "http://videos.org/answer_id.mp4"
    );

    cy.get("[data-cy=visibility-switch]").find("input").check();

    // provide feedback
    cy.get("[data-cy=history-chat").within(($hc) => {
      cy.get("[data-cy=chat-msg-1]")
        .scrollIntoView()
        .contains("Good feedback test");
      cy.get("[data-cy=chat-msg-2]", {
        timeout: 8000,
      })
        .should("be.visible")
        .contains("Give me feedback.");
      cy.get("[data-cy=chat-msg-5]").within(($cm) => {
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
    cy.get("[data-cy=chat-msg-3] [data-cy=feedback-btn]")
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
    });
    cy.visit("/");
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback3.json",
    });
    cy.intercept("**/questions/?mentor=carlos&query=*", {
      fixture: "response_with_feedback2.json",
    });
    // video intercept
    cy.intercept("http://videos.org/answer_id.mp4", {
      fixture: "video_response.mp4",
    });
    cy.visit("/");

    cy.get("[data-cy=history-chat]").should("exist");

    // write msgs
    cy.get("[data-cy=input-field]").type("Good feedback test");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    cy.get("[data-cy=input-field]").type("Bad feedback test");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    cy.get("[data-cy=visibility-switch]").find("input").check();

    cy.get("[data-cy=history-chat").within(($hc) => {
      cy.get("[data-cy=chat-msg-2]")
        .invoke("css", "background-color")
        .then(($backgroundMentor1) => {
          cy.get("[data-cy=chat-msg-3]").should(
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
    });
    cy.visit("/");
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback.json",
    });
    cy.intercept("**/questions/?mentor=carlos&query=*", {
      fixture: "response_with_feedback2.json",
    });
    // video intercept
    cy.intercept("http://videos.org/answer_id.mp4", {
      fixture: "video_response.mp4",
    });
    cy.visit("/");
    cy.viewport(1200, 800);

    cy.get("[data-cy=history-chat]").should("exist");

    // write msgs
    cy.get("[data-cy=input-field]").type("Question 1");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    // wait for it to finish
    cy.get("[data-cy=video-container]", { timeout: 30000 }).should(
      "have.attr",
      "data-test-replay",
      "http://videos.org/answer_id.mp4"
    );

    cy.get("[data-cy=input-field]").type("Question 2");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    // wait for it to finish
    cy.get("[data-cy=video-container]", { timeout: 30000 }).should(
      "have.attr",
      "data-test-replay",
      "http://videos.org/answer_id.mp4"
    );

    cy.get("[data-cy=history-chat]").within(($hc) => {
      cy.get("[data-cy=vsbyIcon-1]").trigger("mouseover").click();
      cy.get("[data-cy=vsbyIcon-1]").trigger("mouseover").click();

      cy.get("[data-cy=chat-thread]").within(($hc) => {
        cy.get("[data-cy=visibility-switch]").should("exist");
        cy.get("[data-cy=visibility-switch]")
          .find("input")
          .should("not.be.checked");

        // show answers
        cy.get("[data-cy=chat-msg-2]").should("not.be.visible");
        cy.get("[data-cy=chat-msg-3]").should("not.be.visible");
        // the answers for the last question are visible by default
        // even if the show-all toggle is left unchecked
        // cy.get("[data-cy=chat-msg-5]").scrollIntoView();
        cy.get("[data-cy=chat-msg-5]").should("be.visible");
        cy.get("[data-cy=chat-msg-6]")
          .scrollIntoView()
          .should("not.be.visible");
      });
    });
    cy.get("[data-cy=history-chat]").within(($hc) => {
      // show answers toggle
      cy.get("[data-cy=visibility-switch]").find("input").check();
      cy.get("[data-cy=chat-msg-2]").scrollIntoView().should("be.visible");
      cy.get("[data-cy=chat-msg-3]").scrollIntoView().should("be.visible");
      cy.get("[data-cy=chat-msg-5]").scrollIntoView().should("be.visible");
      cy.get("[data-cy=chat-msg-6]").scrollIntoView().should("be.visible");

      // the answers for the last question are visible by default
      // even if the show-all toggle is left unchecked
      cy.get("[data-cy=chat-msg-5]").scrollIntoView().should("be.visible");
      cy.get("[data-cy=chat-msg-6]").scrollIntoView().should("be.visible");
    });
  });

  it("Question's answers can be toggled individually", () => {
    mockDefaultSetup(cy, {
      config: { mentorsDefault: ["clint", "carlos"] },
      mentorData: [clint, carlos],
      apiResponse: "response_with_feedback.json",
    });
    cy.visit("/");
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback3.json",
    });
    cy.intercept("**/questions/?mentor=carlos&query=*", {
      fixture: "response_with_feedback2.json",
    });
    // video intercept
    cy.intercept("http://videos.org/answer_id.mp4", {
      fixture: "video_response.mp4",
    });

    cy.get("[data-cy=history-chat]").should("exist");

    // write msgs
    cy.get("[data-cy=input-field]").type("Question 1");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    cy.get("[data-cy=input-field]").type("Question 2");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    // wait for it to finish
    cy.get("[data-cy=video-container]", { timeout: 30000 }).should(
      "have.attr",
      "data-test-replay",
      "http://videos.org/answer_id.mp4"
    );

    cy.get("[data-cy=visibility-switch]").find("input").check();

    cy.get("[data-cy=history-chat]").within(($hc) => {
      cy.get("[data-cy=chat-thread]").within(($hc) => {
        // Hide answers
        cy.get("[data-cy=vsbyIcon-1]").should("exist");
        cy.get("[data-cy=vsbyIcon-1]").trigger("mouseover").click();
        cy.get("[data-cy=chat-msg-1]").scrollIntoView();
        cy.get("[data-cy=chat-msg-2]").should("not.be.visible");
        cy.get("[data-cy=chat-msg-3]").should("not.be.visible");

        // Hide answers
        // cy.get("[data-cy=chat-msg-4]").scrollIntoView();
        cy.get("[data-cy=vsbyIcon-4]").should("exist");
        cy.get("[data-cy=vsbyIcon-4]").trigger("mouseover").click();
        cy.get("[data-cy=chat-msg-2]").should("not.be.visible");
        cy.get("[data-cy=chat-msg-3]").should("not.be.visible");
      });
    });
  });

  it("Question's answers can be toggled individually 2", () => {
    mockDefaultSetup(cy, {
      config: { mentorsDefault: ["clint", "carlos"] },
      mentorData: [clint, carlos],
      apiResponse: "response_with_feedback.json",
    });
    cy.visit("/");
    cy.viewport(1220, 800);
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback3.json",
    });
    cy.intercept("**/questions/?mentor=carlos&query=*", {
      fixture: "response_with_feedback2.json",
    });
    // video intercept
    cy.intercept("http://videos.org/answer_id.mp4", {
      fixture: "video_response.mp4",
    });

    cy.get("[data-cy=history-chat]").should("exist");

    // write msgs
    cy.get("[data-cy=input-field]").type("Question 1");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    // wait for it to finish
    cy.get("[data-cy=video-container]", { timeout: 30000 }).should(
      "have.attr",
      "data-test-replay",
      "http://videos.org/answer_id.mp4"
    );

    cy.get("[data-cy=input-field]").type("Question 2");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    // wait for it to finish
    cy.get("[data-cy=video-container]", { timeout: 30000 }).should(
      "have.attr",
      "data-test-replay",
      "http://videos.org/answer_id.mp4"
    );

    cy.get("[data-cy=history-chat]").within(($hc) => {
      cy.get("[data-cy=vsbyIcon-1]").trigger("mouseover").click();
      cy.get("[data-cy=vsbyIcon-1]").trigger("mouseover").click();
      cy.get("[data-cy=chat-thread]").within(($hc) => {
        // hidden answers
        cy.get("[data-cy=chat-msg-2]").should("not.be.visible");
        cy.get("[data-cy=chat-msg-3]").should("not.be.visible");

        // hidden answers
        cy.get("[data-cy=chat-msg-4]").scrollIntoView();
        cy.get("[data-cy=chat-msg-5]").scrollIntoView().should("be.visible");
        cy.get("[data-cy=chat-msg-6]").scrollIntoView().should("be.visible");
      });
    });
  });

  it("If hide and the prior bottom answer was not manually opened, then it should collapse", () => {
    mockDefaultSetup(cy, {
      config: { mentorsDefault: ["clint", "carlos"] },
      mentorData: [clint, carlos],
      apiResponse: "response_with_feedback.json",
    });
    cy.visit("/");
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback3.json",
    });
    cy.intercept("**/questions/?mentor=carlos&query=*", {
      fixture: "response_with_feedback2.json",
    });
    // video intercept
    cy.intercept("http://videos.org/answer_id.mp4", {
      fixture: "video_response.mp4",
    });

    cy.get("[data-cy=history-chat]").should("exist");

    // write msgs
    cy.get("[data-cy=input-field]").type("Question 1");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    // wait for it to finish
    cy.get("[data-cy=video-container]", { timeout: 30000 }).should(
      "have.attr",
      "data-test-replay",
      "http://videos.org/answer_id.mp4"
    );

    cy.get("[data-cy=input-field]").type("Question 2");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    // wait for it to finish
    cy.get("[data-cy=video-container]", { timeout: 30000 }).should(
      "have.attr",
      "data-test-replay",
      "http://videos.org/answer_id.mp4"
    );

    cy.get("[data-cy=input-field]").type("Question 3");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    // wait for it to finish
    cy.get("[data-cy=video-container]", { timeout: 30000 }).should(
      "have.attr",
      "data-test-replay",
      "http://videos.org/answer_id.mp4"
    );

    cy.get("[data-cy=input-field]").type("Question 4");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    // wait for it to finish
    cy.get("[data-cy=video-container]", { timeout: 30000 }).should(
      "have.attr",
      "data-test-replay",
      "http://videos.org/answer_id.mp4"
    );

    cy.get("[data-cy=history-chat]").within(($hc) => {
      cy.get("[data-cy=chat-thread]").within(($hc) => {
        // show first question's answers
        cy.get("[data-cy=vsbyIcon-1]").should("exist");
        cy.get("[data-cy=vsbyIcon-1]").trigger("mouseover").click();
        cy.get("[data-cy=chat-msg-1]").scrollIntoView();
        cy.get("[data-cy=chat-msg-2]").should("be.visible");
        cy.get("[data-cy=chat-msg-3]").scrollIntoView().should("be.visible");
      });
    });
  });

  it("If switch is to 'Hide/Show' then when new answer arrives it is open at the bottom and all answers manually opened before it are left in their prior open/closed position", () => {
    mockDefaultSetup(cy, {
      config: { mentorsDefault: ["clint", "carlos"] },
      mentorData: [clint, carlos],
      apiResponse: "response_with_feedback.json",
    });
    cy.visit("/");
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback3.json",
    });
    cy.intercept("**/questions/?mentor=carlos&query=*", {
      fixture: "response_with_feedback2.json",
    });
    // video intercept
    cy.intercept("http://videos.org/answer_id.mp4", {
      fixture: "video_response.mp4",
    });

    cy.get("[data-cy=history-chat]").should("exist");

    // write msgs
    cy.get("[data-cy=input-field]").type("Question 1");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    // wait for it to finish
    cy.get("[data-cy=video-container]", { timeout: 30000 }).should(
      "have.attr",
      "data-test-replay",
      "http://videos.org/answer_id.mp4"
    );

    cy.get("[data-cy=input-field]").type("Question 2");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    // wait for it to finish
    cy.get("[data-cy=video-container]", { timeout: 30000 }).should(
      "have.attr",
      "data-test-replay",
      "http://videos.org/answer_id.mp4"
    );
    cy.get("[data-cy=input-field]").type("Question 3");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    // wait for it to finish
    cy.get("[data-cy=video-container]", { timeout: 30000 }).should(
      "have.attr",
      "data-test-replay",
      "http://videos.org/answer_id.mp4"
    );

    cy.get("[data-cy=input-field]").type("Question 4");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    // wait for it to finish
    cy.get("[data-cy=video-container]", { timeout: 30000 }).should(
      "have.attr",
      "data-test-replay",
      "http://videos.org/answer_id.mp4"
    );

    cy.get("[data-cy=history-chat]").within(($hc) => {
      cy.get("[data-cy=vsbyIcon-1]").trigger("mouseover").click();
      cy.get("[data-cy=vsbyIcon-1]").trigger("mouseover").click();

      cy.get("[data-cy=chat-thread]").within(($hc) => {
        // show first question's answers
        cy.get("[data-cy=vsbyIcon-1]").should("exist");
        cy.get("[data-cy=vsbyIcon-1]").trigger("mouseover").click();
        cy.get("[data-cy=chat-msg-1]").scrollIntoView();
        cy.get("[data-cy=chat-msg-2]").should("be.visible");
        cy.get("[data-cy=chat-msg-3]").scrollIntoView().should("be.visible");
      });
    });

    // first question's answers should stay opened
    cy.get("[data-cy=history-chat]").within(($hc) => {
      cy.get("[data-cy=chat-thread]").within(($hc) => {
        // visible answers
        cy.get("[data-cy=chat-msg-2]").scrollIntoView().should("be.visible");
        cy.get("[data-cy=chat-msg-3]").scrollIntoView().should("be.visible");
      });
    });

    // write msgs
    cy.get("[data-cy=input-field]").type("Question 5");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    cy.get("[data-cy=history-chat]").within(($hc) => {
      cy.get("[data-cy=chat-thread]").within(($hc) => {
        // show first question's answers
        cy.get("[data-cy=chat-msg-2]").scrollIntoView().should("be.visible");
        cy.get("[data-cy=chat-msg-3]").scrollIntoView().should("be.visible");
      });
    });

    cy.get("[data-cy=history-chat]").within(($hc) => {
      cy.get("[data-cy=chat-thread]").within(($hc) => {
        // show first question's answers
        cy.get("[data-cy=chat-msg-3]").scrollIntoView().should("be.visible");
        cy.get("[data-cy=chat-msg-2]").scrollIntoView().should("be.visible");
      });
    });
  });

  it("Replay video by clicking chat msg", () => {
    mockDefaultSetup(cy, {
      config: { mentorsDefault: ["clint", "carlos"] },
      mentorData: [clint, carlos],
      apiResponse: "response_with_feedback.json",
    });
    cy.intercept("**/questions/?mentor=clint&query=question+1", {
      fixture: "response_with_markdown.json",
    });
    cy.intercept("**/questions/?mentor=carlos&query=*", {
      fixture: "response_with_feedback2.json",
    });
    cy.intercept("**/questions/?mentor=carlos&query=question+2", {
      fixture: "response_with_markdown2.json",
    });

    // video intercept
    cy.intercept("http://videos.org/answer_id4.mp4", {
      fixture: "video_response.mp4",
    }).as("askClint");
    cy.intercept("http://videos.org/answer_id2.mp4", {
      fixture: "video_intro.mp4",
    }).as("askCarlos");
    cy.intercept("http://videos.org/answer_id3.mp4", {
      fixture: "3.mp4",
    });
    cy.intercept("http://videos.org/answer_id7.mp4", {
      fixture: "video_response.mp4",
    });
    cy.visit("/");
    cy.viewport(1200, 800);

    cy.get("[data-cy=history-chat]").should("exist");
    cy.get("[data-cy=history-chat]").should("exist");

    // write msgs
    cy.get("[data-cy=input-field]").type("question 1");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    cy.get("[data-cy=input-field]").type("question 2");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    cy.get("[data-cy=visibility-switch]").find("input").check();

    // wait for it to finish
    cy.get("[data-cy=video-container]", { timeout: 30000 }).should(
      "have.attr",
      "data-test-replay",
      "http://videos.org/answer_id.mp4"
    );

    cy.get("[data-cy=video-container]").should(
      "have.attr",
      "data-test-replay",
      "http://videos.org/answer_id.mp4"
    );
    cy.get("[data-cy=history-chat]").within(($hc) => {
      cy.get("[data-cy=chat-thread]").within(($hc) => {
        cy.get("[data-cy=chat-msg-6]").within(() => {
          cy.get("[data-cy=replay-icon-6]", { timeout: 30000 })
            .scrollIntoView()
            .trigger("mouseover")
            .click();
        });
      });
    });

    cy.get("[data-cy=video-container]").should(
      "have.attr",
      "data-test-replay",
      "http://videos.org/answer_id7.mp4"
    );

    // wait for it to finish
    cy.get("[data-cy=video-container]", { timeout: 30000 }).should(
      "have.attr",
      "data-test-replay",
      "http://videos.org/answer_id.mp4"
    );

    cy.get("[data-cy=history-chat]").within(($hc) => {
      cy.get("[data-cy=chat-thread]").within(($hc) => {
        cy.get("[data-cy=chat-msg-2]").within(() => {
          cy.get("[data-cy=replay-icon-2]").trigger("mouseover").click();
        });
      });
    });

    cy.get("[data-cy=video-container]").should(
      "have.attr",
      "data-test-replay",
      "http://videos.org/answer_id3.mp4"
    );
  });
});
