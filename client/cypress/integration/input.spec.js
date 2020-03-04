describe("Input field", () => {
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

  it("has default placeholder message", () => {
    cy.visit("/");
    cy.get("#input-field")
      .invoke("attr", "placeholder")
      .should("contain", "Ask a question");
  });

  it("can be typed into", () => {
    cy.visit("/");
    cy.get("#input-field").type("Hello");
    cy.get("#input-field").contains("Hello");
  });

  it("enables send button if text", () => {
    cy.visit("/");
    cy.get("#input-field").type("Hello");
    cy.get("#input-send").should("not.be.disabled");
  });

  it("disables send button if no text", () => {
    cy.visit("/");
    cy.get("#input-send").should("be.disabled");
    cy.get("#input-field")
      .type("Hello")
      .clear();
    cy.get("#input-send").should("be.disabled");
  });

  it("updates placeholder message to last question asked", () => {
    cy.visit("/");
    cy.get("#input-field").type("Hello");
    cy.get("#input-send").click();
    cy.get("#input-field")
      .invoke("attr", "placeholder")
      .should("contain", "Hello");

    cy.get("#input-field").type("Test");
    cy.get("#input-send").click();
    cy.get("#input-field")
      .invoke("attr", "placeholder")
      .should("contain", "Test");
  });

  it("clears text after sending input", () => {
    cy.visit("/");
    cy.get("#input-field").type("Hello");
    cy.get("#input-send").click();
    cy.get("#input-field").should("not.have.value", "Hello");
  });

  it("clears text after selecting input", () => {
    cy.visit("/");
    cy.get("#input-field").type("Hello");
    cy.get("#input-field").click();
    cy.get("#input-field").should("not.have.value", "Hello");
    cy.get("#input-field")
      .invoke("attr", "placeholder")
      .should("contain", "Ask a question");
  });

  it("sends api call to get responses from mentors after sending input", () => {
    cy.visit("/");

    cy.route({
      method: "GET",
      url: "**/mentor-api/questions/?mentor=clint&query=how+old+are+you",
      response: "fixture:clint_response.json",
    }).as("askClint");
    cy.route({
      method: "GET",
      url: "**/mentor-api/questions/?mentor=dan&query=how+old+are+you",
      response: "fixture:clint_response.json",
    }).as("askDan");
    cy.route({
      method: "GET",
      url: "**/mentor-api/questions/?mentor=julianne&query=how+old+are+you",
      response: "fixture:clint_response.json",
    }).as("askJulianne");
    cy.route({
      method: "GET",
      url: "**/mentor-api/questions/?mentor=carlos&query=how+old+are+you",
      response: "fixture:clint_response.json",
    }).as("askCarlos");

    cy.get("#input-field").type("how old are you");
    cy.get("#input-send").click();

    cy.wait(["@askClint", "@askDan", "@askJulianne", "@askCarlos"], {
      responseTimeout: 15000,
    });
    expect(true).to.equal(true);
  });
});
