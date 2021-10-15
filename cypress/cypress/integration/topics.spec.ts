/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { visitAsGuestWithDefaultSetup } from "../support/helpers";

describe("Topics list", () => {
  it("shows topics for current mentor", () => {
    visitAsGuestWithDefaultSetup(cy, "/");
    cy.get("[data-cy=topic-tab]")
      .trigger("mouseover")
      .click()
      .get("[data-cy=topics-questions-list]")
      .within(() => {
        cy.get("[data-cy=topic-opt-item-0]").contains("About Me");
        cy.get("[data-cy=topic-opt-item-1]").contains("About the Job");
      });
  });

  it("has default topic selected (mobile)", () => {
    visitAsGuestWithDefaultSetup(cy, "/");
    cy.get("[data-cy=topic-tab]").trigger("mouseover").click();
    cy.get("[data-cy=topics-questions-list]").within(() => {
      cy.get("[data-cy=topic-opt-item-0]").trigger("mouseover").click();
    });
    // test that the TOPIC tab is selected (not the history tab)
    cy.get("[data-cy=topics]").within(() => {
      cy.get("button").eq(1).should("have.attr", "data-test", "About Me");
    });

    cy.get("[data-cy=scrolling-questions-list]").should(
      "have.attr",
      "data-topic",
      "About Me"
    );

    // test that within the TOPIC dropdown that the first item is already selected
    cy.get("[data-cy=topic-tab]")
      .trigger("mouseover")
      .click()
      .get("div>li")
      .eq(0)
      .should("have.attr", "data-test", "About Me");
    cy.get("[data-cy=close-topics]").trigger("mouseover").click();

    // test that the content displayed in the questions-list panel is the list of questions for the default/selected topic
    cy.get("[data-cy=scrolling-questions-list]").within(() => {
      cy.get("li").eq(0).contains("Where were you born?");
      cy.get("li").eq(1).contains("What's your favorite movie?");
    });
  });

  it("has default topic selected (web)", () => {
    visitAsGuestWithDefaultSetup(cy, "/");
    cy.viewport(1300, 1000);
    // test that the first topic tab is selected
    cy.get("[data-cy=history-tab]").within(() => {
      cy.get("[data-cy=history-tab-inner]").should(
        "have.attr",
        "data-test",
        "History"
      );
    });

    // test that the content displayed in the questions-list panel is the list of questions for the default/selected topic
    cy.get("[data-cy=chat-thread]").within(() => {
      cy.get("[data-cy=chat-msg-0]").contains(
        "My name is EMC Clint Anderson. I was born in California and I have lived there most of my life. I graduated from Paramount and a couple of years after I finished high school, I joined the US Navy. I was an Electrician's Mate. I served on an aircraft carrier for eight years and then afterwards, I went to the United States Navy Reserve. During that time I started going to school with some of the abundant benefits that the military reserve has given me and I started working with various companies."
      );
    });
  });

  it("can select a topic", () => {
    visitAsGuestWithDefaultSetup(cy, "/");
    cy.get("[data-cy=topic-tab]")
      .trigger("mouseover")
      .click()
      .get("div>li")
      .eq(2)
      .trigger("mouseover")
      .click();

    cy.get("[data-cy=topic-tab]").trigger("mouseover").click();

    cy.get("[data-cy=topics-questions-list]").within(() => {
      cy.get("[data-cy=topic-opt-item-1]").should(
        "have.attr",
        "data-test",
        "About the Job"
      );
    });
  });

  it("can collapse questions list by clicking selected topic", () => {
    visitAsGuestWithDefaultSetup(cy, "/");
    cy.get("[data-cy=topic-tab]").trigger("mouseover").click();
    cy.get("[data-cy=topics-questions-list]").within(() => {
      cy.get("[data-cy=topic-opt-item-0]").trigger("mouseover").click();
    });
    cy.get("[data-cy=scrolling-questions-list]");
    cy.get("[data-cy=topic-tab]")
      .trigger("mouseover")
      .click()
      .get("div>li")
      .eq(0)
      .trigger("mouseover")
      .click();

    cy.get("[data-cy=scrolling-questions-list]").should("not.exist");

    cy.get("[data-cy=topic-tab]")
      .trigger("mouseover")
      .click()
      .get("div>li")
      .eq(0)
      .should("not.have.attr", "data-test", "About Me");
  });

  it("changes topics when selecting a mentor", () => {
    visitAsGuestWithDefaultSetup(cy, "/");
    cy.get("[data-cy=video-thumbnail-carlos]").should(
      "have.attr",
      "data-ready",
      "true"
    );
    cy.get("[data-cy=video-thumbnail-carlos]").trigger("mouseover").click();
    cy.get("[data-cy=topic-tab]")
      .trigger("mouseover")
      .click()
      .get("[data-cy=topics-questions-list]")
      .within(() => {
        cy.get("[data-cy=topic-opt-item-0]").contains("About Me");
        cy.get("[data-cy=topic-opt-item-1]").contains("About the Job");
      });
    // close topics
    cy.get("[data-cy=close-topics]").trigger("mouseover").click();

    cy.get("[data-cy=video-thumbnail-julianne]").should(
      "have.attr",
      "data-ready",
      "true"
    );
    cy.get("[data-cy=video-thumbnail-julianne]").trigger("mouseover").click();
    cy.get("[data-cy=topic-tab]")
      .trigger("mouseover")
      .click()
      .get("[data-cy=topics-questions-list]")
      .within(() => {
        cy.get("[data-cy=topic-opt-item-0]").contains("About Me");
        cy.get("[data-cy=topic-opt-item-1]").contains("Challenges");
      });
    // close topics
    cy.get("[data-cy=close-topics]").trigger("mouseover").click();
  });

  it("keeps selected topic when switching mentors if new mentor has it", () => {
    visitAsGuestWithDefaultSetup(cy, "/");
    cy.get("[data-cy=topic-tab]")
      .trigger("mouseover")
      .click()
      .get("div>li")
      .eq(2)
      .trigger("mouseover")
      .click();

    cy.get("[data-cy=topic-tab]")
      .trigger("mouseover")
      .click()
      .get("div>li")
      .eq(1)
      .should("have.attr", "data-test", "About the Job");
    cy.get("[data-cy=close-topics]").trigger("mouseover").click();

    cy.get("[data-cy=video-thumbnail-carlos]").should(
      "have.attr",
      "data-ready",
      "true"
    );
    cy.get("[data-cy=video-thumbnail-carlos]").trigger("mouseover").click();

    cy.get("[data-cy=topic-tab]")
      .trigger("mouseover")
      .click()
      .get("div>li")
      .eq(1)
      .should("have.attr", "data-test", "About the Job");
  });

  it("does not keep selected topic when switching mentors if new mentor does not have it", () => {
    visitAsGuestWithDefaultSetup(cy, "/");
    cy.get("[data-cy=topic-tab]")
      .trigger("mouseover")
      .click()
      .get("div>li")
      .eq(2)
      .trigger("mouseover")
      .click();

    cy.get("[data-cy=topic-tab]")
      .trigger("mouseover")
      .click()
      .get("div>li")
      .eq(1)
      .should("have.attr", "data-test", "About the Job");
    cy.get("[data-cy=close-topics]").trigger("mouseover").click();

    cy.get("[data-cy=video-thumbnail-julianne]").should(
      "have.attr",
      "data-ready",
      "true"
    );
    cy.get("[data-cy=video-thumbnail-julianne]").trigger("mouseover").click();

    cy.get("[data-cy=topic-tab]")
      .trigger("mouseover")
      .click()
      .get("div>li")
      .eq(1)
      .should("not.have.attr", "data-test", "About the Job");
    cy.get("[data-cy=close-topics]").trigger("mouseover").click();
  });

  it("recommends a topic-relevant question for current mentor when topic is selected", () => {
    visitAsGuestWithDefaultSetup(cy, "/");
    cy.get("[data-cy=topic-tab]")
      .trigger("mouseover")
      .click()
      .get("div>li")
      .eq(2)
      .trigger("mouseover")
      .click();

    cy.get("[data-cy=input-field-wrapper]").should(
      "have.attr",
      "data-topic",
      "About the Job"
    );
    cy.get("[data-cy=input-field]").contains(
      "What qualifications and experience do recruiters"
    );
  });

  it("recommends different topic-relevant question for different current mentor", () => {
    visitAsGuestWithDefaultSetup(cy, "/");
    cy.get("[data-cy=video-thumbnail-julianne]").should(
      "have.attr",
      "data-ready",
      "true"
    );
    cy.get("[data-cy=video-thumbnail-julianne]").trigger("mouseover").click();

    cy.get("[data-cy=topic-tab]")
      .trigger("mouseover")
      .click()
      .get("div>li")
      .eq(2)
      .trigger("mouseover")
      .click();

    cy.get("[data-cy=input-field-wrapper]").should(
      "have.attr",
      "data-topic",
      "Challenges"
    );
    cy.get("[data-cy=input-field]").contains(
      "Were you worried about starting college?"
    );
  });

  it("does not recommend a topic question that has already been asked (via manual input)", () => {
    visitAsGuestWithDefaultSetup(cy, "/");
    cy.get("[data-cy=input-field]").type("where were you born?");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    cy.get("[data-cy=topic-tab]").trigger("mouseover").click();
    cy.get("[data-cy=topics-questions-list]").within(() => {
      cy.get("[data-cy=topic-opt-item-0]").trigger("mouseover").click();
    });
    cy.get("[data-cy=topic-tab]")
      .trigger("mouseover")
      .click()
      .get("div>li")
      .eq(1)
      .trigger("mouseover")
      .click();

    cy.get("[data-cy=input-field-wrapper]").should(
      "have.attr",
      "data-topic",
      "About the Job"
    );
    cy.get("[data-cy=topic-tab]")
      .trigger("mouseover")
      .click()
      .get("div>li")
      .eq(0)
      .trigger("mouseover")
      .click();

    cy.get("[data-cy=input-field-wrapper]").should(
      "have.attr",
      "data-topic",
      "About Me"
    );
    cy.get("[data-cy=input-field]").contains("What's your favorite movie?");
  });

  it("does not recommend a topic question that has already been asked (via topic button)", () => {
    visitAsGuestWithDefaultSetup(cy, "/");
    cy.get("[data-cy=topic-tab]")
      .trigger("mouseover")
      .click()
      .get("div>li")
      .eq(1)
      .trigger("mouseover")
      .click();

    cy.get("[data-cy=topic-tab]")
      .trigger("mouseover")
      .click()
      .get("div>li")
      .eq(0)
      .trigger("mouseover")
      .click();

    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    cy.get("[data-cy=topic-tab]")
      .trigger("mouseover")
      .click()
      .get("div>li")
      .eq(1)
      .trigger("mouseover")
      .click();

    cy.get("[data-cy=input-field-wrapper]").should(
      "have.attr",
      "data-topic",
      "About the Job"
    );
    cy.get("[data-cy=topic-tab]")
      .trigger("mouseover")
      .click()
      .get("div>li")
      .eq(0)
      .trigger("mouseover")
      .click();

    cy.get("[data-cy=input-field-wrapper]").should(
      "have.attr",
      "data-topic",
      "About Me"
    );
    cy.get("[data-cy=input-field]").contains("What's your favorite movie?");
  });

  it("skips topic questions that have already been asked", () => {
    visitAsGuestWithDefaultSetup(cy, "/");
    cy.get("[data-cy=input-field]").type("where were you born?");
    cy.get("[data-cy=input-send]").trigger("mouseover").click();

    cy.get("[data-cy=topic-tab]").trigger("mouseover").click();
    cy.get("[data-cy=topics-questions-list]").within(() => {
      cy.get("[data-cy=topic-opt-item-0]").trigger("mouseover").click();
    });

    cy.get("[data-cy=topic-tab]")
      .trigger("mouseover")
      .click()
      .get("div>li")
      .eq(1)
      .trigger("mouseover")
      .click();

    cy.get("[data-cy=input-field-wrapper]").should(
      "have.attr",
      "data-topic",
      "About the Job"
    );
    cy.get("[data-cy=topic-tab]")
      .trigger("mouseover")
      .click()
      .get("div>li")
      .eq(0)
      .trigger("mouseover")
      .click();

    cy.get("[data-cy=input-field-wrapper]").should(
      "have.attr",
      "data-topic",
      "About Me"
    );
    cy.get("[data-cy=input-field]").contains("What's your favorite movie?");
  });
});
