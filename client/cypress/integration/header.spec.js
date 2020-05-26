import { addGuestParams, mockMentorData } from "./helpers";

describe("Header", () => {
  beforeEach(() => {
    cy.server();
    mockMentorData(cy);
    cy.viewport("iphone-x");
  });

  it("shows title for default mentor in panel", () => {
    cy.visit("/", { qs: addGuestParams() });
    cy.get("#header").contains("Clinton Anderson: Nuclear Electrician's Mate");
  });

  it("changes title when selecting a mentor", () => {
    cy.visit("/", { qs: addGuestParams() });
    cy.get("#video-thumbnail-dan").click();
    cy.get("#header").contains(
      "Dan Davis: High Performance Computing Researcher"
    );

    cy.get("#video-thumbnail-carlos").click();
    cy.get("#header").contains("Carlos Rios: Marine Logistician");

    cy.get("#video-thumbnail-julianne").click();
    cy.get("#header").contains("Julianne Nordhagen: Student Naval Aviator");

    cy.get("#video-thumbnail-clint").click();
    cy.get("#header").contains("Clinton Anderson: Nuclear Electrician's Mate");
  });

  it("hides title for single mentor (no panel)", () => {
    cy.visit("/", {
      qs: addGuestParams({
        mentor: "clint",
      }),
    });
    cy.get("#header").should("not.exist");
  });
});
