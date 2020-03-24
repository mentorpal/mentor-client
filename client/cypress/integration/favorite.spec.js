import { addGuestParams, mockMentorData } from "./helpers";

describe("Favorite", () => {
  beforeEach(() => {
    cy.server();
    mockMentorData(cy);
  });

  it("is not toggled by default", () => {
    cy.visit("/", { qs: addGuestParams() });
    cy.get("#fave-button")
      .invoke("attr", "style")
      .should("contain", "grey");
  });

  it("can be toggled", () => {
    cy.visit("/", { qs: addGuestParams() });
    cy.wait(1000);
    cy.get("#fave-button").click();
    cy.get("#fave-button")
      .invoke("attr", "style")
      .should("contain", "yellow");
  });

  it("is hidden if there is only one mentor", () => {
    cy.visit(
      "/",
      addGuestParams({
        qs: {
          mentor: "clint",
        },
      })
    );
    cy.get("#fave-button").should("not.exist");
  });
});
