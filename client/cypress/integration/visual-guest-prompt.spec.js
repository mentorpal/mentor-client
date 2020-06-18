import { mockMentorData } from "./helpers";

const scrubbedElements = [
    "#video-container video",
    "#video-panel"
];

describe("Guest Prompt", () => {
  beforeEach(() => {
    cy.server();
    mockMentorData(cy);
    cy.viewport("iphone-x");
  });

  it("prompts anonymous user for a guest name", () => {
    cy.visit("/");
    cy.get("#guest-prompt").should("exist");
    cy.get("#guest-prompt-header").contains("Enter a guest name:");
    cy.get("#guest-prompt-input").should("exist");

    cy.get('div[class="MuiPaper-root makeStyles-paper-6 MuiPaper-elevation1 MuiPaper-rounded"]').matchImageSnapshot();

  });

  it("does not play video until there is a session user", () => {
    cy.visit("/");
    cy.get("#video-container video").should("not.have.attr", "autoplay");

    cy.matchImageSnapshot();
  });

  it("reloads with a guest session on submit name via guest prompt", () => {
    cy.visit("/");
    cy.get("#guest-prompt-input").type("guestuser1");
    cy.get("#guest-prompt-input-send").click();
    cy.url().should("include", "actor=");
    cy.url().should("include", "guestuser1");
    cy.get("#guest-prompt").should("not.exist");
    cy.get("#video-container video").should("exist");
    cy.get("#video-container video").should(
      "have.attr",
      "autoplay",
      "autoplay"
    );

    cy.matchImageSnapshot({ blackout: scrubbedElements} );
  });

  it("loads a single specific mentor", () => {
    cy.visit("/?mentor=clint");
    cy.get("#guest-prompt-input").type("guestuser1");
    cy.get("#guest-prompt-input-send").click();
    cy.url().should("include", "actor=");
    cy.url().should("include", "guestuser1");
    cy.get("#guest-prompt").should("not.exist");
    cy.get("#video-container video").should("exist");
    cy.get("#video-container video").should(
      "have.attr",
      "autoplay",
      "autoplay"
    );

    cy.matchImageSnapshot({blackout: scrubbedElements});
  });

  it("accepts enter in guest-name input field as submit", () => {
    cy.visit("/");
    cy.get("#guest-prompt-input").type("guestuser2\n");
    cy.url().should("include", "actor=");
    cy.url().should("include", "guestuser2");
    cy.get("#guest-prompt").should("not.exist");
    cy.get("#video-container video").should("exist");
    cy.get("#video-container video").should(
      "have.attr",
      "autoplay",
      "autoplay"
    );

    cy.matchImageSnapshot({blackout: scrubbedElements});
  });
});
