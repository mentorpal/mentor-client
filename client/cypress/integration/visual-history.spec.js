import { addGuestParams, mockMentorData, mockMentorVideos } from "./helpers";

const scrubbedElements = [
    "#video-container video",
    "#video-panel"
];

describe("History", () => {
  beforeEach(() => {
    cy.server();
    mockMentorData(cy);
    mockMentorVideos(cy);
    cy.visit("/", { qs: addGuestParams() });
    cy.viewport("iphone-x");
  });

  it("does not display in topics list if no questions have been asked", () => {
    cy.get("#topics").should("not.have.value", "History");

    cy.get("#topics").scrollTo('right', { duration: 300 });

    cy.matchImageSnapshot({blackout: scrubbedElements});
  });

  it("displays in topics list if questions have been asked", () => {
    cy.get("#input-field").type("Hello");
    cy.get("#input-send").click();
    cy.get("#topics").contains("History");

    cy.get("#topic-8").scrollIntoView();

    cy.matchImageSnapshot({blackout: scrubbedElements});
  });

  it("displays questions that have been asked via input", () => {
    cy.get("#input-field").type("Hello");
    cy.get("#input-send").click();
    cy.get("#topic-8").click();
    cy.get("#scrolling-questions-list").contains("Hello");

    cy.get("#topic-8").scrollIntoView();

    cy.matchImageSnapshot({blackout: scrubbedElements});
  });

  it("displays questions that have been asked via topic button", () => {
    cy.get("#topic-0").click();
    cy.get("#input-send").click();
    cy.get("#topic-8").click();
    cy.get("#scrolling-questions-list").contains("Where were you born?");

    cy.get("#topic-8").scrollIntoView();

    cy.matchImageSnapshot({blackout: scrubbedElements});
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

    cy.get("#topic-8").scrollIntoView();

    cy.matchImageSnapshot({blackout: scrubbedElements});
  });

  it("does not read duplicate questions", () => {
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

    cy.get("#topic-8").scrollIntoView();

    cy.matchImageSnapshot({blackout: scrubbedElements});
  });
});
