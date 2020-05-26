import { addGuestParams, mockMentorData } from "./helpers";

describe("Recommended questions", () => {
  beforeEach(() => {
    cy.server();
    mockMentorData(cy);
    cy.viewport("iphone-x");
  });

  it("do not appear in topic list if no questions are recommended", () => {
    cy.visit("/", { qs: addGuestParams() });
    cy.get("#topics").should("not.have.value", "Recommended");
  });

  it("appear in topic list if questions are recommended", () => {
    cy.visit("/", {
      qs: addGuestParams({
        recommended: "Howdy",
      }),
    });
    cy.get("#topics").contains("Recommended");
  });

  it("appear as default topic", () => {
    cy.visit("/", {
      qs: addGuestParams({
        recommended: "Howdy",
      }),
    });
    cy.get("#topics")
      .find(".topic-selected")
      .contains("Recommended");
  });

  it("list recommended questions in question list", () => {
    cy.visit("/", {
      qs: addGuestParams({
        recommended: ["Howdy", "Partner"],
      }),
    });
    cy.get("#scrolling-questions-list").contains("Howdy");
    cy.get("#scrolling-questions-list").contains("Partner");
  });

  it("display an icon next to recommended questions", () => {
    cy.visit("/", {
      qs: addGuestParams({
        recommended: "Howdy",
      }),
    });
    cy.get("#scrolling-questions-list")
      .get(`#${CSS.escape("Howdy")}`)
      .find(".recommended-question-icon");
  });

  it("appear at the top of other topic questions", () => {
    cy.visit("/", {
      qs: addGuestParams({
        recommended: "What is Japan like?",
      }),
    });
    cy.get("#topic-1").click();
    cy.get("#scrolling-questions-list")
      .get("li")
      .first()
      .contains("What is Japan like?");
    cy.get("#scrolling-questions-list")
      .get("li")
      .first()
      .find(".recommended-question-icon");
  });
});
