describe("History", () => {
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
    cy.visit("/");
  });

  it("does not display in topics list if no questions have been asked", () => {
    cy.get("#topics").should("not.have.value", "History");
  });

  it("displays in topics list if questions have been asked", () => {
    cy.get("#input-field").type("Hello");
    cy.get("#input-send").click();
    cy.get("#topics").contains("History");
  });

  it("displays questions that have been asked via input", () => {
    cy.get("#input-field").type("Hello");
    cy.get("#input-send").click();

    cy.get("#topic-8").click();
    cy.get("#scrolling-questions-list").contains("Hello");
  });

  it("displays questions that have been asked via topic button", () => {
    cy.get("#topic-0").click();
    cy.get("#input-send").click();

    cy.get("#topic-8").click();
    cy.get("#scrolling-questions-list").contains("Where were you born?");
  });

  it("displays most recent questions at the top", () => {
    cy.get("#input-field").type("Hello");
    cy.get("#input-send").click();

    cy.get("#topic-8").click();
    cy.get("#scrolling-questions-list")
      .get("li")
      .first()
      .contains("Hello");

    cy.get("#input-field").type("World");
    cy.get("#input-send").click();
    cy.get("#scrolling-questions-list")
      .get("li")
      .first()
      .contains("World");
  });

  it("does not readd duplicate questions", () => {
    cy.get("#input-field").type("Hello");
    cy.get("#input-send").click();
    cy.get("#topic-8").click();
    cy.get("#scrolling-questions-list").contains("Hello");

    cy.get("#input-field").type("World");
    cy.get("#input-send").click();
    cy.get("#scrolling-questions-list").contains("Hello");
    cy.get("#scrolling-questions-list").contains("World");
    cy.get("#scrolling-questions-list")
      .find("li")
      .should("have.length", 2);
    cy.get("#scrolling-questions-list")
      .get("li")
      .first()
      .contains("World");

    cy.get("#input-field").type("Hello");
    cy.get("#input-send").click();
    cy.get("#scrolling-questions-list").contains("Hello");
    cy.get("#scrolling-questions-list").contains("World");
    cy.get("#scrolling-questions-list")
      .find("li")
      .should("have.length", 2);
    cy.get("#scrolling-questions-list")
      .get("li")
      .first()
      .contains("World");
  });
});
