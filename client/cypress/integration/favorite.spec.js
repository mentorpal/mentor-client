describe("Favorite", () => {
  beforeEach(() => {
    cy.server();
    cy.route({
      method: "GET",
      url: "**/mentor-api/mentors/clint/data",
      response: "fixture:clint.json",
    });
    cy.route({
      method: "GET",
      url: "**/mentor-api/mentors/dan/data",
      response: "fixture:dan.json",
    });
    cy.route({
      method: "GET",
      url: "**/mentor-api/mentors/carlos/data",
      response: "fixture:carlos.json",
    });
    cy.route({
      method: "GET",
      url: "**/mentor-api/mentors/julianne/data",
      response: "fixture:julianne.json",
    });
  });

  it("is not toggled by default", () => {
    cy.visit("/");
    cy.get("#fave-button")
      .invoke("attr", "style")
      .should("contain", "grey");
  });

  it("can be toggled", () => {
    cy.visit("/");
    cy.wait(1000);
    cy.get("#fave-button").click();
    cy.get("#fave-button")
      .invoke("attr", "style")
      .should("contain", "yellow");
  });
});
