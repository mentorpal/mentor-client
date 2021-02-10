/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
// import { mockMentorData } from "../support/helpers";

// describe("Guest Prompt", () => {
//   beforeEach(() => {
//     cy.server();
//     mockMentorData(cy);
//     cy.route({
//       method: "GET",
//       url: "/videos/mentors/clint/web/clintanderson_U1_1_1.mp4",
//       response: "fixture:clint_response.mp4",
//     });
//   });

// //   it("auto plays next mentor when video finishes", () => {});

//   it("changes title when auto-playing next mentor", () => {
//     cy.visit("/");
//     cy.get("#header").contains("Clinton Anderson: Nuclear Electrician's Mate");
//     cy.wait(40000);
//     cy.get("#header").contains(
//       "Dan Davis: High Performance Computing Researcher"
//     );
//   });

//   it("changes topics list when auto-playing next mentor", () => {
//     cy.visit("/");
//     cy.wait(40000);
//     cy.get("#topics").contains("About Me");
//     cy.get("#topics").contains("About the Job");
//     cy.get("#topics").contains("Challenges");
//     cy.get("#topics").contains("Learning More");
//     cy.get("#topics").contains("Lifestyle");
//     cy.get("#topics").contains("Other");
//     cy.get("#topics").contains("What Does it Take?");
//     cy.get("#topics").contains("Who Does it?");

//     cy.wait(40000);
//     cy.get("#topics").contains("About Me");
//     cy.get("#topics").contains("About the Job");
//     cy.get("#topics").contains("Challenges");
//     cy.get("#topics").contains("Learning More");
//     cy.get("#topics").contains("Lifestyle");
//     cy.get("#topics").contains("Other");
//     cy.get("#topics").contains("What Does it Take?");
//     cy.get("#topics").contains("Who Does it?");

//     cy.wait(40000);
//     cy.get("#topics").contains("About Me");
//     cy.get("#topics").contains("About the Job");
//     cy.get("#topics").contains("Challenges");
//     cy.get("#topics").contains("Lifestyle");
//     cy.get("#topics").contains("What Does it Take?");
//     cy.get("#topics").contains("Who Does it?");
//   });
// });