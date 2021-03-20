/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  addGuestParams,
  mockDefaultSetup,
  visitAsGuestWithDefaultSetup,
} from "../support/helpers";

describe("Header", () => {
  it("shows title for default mentor in panel", () => {
    visitAsGuestWithDefaultSetup(cy, "/");
    cy.get("[data-cy=header]").contains("Clinton Anderson: Nuclear Electrician's Mate");
  });

  it("changes title when selecting a mentor from panel", () => {
    visitAsGuestWithDefaultSetup(cy, "/");
    cy.get("[data-cy=header]").should("have.attr", "data-mentor", "clint");
    cy.get("[data-cy=header]").contains("Clinton Anderson: Nuclear Electrician's Mate");
    cy.get("[data-cy=video-thumbnail-carlos]").should("have.attr", "data-ready", "true");
    cy.get("[data-cy=video-thumbnail-carlos]").trigger("mouseover").click();
    cy.get("[data-cy=header]").should("have.attr", "data-mentor", "carlos");
    cy.get("[data-cy=header]").contains("Carlos Rios: Marine Logistician");
    cy.get("[data-cy=video-thumbnail-julianne]").should(
      "have.attr",
      "data-ready",
      "true"
    );
    cy.get("[data-cy=video-thumbnail-julianne]").trigger("mouseover").click();
    cy.get("[data-cy=header]").should("have.attr", "data-mentor", "julianne");
    cy.get("[data-cy=header]").contains("Julianne Nordhagen: Student Naval Aviator");
  });

  it("shows title for a single mentor", () => {
    mockDefaultSetup(cy);
    cy.visit("/", {
      qs: addGuestParams({
        mentor: "clint",
      }),
    });
    cy.get("[data-cy=header]").contains("Clinton Anderson: Nuclear Electrician's Mate");
  });

  it("shows legal disclaimer", () => {
    mockDefaultSetup(cy, {
      config: {
        cmi5Enabled: false,
        mentorsDefault: ["clint"]
      }
    });
    cy.visit("/");
    cy.get("#alert-dialog-title")
      .contains("USC Privacy Policy");
      cy.get("#alert-dialog-description")
      .contains(`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
      felis ex, tempor eget velit id, fringilla interdum nisl. Aliquam
      erat volutpat. Duis eu suscipit dolor, quis varius ex. Proin
      tincidunt mollis dictum. Sed porta elit sapien, id ultrices tortor
      venenatis porttitor. Nam ut egestas magna. Nunc at neque a enim
      aliquet efficitur vitae in odio. Mauris sollicitudin pulvinar
      vestibulum. Nunc gravida tellus in diam maximus rutrum. Vivamus mi
      tellus, convallis at commodo nec, consequat non velit. Nulla id
      diam nibh. Mauris lectus enim, consectetur nec aliquam vitae,
      auctor non odio. Curabitur eleifend sagittis neque, id ornare odio
      mollis eget. Cras dictum enim nec eleifend fringilla. Ut in
      bibendum quam. Suspendisse ultricies, orci id blandit faucibus,
      neque ligula sodales mi, vitae tristique arcu erat volutpat
      libero.`);
  });

  it("shows alternate header with logo and if config.styleHeaderLogo is set", () => {
    mockDefaultSetup(cy, {
      config: {
        cmi5Enabled: false,
        mentorsDefault: ["clint"],
        styleHeaderLogo:
          "https://identity.usc.edu/files/2019/01/PrimShield-Word_SmallUse_CardOnTrans.png",
      },
    });
    cy.intercept(
      "https://identity.usc.edu/files/2019/01/PrimShield-Word_SmallUse_CardOnTrans.png",
      { fixture: "uscheader.png" }
    );
    cy.visit("/");
    cy.get("[data-cy=header] img")
      .should("have.attr", "src")
      .and(
        "eq",
        "https://identity.usc.edu/files/2019/01/PrimShield-Word_SmallUse_CardOnTrans.png"
      );
  });

  it("shows alternate color header and text if config.styleHeaderColor and config.styleHeaderTextColor are set", () => {
    mockDefaultSetup(cy, {
      config: {
        cmi5Enabled: false,
        mentorsDefault: ["clint"],
        styleHeaderColor: "#990000",
        styleHeaderTextColor: "#FFFFFF",
      }
    });
    cy.visit("/");
    cy.get("#header")
      .should("have.css", "background-color", "rgb(153, 0, 0)");//RGB of #990000
    cy.get("#header p")
      .should("have.css", "color", "rgb(255, 255, 255)");//RGB of #FFFFFF
  });

  it("shows full branding if config.styleHeaderColor, config.styleHeaderTextColor, and config.styleHeaderLogo are set", () => {
    mockDefaultSetup(cy, {
      config: {
        cmi5Enabled: false,
        mentorsDefault: ["clint"],
        styleHeaderColor: "#990000",
        styleHeaderTextColor: "#FFFFFF",
        styleHeaderLogo:
          "http://scribe.usc.edu/wp-content/uploads/2021/02/PrimShield_Word_SmUse_Gold-Wh_RGB-1.png",
      }
    });
    cy.intercept(
      "http://scribe.usc.edu/wp-content/uploads/2021/02/PrimShield_Word_SmUse_Gold-Wh_RGB-1.png",
      { fixture: "uscheader2.png" }
    );
    cy.visit("/");
    cy.get("#header img")
      .should("have.attr", "src")
      .and(
        "eq",
        "http://scribe.usc.edu/wp-content/uploads/2021/02/PrimShield_Word_SmUse_Gold-Wh_RGB-1.png"
      );
    cy.get("#header")
      .should("have.css", "background-color", "rgb(153, 0, 0)");//RGB of #990000
    cy.get("#header p")
      .should("have.css", "color", "rgb(255, 255, 255)");//RGB of #FFFFFF
  });
});
