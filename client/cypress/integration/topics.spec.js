describe("Topics list", () => {
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

  it("shows topics list for default mentor in panel", () => {
    cy.visit("/");
    cy.get("#topics").contains("About Me");
    cy.get("#topics").contains("About the Job");
    cy.get("#topics").contains("Challenges");
    cy.get("#topics").contains("Learning More");
    cy.get("#topics").contains("Lifestyle");
    cy.get("#topics").contains("Other");
    cy.get("#topics").contains("What Does it Take?");
    cy.get("#topics").contains("Who Does it?");
  });

  it("has default topic selected", () => {
    cy.visit("/");
    cy.get("#topics")
      .find(".topic-selected")
      .should("have.length", 1);
    cy.get("#topic-0").find(".topic-selected");
  });

  it("can select a topic", () => {
    cy.visit("/");
    cy.get("#topic-1").click();
    cy.get("#topics")
      .find(".topic-selected")
      .should("have.length", 1);
    cy.get("#topic-1").find(".topic-selected");

    cy.get("#topic-2").click();
    cy.get("#topics")
      .find(".topic-selected")
      .should("have.length", 1);
    cy.get("#topic-2").find(".topic-selected");

    cy.get("#topic-3").click();
    cy.get("#topics")
      .find(".topic-selected")
      .should("have.length", 1);
    cy.get("#topic-3").find(".topic-selected");

    cy.get("#topic-4").click();
    cy.get("#topics")
      .find(".topic-selected")
      .should("have.length", 1);
    cy.get("#topic-4").find(".topic-selected");

    cy.get("#topic-5").click();
    cy.get("#topics")
      .find(".topic-selected")
      .should("have.length", 1);
    cy.get("#topic-5").find(".topic-selected");

    cy.get("#topic-6").click();
    cy.get("#topics")
      .find(".topic-selected")
      .should("have.length", 1);
    cy.get("#topic-6").find(".topic-selected");

    cy.get("#topic-7").click();
    cy.get("#topics")
      .find(".topic-selected")
      .should("have.length", 1);
    cy.get("#topic-7").find(".topic-selected");
  });

  it("changes topics list when selecting a mentor", () => {
    cy.visit("/");
    cy.get("#video-thumbnail-dan").click();
    cy.get("#topics").contains("About Me");
    cy.get("#topics").contains("About the Job");
    cy.get("#topics").contains("Challenges");
    cy.get("#topics").contains("Learning More");
    cy.get("#topics").contains("Lifestyle");
    cy.get("#topics").contains("Other");
    cy.get("#topics").contains("What Does it Take?");
    cy.get("#topics").contains("Who Does it?");

    cy.get("#video-thumbnail-carlos").click();
    cy.get("#topics").contains("About Me");
    cy.get("#topics").contains("About the Job");
    cy.get("#topics").contains("Challenges");
    cy.get("#topics").contains("Learning More");
    cy.get("#topics").contains("Lifestyle");
    cy.get("#topics").contains("Other");
    cy.get("#topics").contains("What Does it Take?");
    cy.get("#topics").contains("Who Does it?");

    cy.get("#video-thumbnail-julianne").click();
    cy.get("#topics").contains("About Me");
    cy.get("#topics").contains("About the Job");
    cy.get("#topics").contains("Challenges");
    cy.get("#topics").contains("Lifestyle");
    cy.get("#topics").contains("What Does it Take?");
    cy.get("#topics").contains("Who Does it?");
  });

  it("changes topics list when auto-playing next mentor", () => {
    cy.visit("/");
    cy.wait(40000);
    cy.get("#topics").contains("About Me");
    cy.get("#topics").contains("About the Job");
    cy.get("#topics").contains("Challenges");
    cy.get("#topics").contains("Learning More");
    cy.get("#topics").contains("Lifestyle");
    cy.get("#topics").contains("Other");
    cy.get("#topics").contains("What Does it Take?");
    cy.get("#topics").contains("Who Does it?");

    cy.wait(40000);
    cy.get("#topics").contains("About Me");
    cy.get("#topics").contains("About the Job");
    cy.get("#topics").contains("Challenges");
    cy.get("#topics").contains("Learning More");
    cy.get("#topics").contains("Lifestyle");
    cy.get("#topics").contains("Other");
    cy.get("#topics").contains("What Does it Take?");
    cy.get("#topics").contains("Who Does it?");

    cy.wait(40000);
    cy.get("#topics").contains("About Me");
    cy.get("#topics").contains("About the Job");
    cy.get("#topics").contains("Challenges");
    cy.get("#topics").contains("Lifestyle");
    cy.get("#topics").contains("What Does it Take?");
    cy.get("#topics").contains("Who Does it?");
  });

  it("keeps selected topic when switching mentors if both mentors share it", () => {
    cy.visit("/");

    cy.get("#topic-0").find(".topic-selected");
    cy.get("#video-thumbnail-dan").click();
    cy.get("#topic-0").find(".topic-selected");

    cy.get("#topic-1").click();
    cy.get("#topic-1").find(".topic-selected");
    cy.get("#video-thumbnail-carlos").click();
    cy.get("#topic-1").find(".topic-selected");
  });

  it("does not keep selected topic when switching mentors if new mentor does not have it", () => {
    cy.visit("/");

    cy.get("#topic-3").click();
    cy.get("#topic-3").find(".topic-selected");
    cy.get("#topic-3").find(".topic-selected");

    cy.get("#video-thumbnail-julianne").click();
    cy.get("#topic-3").not(".topic-selected");
  });

  it("recommends a topic-relevant question for current mentor when topic is selected", () => {
    cy.visit("/");

    cy.get("#topic-1").click();
    cy.get("#input-field").contains(
      "What qualifications and experience do recruiters"
    );
    cy.get("#topic-2").click();
    cy.get("#input-field").contains(
      "What do you see as the major problems for those"
    );
    cy.get("#topic-3").click();
    cy.get("#input-field").contains("Where can I find an internship that will");

    cy.get("#topic-4").click();
    cy.get("#input-field").contains(
      "What advice do you have for spouses who don't"
    );
    cy.get("#topic-5").click();
    cy.get("#input-field").contains("What person do you most admire and why?");

    cy.get("#topic-6").click();
    cy.get("#input-field").contains(
      "What qualifications and experience do recruiters"
    );
    cy.get("#topic-7").click();
    cy.get("#input-field").contains(
      "Did you like wearing the same uniform every day"
    );
  });

  it("recommends different topic-relevant question for different current mentor", () => {
    cy.visit("/");
    cy.get("#video-thumbnail-dan").click();

    cy.get("#topic-1").click();
    cy.get("#input-field").contains("What has been your favorite");

    cy.get("#topic-2").click();
    cy.get("#input-field").contains("What is your strategy");

    cy.get("#topic-3").click();
    cy.get("#input-field").contains("Where can I find an internship that will");

    cy.get("#topic-4").click();
    cy.get("#input-field").contains("What is the food");

    cy.get("#topic-5").click();
    cy.get("#input-field").contains("Tell me a funny");

    cy.get("#topic-6").click();
    cy.get("#input-field").contains("What is your strategy for");

    cy.get("#topic-7").click();
    cy.get("#input-field").contains("Do you have any tattoos");
  });

  it("does not recommend a topic question that has already been asked", () => {
    cy.visit("/");

    cy.get("#topic-0").click();
    cy.get("#input-field").contains("Where were you born?");

    // direct match from manual input
    cy.get("#input-field").type("Where were you born?");
    cy.get("#input-send").click();
    cy.get("#topic-0").click();
    cy.get("#input-field").contains("What is Japan like");

    // direct match from topic button suggestion
    cy.get("#input-send").click();
    cy.get("#topic-0").click();
    cy.get("#input-field").contains("What do you do in computer");

    // skips several asked topics
    cy.get("#input-send").click();
    cy.get("#input-field").type(
      "Were you ever bullied in high school? What did you do?"
    );
    cy.get("#input-send").click();
    cy.get("#topic-0").click();
    cy.get("#input-field").contains("What kind of student were you?");
  });
});
