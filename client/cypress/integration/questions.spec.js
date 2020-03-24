import { addGuestParams, mockMentorData } from "./helpers";

describe("Questions list", () => {
  beforeEach(() => {
    cy.server();
    mockMentorData(cy);
    cy.visit("/", { qs: addGuestParams() });
  });

  it("displays list of questions for selected topic", () => {
    cy.get("#scrolling-questions-list").contains("Where were you born?");
    cy.get("#scrolling-questions-list").contains("What is Japan like?");
    cy.get("#scrolling-questions-list").contains(
      "What kind of student were you?"
    );
    cy.get("#scrolling-questions-list").contains("When did you join the Navy?");
  });

  it("changes questions when switching topics", () => {
    cy.get("#topic-1").click();
    cy.get("#scrolling-questions-list").contains(
      "What qualifications and experience do recruiters"
    );
    cy.get("#scrolling-questions-list").contains("What is Japan like?");

    cy.get("#topic-2").click();
    cy.get("#scrolling-questions-list").contains(
      "What is your strategy for overcoming your hardships?"
    );
    cy.get("#scrolling-questions-list").contains(
      "What do you see as the major problems for those"
    );
  });

  it("changes questions when switching mentors", () => {
    cy.get("#video-thumbnail-dan").click();
    cy.get("#scrolling-questions-list").contains(
      "How is cryptology different outside of the US?"
    );

    cy.get("#video-thumbnail-carlos").click();
    cy.get("#scrolling-questions-list").contains("What is Puerto Rico like?");

    cy.get("#video-thumbnail-julianne").click();
    cy.get("#scrolling-questions-list").contains(
      "Where were you commissioned?"
    );

    cy.get("#video-thumbnail-clint").click();
    cy.get("#scrolling-questions-list").contains("What is Japan like?");
  });

  it("greys out questions that have been asked (via topic button)", () => {
    cy.get("#scrolling-questions-list")
      .get(`#${CSS.escape("Where were you born?")}`)
      .find("div")
      .invoke("attr", "style")
      .should("contain", "black");

    cy.get("#topic-0").click();
    cy.get("#input-send").click();

    cy.get("#scrolling-questions-list")
      .get(`#${CSS.escape("Where were you born?")}`)
      .find("div")
      .invoke("attr", "style")
      .should("contain", "gray");
  });

  it("greys out questions that have been asked (via input field)", () => {
    cy.get("#input-field").type("where were you born?");
    cy.get("#input-send").click();

    cy.get("#scrolling-questions-list")
      .get(`#${CSS.escape("Where were you born?")}`)
      .find("div")
      .invoke("attr", "style")
      .should("contain", "gray");
  });

  it("keeps greyed out questions when switching mentors if new mentor also has it", () => {
    cy.get("#input-field").type("Are you married?");
    cy.get("#input-send").click();
    cy.get("#scrolling-questions-list")
      .get(`#${CSS.escape("Are you married?")}`)
      .find("div")
      .invoke("attr", "style")
      .should("contain", "gray");

    cy.get("#video-thumbnail-dan").click();
    cy.get("#scrolling-questions-list")
      .get(`#${CSS.escape("Are you married?")}`)
      .find("div")
      .invoke("attr", "style")
      .should("contain", "gray");
  });

  it("keeps greyed out questions when switching topics if new topic also has it", () => {
    cy.get("#input-field").type("Are you married?");
    cy.get("#input-send").click();
    cy.get("#scrolling-questions-list")
      .get(`#${CSS.escape("Are you married?")}`)
      .find("div")
      .invoke("attr", "style")
      .should("contain", "gray");

    cy.get("#topic-4").click();
    cy.get("#scrolling-questions-list")
      .get(`#${CSS.escape("Are you married?")}`)
      .find("div")
      .invoke("attr", "style")
      .should("contain", "gray");
  });
});
