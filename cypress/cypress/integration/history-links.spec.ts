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
const julianne = require("../fixtures/julianne.json");

describe("Chat History (Video Mentors Links)", () => {
  it("Tap link opens link in new tab", () => {
    mockDefaultSetup(cy, {
      config: { mentorsDefault: ["clint", "carlos"] },
      mentorData: [clint, carlos],
      apiResponse: "response_with_markdown.json",
    });
    cy.intercept("**/questions/?mentor=*&query=*", {
      fixture: "response_with_markdown.json",
    });
    cy.visit("/");
    // write msgs
    cy.get("[data-cy=input-field]").type("Question 1");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();
    cy.get("[data-cy=history-tab]").trigger("mouseover").click();
    cy.get("[data-cy=history-chat]").should("exist");
    cy.get("[data-cy=chat-msg-2]").contains("Click https://www.google.com");
    cy.get("[data-cy=chat-msg-2] a").should(
      "have.attr",
      "href",
      "https://www.google.com"
    );
    cy.get("[data-cy=chat-msg-2] a").should("have.attr", "target", "_blank");
  });

  it("Display link-label over a corner of the video", () => {
    mockDefaultSetup(cy, {
      config: { mentorsDefault: ["clint", "carlos"] },
      mentorData: [clint, carlos],
      apiResponse: "response_with_markdown2.json",
      gqlQueries: [cyMockGQL("userQuestionSetFeedback", null)],
    });
    cy.visit("/");
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_markdown.json",
    });
    cy.intercept("**/questions/?mentor=carlos&query=*", {
      fixture: "response_with_markdown2.json",
    });

    cy.get("[data-cy=video-container]").within(($hc) => {
      cy.get("[data-cy=answer-link-card]").should("not.exist");
    });

    cy.get("[data-cy=history-tab]").trigger("mouseover").click();
    cy.get("[data-cy=history-chat]").should("exist");
    // write msgs
    cy.get("[data-cy=input-field]").type("Question 1");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();
  });

  it("It doesn't display link-label over a corner of the video", () => {
    visitAsGuestWithDefaultSetup(cy, "/");
    cy.get("[data-cy=answer-link-card]").should("not.exist");
    cy.get("[data-cy=history-tab]").trigger("mouseover").click();
    cy.get("[data-cy=history-chat]").should("exist");
    // write msgs
    cy.get("[data-cy=input-field]").type("Question 1");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();
    // display label over a corner of the video
    cy.get("[data-cy=answer-link-card]").should("not.exist");
  });

  it("Display link-label for the duration of the video & ensure clears link when a new video", () => {
    visitAsGuestWithDefaultSetup(cy, "/");
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_markdown.json",
    });
    cy.get("[data-cy=history-tab]").trigger("mouseover").click();
    cy.get("[data-cy=history-chat]").should("exist");
    // write msgs
    cy.get("[data-cy=input-field]").type("Question 1");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();
    cy.get("[data-cy=video-thumbnail-carlos]").trigger("mouseover").click();
    cy.get("[data-cy=answer-link-card]", { timeout: 8000 }).should("not.exist");
  });

  it("Display link-label from most recent answer is shown", () => {
    mockDefaultSetup(cy, {
      config: { mentorsDefault: ["clint", "carlos"] },
      mentorData: [clint, carlos],
      apiResponse: "response_with_markdown.json",
      gqlQueries: [cyMockGQL("userQuestionSetFeedback", null)],
    });
    cy.visit("/");
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_markdown.json",
    });
    cy.intercept("**/questions/?mentor=carlos&query=*", {
      fixture: "response_with_feedback.json",
    });
    cy.get("[data-cy=answer-link-card]").should("not.exist");
    cy.get("[data-cy=history-tab]").trigger("mouseover").click();
    cy.get("[data-cy=history-chat]").should("exist");
    // write msgs
    cy.get("[data-cy=input-field]").type("Question 1");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();
    cy.get("[data-cy=chat-msg-2]").contains("Click https://www.google.com");
    // Compare last answer link with video label
    cy.get("[data-cy=input-field]")
      .invoke("val")
      .then((linkAnswerLabel) => {
        cy.get("[data-cy=chat-msg-1]")
          .find("p")
          .should("have.value", linkAnswerLabel);
      });
  });

  it("Link text for video-area link is same as text used in link", () => {
    mockDefaultSetup(cy, {
      config: { mentorsDefault: ["clint", "carlos"] },
      mentorData: [clint, carlos],
      apiResponse: "response_with_markdown.json",
      gqlQueries: [cyMockGQL("userQuestionSetFeedback", null)],
    });
    cy.visit("/");
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_markdown2.json",
    });
    cy.intercept("**/questions/?mentor=carlos&query=*", {
      fixture: "response_with_markdown.json",
    });

    cy.get("[data-cy=history-tab]").trigger("mouseover").click();
    cy.get("[data-cy=history-chat]").should("exist");

    // write msgs
    cy.get("[data-cy=input-field]").type("Question 1");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    // Compare last answer link with video label
    cy.get("[data-cy=input-field]")
      .invoke("val")
      .then((linkAnswerLabel) => {
        cy.get("[data-cy=chat-msg-3]")
          .find("p")
          .should("have.value", linkAnswerLabel);
      });
  });

  it("Answer recommends a question with prefix", () => {
    mockDefaultSetup(cy, {
      config: { mentorsDefault: ["clint", "carlos"] },
      mentorData: [clint, carlos],
      apiResponse: "response_with_prefix.json",
    });
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_prefix.json",
    });
    cy.intercept("**/questions/?mentor=carlos&query=*", {
      fixture: "response_with_feedback.json",
    });
    // video intercept
    cy.intercept("http://videos.org/answer_id.mp4", {
      fixture: "video_response.mp4",
    });
    cy.visit("/");

    cy.get("[data-cy=history-tab]").trigger("mouseover").click();
    cy.get("[data-cy=history-chat]").should("exist");
    // write msgs
    cy.get("[data-cy=input-field]").type("What do you do for living?");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    // play video
    cy.get("video")
      .should("have.prop", "paused", true)
      .and("have.prop", "ended", false)
      .then(($video) => {
        $video[$video.length - 1].play();
      });
    // wait for it to finish
    cy.get("[data-cy=playing-video-mentor] video", { timeout: 20000 }).and(
      "have.prop",
      "ended",
      true
    );

    cy.get("[data-cy=history-chat]").within(($hc) => {
      cy.get("[data-cy=chat-thread]").within(($hc) => {
        cy.get("[data-cy=chat-msg-2]")
          .scrollIntoView()
          .within(() => {
            cy.get("[data-cy=ask-icon-2]").should("exist");
            cy.get("[data-cy=ask-link-0]").trigger("mouseover").click();
          });
        cy.get("[data-cy=chat-msg-4]").contains(
          "what does a computer programmer do?"
        );
      });
    });
  });

  it("Can display answer text with the word 'ask' and not mistake it for a link", () => {
    mockDefaultSetup(cy, {
      config: { mentorsDefault: ["clint", "carlos"] },
      mentorData: [clint, carlos],
      apiResponse: "response_with_prefix.json",
    });
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_prefix.json",
    });
    cy.intercept("**/questions/?mentor=carlos&query=*", {
      fixture: "response_with_feedback.json",
    });
    // video intercept
    cy.intercept("http://videos.org/answer_id.mp4", {
      fixture: "video_response.mp4",
    });
    cy.visit("/");
    cy.get("[data-cy=history-tab]").trigger("mouseover").click();
    cy.get("[data-cy=history-chat]").should("exist");

    // write msgs
    cy.get("[data-cy=input-field]").type(
      "I want to ask what do you do for living?"
    );
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    // play video
    cy.get("video")
      .should("have.prop", "paused", true)
      .and("have.prop", "ended", false)
      .then(($video) => {
        $video[$video.length - 1].play();
      });
    // wait for it to finish
    cy.get("[data-cy=playing-video-mentor] video", { timeout: 20000 }).and(
      "have.prop",
      "ended",
      true
    );

    // not mistake it for a link
    cy.get("[data-cy=answer-link-card]").should("not.exist");
    cy.get("[data-cy=history-chat]").within(($hc) => {
      cy.get("[data-cy=chat-thread]").within(($hc) => {
        cy.get("[data-cy=chat-msg-2]")
          .should("exist")
          .contains(
            "I'm a computer programmer (I think) Tell me more, I like to code (I think) what to know"
          );

        cy.get("[data-cy=ask-icon-2]").should("exist");
      });
    });
    // not mistake it for a link
    cy.get("[data-cy=answer-link-card]").should("not.exist");
  });

  it("Can display answer text open and close parentheses and not mistake them for links", () => {
    mockDefaultSetup(cy, {
      config: { mentorsDefault: ["clint", "carlos"] },
      mentorData: [clint, carlos],
      apiResponse: "response_with_feedback2.json",
      gqlQueries: [cyMockGQL("userQuestionSetFeedback", null)],
    });
    cy.visit("/");
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_prefix.json",
    });
    cy.get("[data-cy=history-tab]").trigger("mouseover").click();
    cy.get("[data-cy=history-chat]").should("exist");

    // write msgs
    cy.get("[data-cy=input-field]").type(
      "I want to ask what do you do for living?"
    );
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    // not mistake it for a link
    cy.get("[data-cy=answer-link-card]").should("not.exist");
  });

  it("shows the web link for the actively playing mentor video as user selects mentors", () => {
    // visit a page with two mentors: mentor1 and mentor2
    mockDefaultSetup(cy, {
      config: { mentorsDefault: ["clint", "carlos"] },
      mentorData: [clint, carlos],
      apiResponse: "response_with_markdown2.json",
      gqlQueries: [cyMockGQL("userQuestionSetFeedback", null)],
    });
    cy.visit("/");
    // NOTE THAT: mentor 1 has an answer with a weblink like '/mentor1/more-info'
    // NOTE THAT: mentor 2 has an answer with a weblink like '/mentor2/something-else'
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_markdown.json",
    });
    cy.intercept("**/questions/?mentor=carlos&query=*", {
      fixture: "response_with_markdown2.json",
    });
    cy.get("[data-cy=history-tab]").trigger("mouseover").click();
    cy.get("[data-cy=history-chat]").should("exist");

    // submit a question
    cy.get("[data-cy=input-field]").type("Question 1");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    // click thumbnail for mentor 2
    cy.get("[data-cy=video-thumbnail-carlos]").trigger("mouseover").click();
    // EXPECT: displays link for '/mentor2/something-else'' over video
    cy.get("[data-cy=answer-link-card]").contains(
      "https://www.amazon.com/-/es/VA"
    );

    // click thumbnail for mentor 1
    cy.get("[data-cy=video-thumbnail-clint]").trigger("mouseover").click();
    // EXPECT: displays link for '/mentor1/more-info' over video
    cy.get("[data-cy=answer-link-card]").contains("https://www.google.com");
  });

  it("clears the web link for the actively playing mentor video as user selects mentors", () => {
    // visit a page with two mentors: mentor1 and mentor2
    mockDefaultSetup(cy, {
      config: { mentorsDefault: ["clint", "julianne"] },
      mentorData: [clint, julianne],
      apiResponse: "response_with_markdown2.json",
      gqlQueries: [cyMockGQL("userQuestionSetFeedback", null)],
    });
    cy.visit("/");
    // NOTE THAT: mentor 1 has an answer with a weblink like '/mentor1/more-info'
    // NOTE THAT: mentor 2 has NO weblink for their answer
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_markdown.json",
    });
    cy.intercept("**/questions/?mentor=julianne&query=*", {
      fixture: "response_with_feedback.json",
    });
    // cy.get("[data-cy=history-tab]").trigger("mouseover").click();
    // cy.get("[data-cy=history-chat]").should("exist");

    // submit a question
    cy.get("[data-cy=input-field]").type("Question 1");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    // click thumbnail for mentor 2
    cy.get("[data-cy=video-thumbnail-julianne]").trigger("mouseover").click();
    // EXPECT: no web link over video (if there's no web link, no link card should display)
    cy.get("[data-cy=answer-link-card]").should("not.exist");

    // click thumbnail for mentor 1
    cy.get("[data-cy=video-thumbnail-clint]").trigger("mouseover").click();
    // EXPECT: displays link for '/mentor1/more-info' over video
    cy.get("[data-cy=answer-link-card]").should("exist");
    cy.get("[data-cy=answer-link-card]").contains("https://www.google.com");
  });
});
