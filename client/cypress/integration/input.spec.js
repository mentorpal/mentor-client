import { addGuestParams, mockMentorData } from "./helpers";

describe("Input field", () => {
  beforeEach(() => {
    cy.server();
    mockMentorData(cy);
    cy.visit("/", { qs: addGuestParams() });
    cy.viewport("iphone-x");
  });

  it("has a default placeholder message", () => {
    cy.get("#input-field")
      .invoke("attr", "placeholder")
      .should("contain", "Ask a question");
  });

  it("can be typed into", () => {
    cy.get("#input-field").type("Hello");
    cy.get("#input-field").contains("Hello");
  });

  it("enables send button if not empty", () => {
    cy.get("#input-field").type("Hello");
    cy.get("#input-send").should("not.be.disabled");
  });

  it("disables send button if empty", () => {
    cy.get("#input-send").should("be.disabled");
    cy.get("#input-field")
      .type("Hello")
      .clear();
    cy.get("#input-send").should("be.disabled");
  });

  it("updates placeholder message to last question asked", () => {
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
    cy.get("#input-field").type("Hello");
    cy.get("#input-send").click();
    cy.get("#input-field").should("not.have.value", "Hello");
  });

  it("sends api call to get responses from mentors after sending input", () => {
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
