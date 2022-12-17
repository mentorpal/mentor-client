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

const FAKE_STYLE_HEADER_LOGO =
  "http://scribe.usc.edu/wp-content/uploads/2021/02/PrimShield_Word_SmUse_Gold-Wh_RGB-1.png";

describe("Header", () => {
  it("shows title for default mentor in panel", () => {
    visitAsGuestWithDefaultSetup(cy, "/");
    cy.get("[data-cy=header]").contains(
      "Clinton Anderson: Nuclear Electrician's Mate"
    );
  });

  it("changes title when selecting a mentor from panel", () => {
    visitAsGuestWithDefaultSetup(cy, "/");
    cy.get("[data-cy=header]").should("have.attr", "data-mentor", "clint");
    cy.get("[data-cy=header]").contains(
      "Clinton Anderson: Nuclear Electrician's Mate"
    );
    cy.get("[data-cy=video-thumbnail-carlos]").should(
      "have.attr",
      "data-ready",
      "true"
    );
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
    cy.get("[data-cy=header]").contains(
      "Julianne Nordhagen: Student Naval Aviator"
    );
  });

  it("shows title for a single mentor", () => {
    mockDefaultSetup(cy);
    cy.visit("/", {
      qs: addGuestParams({
        mentor: "clint",
      }),
    });
    cy.get("[data-cy=header]").contains(
      "Clinton Anderson: Nuclear Electrician's Mate"
    );
  });

  it("does not show legal disclaimer by default", () => {
    mockDefaultSetup(cy, {
      config: {
        cmi5Enabled: false,
        mentorsDefault: ["clint"],
      },
    });
    cy.visit("/");
    cy.get("[data-cy=alert-dialog-title]").should("not.exist");
    cy.get("[data-cy=alert-dialog-description]").should("not.exist");
    cy.get("[data-cy=info-button]").should("not.exist");
  });

  it("dismisses legal disclaimer on agree and shows on icon press", () => {
    mockDefaultSetup(cy, {
      config: {
        cmi5Enabled: false,
        mentorsDefault: ["clint"],
        disclaimerTitle: "Privacy Policy",
        disclaimerText: "Lorem ipsum dolor sit amet.",
        disclaimerDisabled: false,
      },
    });
    cy.visit("/");
    cy.get("[data-cy=header-disclimer-btn]").invoke("mouseover").click();
    cy.get("[data-cy=disclaimer-container]").should("exist");
    cy.get("[data-cy=disclaimer-title]").should("exist");
    cy.get("[data-cy=disclaimer-text]").should("exist");
    cy.get("[data-cy=accept-disclaimer]").click();
    cy.get("[data-cy=disclaimer-container]").should("not.be.visible");
    cy.get("[data-cy=header-disclimer-btn]").invoke("mouseover").click();
    cy.get("[data-cy=disclaimer-container]").should("exist");
    cy.get("[data-cy=disclaimer-title]").should("exist");
    cy.get("[data-cy=disclaimer-text]").should("exist");
  });

  it("shows alternate header with logo and if config.homeHeaderLogo is set", () => {
    mockDefaultSetup(cy, {
      config: {
        cmi5Enabled: false,
        mentorsDefault: ["clint"],
        homeHeaderLogo:
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

  it("shows alternate color header and text if config.homeHeaderColor and config.homeHeaderTextColor are set", () => {
    mockDefaultSetup(cy, {
      config: {
        cmi5Enabled: false,
        mentorsDefault: ["clint"],
        homeHeaderColor: "#990000",
        homeHeaderTextColor: "#FFFFFF",
      },
    });
    cy.visit("/");

    cy.get("[data-cy=header]")
      .within(($h) => {
        cy.get("p").should("have.css", "color", "rgb(255, 255, 255)");
      })
      .and("have.css", "background-color", "rgb(153, 0, 0)");
  });

  it("shows full branding on mobile if config.homeHeaderColor, config.homeHeaderTextColor, and config.homeHeaderLogo are set", () => {
    mockDefaultSetup(cy, {
      config: {
        cmi5Enabled: false,
        mentorsDefault: ["clint"],
        homeHeaderColor: "#990000",
        homeHeaderTextColor: "#FFFFFF",
        homeHeaderLogo: FAKE_STYLE_HEADER_LOGO,
      },
    });
    cy.intercept(FAKE_STYLE_HEADER_LOGO, { fixture: "uscheader2.png" });
    cy.visit("/");

    cy.get("[data-cy=header]")
      .within(($h) => {
        cy.get("img")
          .should("have.attr", "src")
          .and("eq", FAKE_STYLE_HEADER_LOGO);
      })
      .and("have.css", "background-color", "rgb(153, 0, 0)");
  });

  it("shows full branding on desktop if config.homeHeaderColor, config.homeHeaderTextColor, and config.homeHeaderLogo are set", () => {
    mockDefaultSetup(cy, {
      config: {
        cmi5Enabled: false,
        mentorsDefault: ["clint", "carlos"],
        homeHeaderColor: "#990000",
        homeHeaderTextColor: "#FFFFFF",
        homeHeaderLogo: FAKE_STYLE_HEADER_LOGO,
      },
    });
    cy.viewport(700, 500);
    cy.intercept(FAKE_STYLE_HEADER_LOGO, { fixture: "uscheader2.png" });
    cy.intercept("**/questions/?mentor=carlos&query=*", {
      fixture: "response_with_feedback.json",
    });
    cy.visit("/");

    cy.get("[data-cy=header]")
      .within(($h) => {
        cy.get("img")
          .should("have.attr", "src")
          .and("eq", FAKE_STYLE_HEADER_LOGO);
        cy.get("p").should("have.css", "color", "rgb(255, 255, 255)");
      })
      .and("have.css", "background-color", "rgb(153, 0, 0)");
  });

  it("Subject selected", () => {
    mockDefaultSetup(cy, {
      config: {
        cmi5Enabled: false,
        mentorsDefault: ["clint"],
        homeHeaderColor: "#990000",
        homeHeaderTextColor: "#FFFFFF",
        homeHeaderLogo: FAKE_STYLE_HEADER_LOGO,
      },
    });
    cy.viewport(700, 500);
    cy.intercept(FAKE_STYLE_HEADER_LOGO, { fixture: "uscheader2.png" });
    cy.intercept("**/questions/?mentor=clint&query=*", {
      fixture: "response_with_feedback.json",
    });
    cy.visit("/");
    cy.get("[data-cy=header]")
      .within(($h) => {
        cy.get("img")
          .should("have.attr", "src")
          .and("eq", FAKE_STYLE_HEADER_LOGO);
        cy.get("p").should("have.css", "color", "rgb(255, 255, 255)");
      })
      .and("have.css", "background-color", "rgb(153, 0, 0)");
  });
});
