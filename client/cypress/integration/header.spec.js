describe("Header", () => {
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
    cy.route({
      method: "GET",
      url: "**/videos/mentors/clint/web/clintanderson_U1_1_1.mp4",
      response: "fixture:clint_intro.mp4",
    });
  });

  it("shows title for default mentor in panel", () => {
    cy.visit("/");
    cy.get("#header").contains("Clinton Anderson: Nuclear Electrician's Mate");
  });

  it("hides title for single mentor (no panel)", () => {
    cy.visit("/", {
      qs: {
        mentor: "clint",
      },
    });
    cy.get("#header").should("not.exist");
  });

  it("changes title when selecting a mentor", () => {
    cy.visit("/");
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

  it("changes title when auto-playing next mentor", () => {
    cy.visit("/");
    cy.get("#header").contains("Clinton Anderson: Nuclear Electrician's Mate");
    cy.wait(40000);
    cy.get("#header").contains(
      "Dan Davis: High Performance Computing Researcher"
    );
  });
});
