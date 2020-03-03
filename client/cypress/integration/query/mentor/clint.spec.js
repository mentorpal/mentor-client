describe("Using mentor query parameter, clint: ", () => {
  beforeEach(() => {
    cy.server();
    cy.route({
      method: "GET",
      url: "https://dev.mentorpal.org/mentor-api/mentors/clint/data",
      response: "fixture:clint.json",
    });
    cy.visit("/", {
      qs: {
        mentor: "clint",
      },
    });
  });

  it("hides panel because there is only one mentor", () => {
    cy.get("#video-panel").should("not.exist");
  });

  it("hides header because there is only one mentor", () => {
    cy.get("#header").should("not.exist");
  });

  it("loads topics for clint", () => {
    cy.get("#topics").contains("About Me");
    cy.get("#topics").contains("About the Job");
    cy.get("#topics").contains("Challenges");
    cy.get("#topics").contains("Learning More");
    cy.get("#topics").contains("Lifestyle");
    cy.get("#topics").contains("Other");
    cy.get("#topics").contains("What Does it Take?");
    cy.get("#topics").contains("Who Does it?");
  });
});
