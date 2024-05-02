/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { mockDefaultSetup } from "../support/helpers";

describe("Intro", () => {
  it("shows mentor introductions", () => {
    mockDefaultSetup(cy);
    cy.visit("/?mentor=clint");
    cy.get("[data-cy=chat-msg-0]").contains(
      "My name is EMC Clint Anderson. I was born in California and I have lived there most of my life. I graduated from Paramount and a couple of years after I finished high school, I joined the US Navy. I was an Electrician's Mate. I served on an aircraft carrier for eight years and then afterwards, I went to the United States Navy Reserve. During that time I started going to school with some of the abundant benefits that the military reserve has given me and I started working with various companies."
    );

    cy.visit("/?mentor=carlos");
    cy.get("[data-cy=chat-msg-0]").contains(
      "So my name is Carlos Rios. I'm a logistics lead supporting marine corps projects. I'm originally from Connecticut or New Haven, Connecticut. My mother and father are from Puerto Rico they migrated over to Connecticut and then from there after about six well I was about seven years old and moved over to a Philadelphia where I spent most of my most of my youth. About age 18-19 years old graduated high school and joined the marine corps. Twenty three years later, retired. During that time of course I got married. I have been married for twenty seven years. I have two great kids, one currently attending USC and one in the near future want to attend Clemson, South Carolina where I currently reside after my retirement from the marine corps. I spent two years as a contractor supporting the marine corps and I personally think I did such a good job that the government decided to bring it over to that side and support as a government employee and I've been doing that for about seven years high manage everything from my computer, servers, laptops to drones."
    );
  });

  it("overrides mentor introduction with query param", () => {
    mockDefaultSetup(cy);
    cy.visit("/?mentor=clint&intro=Howdy");
    cy.get("[data-cy=chat-msg-0]").contains("Howdy");

    cy.visit("/?mentor=carlos&intro=Howdy");
    cy.get("[data-cy=chat-msg-0]").contains("Howdy");
  });

  it("shows mentorpanel introductions", () => {
    mockDefaultSetup(cy);
    cy.visit("/?mentor=clint&mentor=carlos");
    cy.get("[data-cy=chat-msg-0]").contains(
      "My name is EMC Clint Anderson. I was born in California and I have lived there most of my life. I graduated from Paramount and a couple of years after I finished high school, I joined the US Navy. I was an Electrician's Mate. I served on an aircraft carrier for eight years and then afterwards, I went to the United States Navy Reserve. During that time I started going to school with some of the abundant benefits that the military reserve has given me and I started working with various companies."
    );
    cy.get("[data-cy=video-thumbnail-carlos]").click();
    cy.get("[data-cy=chat-msg-0]").contains(
      "My name is EMC Clint Anderson. I was born in California and I have lived there most of my life. I graduated from Paramount and a couple of years after I finished high school, I joined the US Navy. I was an Electrician's Mate. I served on an aircraft carrier for eight years and then afterwards, I went to the United States Navy Reserve. During that time I started going to school with some of the abundant benefits that the military reserve has given me and I started working with various companies."
    );
    cy.get("[data-cy=chat-msg-1]").contains(
      "So my name is Carlos Rios. I'm a logistics lead supporting marine corps projects. I'm originally from Connecticut or New Haven, Connecticut. My mother and father are from Puerto Rico they migrated over to Connecticut and then from there after about six well I was about seven years old and moved over to a Philadelphia where I spent most of my most of my youth. About age 18-19 years old graduated high school and joined the marine corps. Twenty three years later, retired. During that time of course I got married. I have been married for twenty seven years. I have two great kids, one currently attending USC and one in the near future want to attend Clemson, South Carolina where I currently reside after my retirement from the marine corps. I spent two years as a contractor supporting the marine corps and I personally think I did such a good job that the government decided to bring it over to that side and support as a government employee and I've been doing that for about seven years high manage everything from my computer, servers, laptops to drones."
    );
  });

  it("overrides mentorpanel introductions with query param", () => {
    mockDefaultSetup(cy);
    cy.visit("/?mentor=clint&mentor=carlos&intro=Howdy");
    cy.get("[data-cy=chat-msg-0]").contains("Howdy");
    cy.get("[data-cy=video-thumbnail-carlos]").click();
    cy.get("[data-cy=chat-msg-0]").contains("Howdy");
    cy.get("[data-cy=chat-msg-1]").contains("Howdy");
  });
});
