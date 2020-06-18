import { addGuestParams, mockMentorData } from "./helpers";

const scrubbedElements = [
    "#video-panel"
];

describe("Favorite", () => {
  beforeEach(() => {
    cy.server();
    mockMentorData(cy);
    cy.viewport("iphone-x");
  });

  it("is not toggled by default", () => {
    cy.visit("/", { qs: addGuestParams() });
    cy.get("#fave-button")
      .invoke("attr", "style")
      .should("contain", "grey");

    cy.matchImageSnapshot({ blackout: scrubbedElements} );

  });

  it("can be toggled", () => {
    cy.visit("/", { qs: addGuestParams() });
    cy.wait(1000);
    cy.get("#fave-button").click();
    cy.get("#fave-button")
      .invoke("attr", "style")
      .should("contain", "yellow");

    cy.matchImageSnapshot({ blackout: scrubbedElements} );

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

    cy.matchImageSnapshot({ blackout: scrubbedElements} );

  });
});
