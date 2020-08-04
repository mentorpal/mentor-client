/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { addGuestParams, mockMentorData } from "./helpers";
describe("Topics list", () => {
  beforeEach(() => {
    cy.server();
    mockMentorData(cy);
    cy.visit("/", { qs: addGuestParams() });
    cy.viewport("iphone-x");
  });

  it("shows topics for current mentor", () => {
    cy.get("#topics").contains("About Me");
    cy.get("#topics").contains("About the Job");
    cy.get("#topics").contains("Challenges");
    cy.get("#topics").contains("Learning More");
    cy.get("#topics").contains("Lifestyle");
    cy.get("#topics").contains("Other");
    cy.get("#topics").contains("What Does it Take?");
    cy.get("#topics").contains("Who Does it?");
  });

  it("has default topic selected", () => {
    cy.get("#topics")
      .find(".topic-selected")
      .should("have.length", 1);
    cy.get("#topic-0").find(".topic-selected");
  });

  it("can select a topic", () => {
    cy.get("#topic-1").click();
    cy.get("#topics")
      .find(".topic-selected")
      .should("have.length", 1);
    cy.get("#topic-1").find(".topic-selected");

    cy.get("#topic-2").click();
    cy.get("#topics")
      .find(".topic-selected")
      .should("have.length", 1);
    cy.get("#topic-2").find(".topic-selected");

    cy.get("#topic-3").click();
    cy.get("#topics")
      .find(".topic-selected")
      .should("have.length", 1);
    cy.get("#topic-3").find(".topic-selected");

    cy.get("#topic-4").click();
    cy.get("#topics")
      .find(".topic-selected")
      .should("have.length", 1);
    cy.get("#topic-4").find(".topic-selected");

    cy.get("#topic-5").click();
    cy.get("#topics")
      .find(".topic-selected")
      .should("have.length", 1);
    cy.get("#topic-5").find(".topic-selected");

    cy.get("#topic-6").click();
    cy.get("#topics")
      .find(".topic-selected")
      .should("have.length", 1);
    cy.get("#topic-6").find(".topic-selected");

    cy.get("#topic-7").click();
    cy.get("#topics")
      .find(".topic-selected")
      .should("have.length", 1);
    cy.get("#topic-7").find(".topic-selected");
  });

  it("changes topics when selecting a mentor", () => {
    cy.get("#video-thumbnail-dan").click();
    cy.get("#topics").contains("About Me");
    cy.get("#topics").contains("About the Job");
    cy.get("#topics").contains("Challenges");
    cy.get("#topics").contains("Learning More");
    cy.get("#topics").contains("Lifestyle");
    cy.get("#topics").contains("Other");
    cy.get("#topics").contains("What Does it Take?");
    cy.get("#topics").contains("Who Does it?");

    cy.get("#video-thumbnail-carlos").click();
    cy.get("#topics").contains("About Me");
    cy.get("#topics").contains("About the Job");
    cy.get("#topics").contains("Challenges");
    cy.get("#topics").contains("Learning More");
    cy.get("#topics").contains("Lifestyle");
    cy.get("#topics").contains("Other");
    cy.get("#topics").contains("What Does it Take?");
    cy.get("#topics").contains("Who Does it?");

    cy.get("#video-thumbnail-julianne").click();
    cy.get("#topics").contains("About Me");
    cy.get("#topics").contains("About the Job");
    cy.get("#topics").contains("Challenges");
    cy.get("#topics").should("not.have.value", "Learning More");
    cy.get("#topics").contains("Lifestyle");
    cy.get("#topics").should("not.have.value", "Other");
    cy.get("#topics").contains("What Does it Take?");
    cy.get("#topics").contains("Who Does it?");
  });

  it("keeps selected topic when switching mentors if new mentor has it", () => {
    cy.get("#topic-0").find(".topic-selected");
    cy.get("#video-thumbnail-dan").click();
    cy.get("#topic-0").find(".topic-selected");

    cy.get("#topic-1").click();
    cy.get("#topic-1").find(".topic-selected");
    cy.get("#video-thumbnail-carlos").click();
    cy.get("#topic-1").find(".topic-selected");
  });

  it("does not keep selected topic when switching mentors if new mentor does not have it", () => {
    cy.get("#topic-3").click();
    cy.get("#topic-3").find(".topic-selected");
    cy.get("#topic-3").find(".topic-selected");

    cy.get("#video-thumbnail-julianne").click();
    cy.get("#topic-3").not(".topic-selected");
  });

  it("recommends a topic-relevant question for current mentor when topic is selected", () => {
    cy.get("#topic-1").click();
    cy.get("#input-field").contains(
      "What qualifications and experience do recruiters"
    );
    cy.get("#topic-2").click();
    cy.get("#input-field").contains(
      "What do you see as the major problems for those"
    );
    cy.get("#topic-3").click();
    cy.get("#input-field").contains("Where can I find an internship that will");

    cy.get("#topic-4").click();
    cy.get("#input-field").contains(
      "What advice do you have for spouses who don't"
    );
    cy.get("#topic-5").click();
    cy.get("#input-field").contains("What person do you most admire and why?");

    cy.get("#topic-6").click();
    cy.get("#input-field").contains(
      "What qualifications and experience do recruiters"
    );
    cy.get("#topic-7").click();
    cy.get("#input-field").contains(
      "Did you like wearing the same uniform every day"
    );
  });

  it("recommends different topic-relevant question for different current mentor", () => {
    cy.get("#video-thumbnail-dan").click();

    cy.get("#topic-1").click();
    cy.get("#input-field").contains("What has been your favorite");

    cy.get("#topic-2").click();
    cy.get("#input-field").contains("What is your strategy");

    cy.get("#topic-3").click();
    cy.get("#input-field").contains("Where can I find an internship that will");

    cy.get("#topic-4").click();
    cy.get("#input-field").contains("What is the food");

    cy.get("#topic-5").click();
    cy.get("#input-field").contains("Tell me a funny");

    cy.get("#topic-6").click();
    cy.get("#input-field").contains("What is your strategy for");

    cy.get("#topic-7").click();
    cy.get("#input-field").contains("Do you have any tattoos");
  });

  it("does not recommend a topic question that has already been asked (via manual input)", () => {
    cy.get("#input-field").type("where were you born?");
    cy.get("#input-send").click();
    cy.get("#topic-0").click();
    cy.get("#input-field").contains("What is Japan like");
  });

  it("does not recommend a topic question that has already been asked (via topic button)", () => {
    cy.get("#topic-0").click();
    cy.get("#input-send").click();
    cy.get("#topic-0").click();
    cy.get("#input-field").contains("What is Japan like");
  });

  it("skips topic questions that have already been asked", () => {
    cy.get("#input-field").type("where were you born?");
    cy.get("#input-send").click();

    cy.get("#input-field").type("what is Japan like?");
    cy.get("#input-send").click();

    cy.get("#topic-0").click();
    cy.get("#input-field").contains("What do you do in computer");
  });
});
