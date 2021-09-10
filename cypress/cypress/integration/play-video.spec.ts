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

describe("Play video and wait for it to end", () => {
  it("Video Test", () => {
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

    cy.get("[data-cy=playing-video-mentor]").within(() => {
      cy.get("video")
        .should("have.prop", "paused", true)
        .and("have.prop", "ended", false)
        .then(($video) => {
          console.log($video);
          $video[$video.length - 1].play();
        });
    });

    // wait for it to finish
    cy.get("[data-cy=playing-video-mentor] video", { timeout: 20000 }).and(
      "have.prop",
      "ended",
      true
    );
  });
});
