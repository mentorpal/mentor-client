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

  it("shows legal disclaimer if disclaimerDisabled is false", () => {
    mockDefaultSetup(cy, {
      config: {
        cmi5Enabled: false,
        mentorsDefault: ["clint"],
        disclaimerTitle: "Privacy Policy",
        disclaimerText:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Imperdiet sed euismod nisi porta lorem mollis aliquam. Eget dolor morbi non arcu risus quis varius quam. Purus sit amet volutpat consequat mauris. Porttitor eget dolor morbi non arcu risus quis varius quam. Integer quis auctor elit sed vulputate mi. Dictumst vestibulum rhoncus est pellentesque. Sed adipiscing diam donec adipiscing tristique risus nec feugiat in. Viverra suspendisse potenti nullam ac tortor vitae purus faucibus ornare. Enim blandit volutpat maecenas volutpat blandit aliquam etiam erat. Consectetur libero id faucibus nisl tincidunt. Dis parturient montes nascetur ridiculus mus mauris. Pharetra et ultrices neque ornare aenean euismod. Aliquam etiam erat velit scelerisque in dictum. Odio morbi quis commodo odio aenean sed adipiscing diam. Nunc sed velit dignissim sodales ut eu sem integer. Scelerisque eu ultrices vitae auctor eu. Sagittis id consectetur purus ut faucibus pulvinar elementum integer enim.",
        disclaimerDisabled: false,
      },
    });
    cy.visit("/");
    cy.get("[data-cy=alert-dialog-title]").contains("Privacy Policy");
    cy.get("[data-cy=alert-dialog-description]").contains(
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Imperdiet sed euismod nisi porta lorem mollis aliquam. Eget dolor morbi non arcu risus quis varius quam. Purus sit amet volutpat consequat mauris. Porttitor eget dolor morbi non arcu risus quis varius quam. Integer quis auctor elit sed vulputate mi. Dictumst vestibulum rhoncus est pellentesque. Sed adipiscing diam donec adipiscing tristique risus nec feugiat in. Viverra suspendisse potenti nullam ac tortor vitae purus faucibus ornare. Enim blandit volutpat maecenas volutpat blandit aliquam etiam erat. Consectetur libero id faucibus nisl tincidunt. Dis parturient montes nascetur ridiculus mus mauris. Pharetra et ultrices neque ornare aenean euismod. Aliquam etiam erat velit scelerisque in dictum. Odio morbi quis commodo odio aenean sed adipiscing diam. Nunc sed velit dignissim sodales ut eu sem integer. Scelerisque eu ultrices vitae auctor eu. Sagittis id consectetur purus ut faucibus pulvinar elementum integer enim."
    );
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
    cy.get("[data-cy=alert-dialog-title]").should("exist");
    cy.get("[data-cy=alert-dialog-description]").should("exist");
    cy.get("[data-cy=agree-button]").click();
    cy.get("[data-cy=alert-dialog-title]").should("not.exist");
    cy.get("[data-cy=alert-dialog-description]").should("not.exist");
    cy.get("[data-cy=info-button]").click();
    cy.get("[data-cy=alert-dialog-title]").should("exist");
    cy.get("[data-cy=alert-dialog-description]").should("exist");
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
      },
    });
    cy.visit("/");
    cy.get("[data-cy=header]").should(
      "have.css",
      "background-color",
      "rgb(153, 0, 0)"
    ); //RGB of #990000
    cy.get("[data-cy=header] p").should(
      "have.css",
      "color",
      "rgb(255, 255, 255)"
    ); //RGB of #FFFFFF
  });

  it("shows full branding on mobile if config.styleHeaderColor, config.styleHeaderTextColor, and config.styleHeaderLogo are set", () => {
    mockDefaultSetup(cy, {
      config: {
        cmi5Enabled: false,
        mentorsDefault: ["clint"],
        styleHeaderColor: "#990000",
        styleHeaderTextColor: "#FFFFFF",
        styleHeaderLogo:
          "http://scribe.usc.edu/wp-content/uploads/2021/02/PrimShield_Word_SmUse_Gold-Wh_RGB-1.png",
      },
    });
    cy.intercept(
      "http://scribe.usc.edu/wp-content/uploads/2021/02/PrimShield_Word_SmUse_Gold-Wh_RGB-1.png",
      { fixture: "uscheader2.png" }
    );
    cy.visit("/");
    cy.get("[data-cy=header] img")
      .should("have.attr", "src")
      .and(
        "eq",
        "http://scribe.usc.edu/wp-content/uploads/2021/02/PrimShield_Word_SmUse_Gold-Wh_RGB-1.png"
      );
    cy.get("[data-cy=header]").should(
      "have.css",
      "background-color",
      "rgb(153, 0, 0)"
    ); //RGB of #990000
  });

  it.only("shows full branding on desktop if config.styleHeaderColor, config.styleHeaderTextColor, and config.styleHeaderLogo are set", () => {
    mockDefaultSetup(cy, {
      config: {
        cmi5Enabled: false,
        mentorsDefault: ["clint"],
        styleHeaderColor: "#990000",
        styleHeaderTextColor: "#FFFFFF",
        styleHeaderLogo:
          "http://scribe.usc.edu/wp-content/uploads/2021/02/PrimShield_Word_SmUse_Gold-Wh_RGB-1.png",
      },
    });
    cy.viewport(1200, 700);
    cy.intercept(
      "http://scribe.usc.edu/wp-content/uploads/2021/02/PrimShield_Word_SmUse_Gold-Wh_RGB-1.png",
      { fixture: "uscheader2.png" }
    );
    cy.visit("/");
    cy.get("[data-cy=header] img")
      .should("have.attr", "src")
      .and(
        "eq",
        "http://scribe.usc.edu/wp-content/uploads/2021/02/PrimShield_Word_SmUse_Gold-Wh_RGB-1.png"
      );
    cy.get("[data-cy=header]").should(
      "have.css",
      "background-color",
      "rgb(153, 0, 0)"
    ); //RGB of #990000
    cy.get("[data-cy=header] p").should(
      "have.css",
      "color",
      "rgb(255, 255, 255)"
    ); //RGB of #FFFFFF
  });
});
