// import { mockMentorData } from "./helpers";

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
