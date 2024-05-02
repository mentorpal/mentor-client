/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { cyMockGQL, mockDefaultSetup } from "../support/helpers";

// Note: We are not going to mock the organization subdomain, but keep in mind
// that the organization subdomain is used to determine what organization the user
// is trying to visit.
describe("private organization UI", () => {
  it("does not show UI if can already view organization (public)", () => {
    mockDefaultSetup(cy);
    cy.visit("/");
    cy.get("[data-cy=history-chat]").should("exist");
    cy.get("[data-cy=get-access-code-modal]").should("not.exist");
  });

  it("shows UI if cannot view organization (private)", () => {
    mockDefaultSetup(cy, {
      gqlQueries: [
        cyMockGQL("OrgCheckPermission", {
          orgCheckPermission: {
            canView: false,
          },
        }),
      ],
    });
    cy.visit("/");
    cy.get("[data-cy=get-access-code-modal]").should("exist");
    cy.get("[data-cy=get-access-code-modal]").should(
      "contain.text",
      "Private Organization Mentor"
    );
  });

  it("uses accesscode from URL", () => {
    mockDefaultSetup(cy);
    cy.visit("/?accesscode=123");
    cy.get("[data-cy=get-access-code-modal]").should("not.exist");
    cy.get("[data-cy=history-chat]").should("exist");
    cy.get("@OrgCheckPermission.all").should((reqs) => {
      const firstRequest: any = reqs[0];
      const variables = firstRequest.request.body.variables;
      expect(variables).to.deep.equal({ orgAccessCode: "123" });
    });
  });

  it("uses accessCode from local storage", () => {
    cy.clearLocalStorage();
    cy.setLocalStorage("orgAccessCode", "123");
    mockDefaultSetup(cy);
    cy.visit("/");
    cy.get("[data-cy=get-access-code-modal]").should("not.exist");
    cy.get("[data-cy=history-chat]").should("exist");
    cy.get("@OrgCheckPermission.all").should((reqs) => {
      const firstRequest: any = reqs[0];
      const variables = firstRequest.request.body.variables;
      expect(variables).to.deep.equal({ orgAccessCode: "123" });
    });
  });

  it("accepts input and uses it as accessCode", () => {
    mockDefaultSetup(cy, {
      gqlQueries: [
        cyMockGQL("OrgCheckPermission", [
          {
            orgCheckPermission: {
              canView: false,
            },
          },
          {
            orgCheckPermission: {
              canView: true,
            },
          },
        ]),
      ],
    });
    cy.visit("/");
    cy.get("[data-cy=access-code-input]").type("123");
    cy.get("[data-cy=submit-access-code]").click();
    cy.get("@OrgCheckPermission.all").should((reqs) => {
      const secondRequest: any = reqs[1];
      const variables = secondRequest.request.body.variables;
      expect(variables).to.deep.equal({ orgAccessCode: "123" });
    });
  });

  it("UI closes after successful accessCode submission", () => {
    mockDefaultSetup(cy, {
      gqlQueries: [
        cyMockGQL("OrgCheckPermission", [
          {
            orgCheckPermission: {
              canView: false,
            },
          },
          {
            orgCheckPermission: {
              canView: true,
            },
          },
        ]),
      ],
    });
    cy.visit("/");
    cy.get("[data-cy=access-code-input]").type("123");
    cy.get("[data-cy=submit-access-code]").click();
    cy.get("[data-cy=get-access-code-modal]").should("not.exist");
    cy.get("[data-cy=history-chat]").should("exist");
  });

  it("UI does not close after unsuccessful accessCode submission", () => {
    mockDefaultSetup(cy, {
      gqlQueries: [
        cyMockGQL("OrgCheckPermission", [
          {
            orgCheckPermission: {
              canView: false,
            },
          },
          {
            orgCheckPermission: {
              canView: false,
            },
          },
        ]),
      ],
    });
    cy.visit("/");
    cy.get("[data-cy=access-code-input]").type("123");
    cy.get("[data-cy=submit-access-code]").click();
    cy.wait(2000);
    cy.get("[data-cy=get-access-code-modal]").should("exist");
  });
});
