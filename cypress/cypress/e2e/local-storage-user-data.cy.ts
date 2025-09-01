/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  assertLocalStorageUserDataValue,
  confirmPageLoaded,
  mockDefaultSetup,
} from "../support/helpers";
import {
  LS_EMAIL_KEY,
  LS_USER_ID_KEY,
  LS_X_API_EMAIL_KEY,
} from "../support/local-constants";

describe("site previously visited with nothing in url params", () => {
  beforeEach(() => {
    mockDefaultSetup(cy);
    cy.visit("/");
    confirmPageLoaded(cy);
  });

  it("user arrives with no userid nor useremail, and closes email entry popup", () => {
    mockDefaultSetup(cy, {
      config: {
        displayGuestPrompt: true,
      },
    });
    cy.visit("/");
    cy.get("[data-cy=username-modal-container]").within(() => {
      cy.get("[data-cy=close-username-modal]").trigger("mouseover").click();
    });
    cy.get("[data-cy=username-modal-container]").should("not.exist");
    assertLocalStorageUserDataValue(LS_USER_ID_KEY, "be.equal", "");
    assertLocalStorageUserDataValue(
      LS_EMAIL_KEY,
      "be.equal",
      "guest@mentorpal.org"
    );
    assertLocalStorageUserDataValue(
      LS_X_API_EMAIL_KEY,
      "contain",
      "@mentorpal.org"
    );
  });

  it("user arrives with just sessionId, and closes email entry popup", () => {
    mockDefaultSetup(cy, {
      config: {
        displayGuestPrompt: true,
      },
    });
    cy.visit("/?sessionId=123");
    cy.get("[data-cy=username-modal-container]").within(() => {
      cy.get("[data-cy=close-username-modal]").trigger("mouseover").click();
    });
    cy.get("[data-cy=username-modal-container]").should("not.exist");
    assertLocalStorageUserDataValue(LS_USER_ID_KEY, "be.equal", "");
    assertLocalStorageUserDataValue(
      LS_EMAIL_KEY,
      "be.equal",
      "guest@mentorpal.org"
    );
    assertLocalStorageUserDataValue(
      LS_X_API_EMAIL_KEY,
      "be.equal",
      "123@mentorpal.org"
    );
  });

  it("user arrives with no userid nor useremail, and inputs email entry", () => {
    mockDefaultSetup(cy, {
      config: {
        displayGuestPrompt: true,
      },
    });
    cy.visit("/");
    cy.get("[data-cy=username-modal-container]").within(() => {
      cy.get("[data-cy=username-field]").type("email@email.com");
      cy.get("[data-cy=sumbit-email-btn]").trigger("mouseover").click();
    });
    assertLocalStorageUserDataValue(LS_USER_ID_KEY, "be.equal", "");
    assertLocalStorageUserDataValue(
      LS_EMAIL_KEY,
      "be.equal",
      "email@email.com"
    );
    assertLocalStorageUserDataValue(
      LS_X_API_EMAIL_KEY,
      "contain",
      "email@email.com"
    );
  });

  it("only userid in url param", () => {
    cy.visit("/?userid=1234");
    confirmPageLoaded(cy);
    assertLocalStorageUserDataValue(LS_USER_ID_KEY, "be.equal", "1234");
    assertLocalStorageUserDataValue(LS_EMAIL_KEY, "be.equal", "");
    assertLocalStorageUserDataValue(
      LS_X_API_EMAIL_KEY,
      "be.equal",
      "1234@mentorpal.org"
    );
  });

  it("only userEmail in url param", () => {
    cy.visit("/?userEmail=test@mentorpal.org");
    confirmPageLoaded(cy);
    assertLocalStorageUserDataValue(LS_USER_ID_KEY, "be.equal", "");
    assertLocalStorageUserDataValue(
      LS_EMAIL_KEY,
      "be.equal",
      "test@mentorpal.org"
    );
    assertLocalStorageUserDataValue(
      LS_X_API_EMAIL_KEY,
      "be.equal",
      "test@mentorpal.org"
    );
  });

  it("both userid and userEmail in url param", () => {
    cy.visit("/?userEmail=test@mentorpal.org&userid=1234");
    confirmPageLoaded(cy);
    assertLocalStorageUserDataValue(LS_USER_ID_KEY, "be.equal", "1234");
    assertLocalStorageUserDataValue(
      LS_EMAIL_KEY,
      "be.equal",
      "test@mentorpal.org"
    );
    assertLocalStorageUserDataValue(
      LS_X_API_EMAIL_KEY,
      "be.equal",
      "test@mentorpal.org"
    );
  });
});

describe("site previously visited with just userid in url params", () => {
  beforeEach(() => {
    mockDefaultSetup(cy);
    cy.visit("/?userid=1234");
    confirmPageLoaded(cy);
  });

  it("visited with no param urls", () => {
    cy.visit("/");
    assertLocalStorageUserDataValue(LS_USER_ID_KEY, "be.equal", "1234");
    assertLocalStorageUserDataValue(LS_EMAIL_KEY, "be.equal", "");
    assertLocalStorageUserDataValue(
      LS_X_API_EMAIL_KEY,
      "be.equal",
      "1234@mentorpal.org"
    );
  });

  it("SAME userid in url param", () => {
    cy.visit("/?userid=1234");
    confirmPageLoaded(cy);
    assertLocalStorageUserDataValue(LS_USER_ID_KEY, "be.equal", "1234");
    assertLocalStorageUserDataValue(LS_EMAIL_KEY, "be.equal", "");
    assertLocalStorageUserDataValue(
      LS_X_API_EMAIL_KEY,
      "be.equal",
      "1234@mentorpal.org"
    );
  });

  it("NEW userid in url param", () => {
    cy.visit("/?userid=5678");
    confirmPageLoaded(cy);
    assertLocalStorageUserDataValue(LS_USER_ID_KEY, "be.equal", "5678");
    assertLocalStorageUserDataValue(LS_EMAIL_KEY, "be.equal", "");
    assertLocalStorageUserDataValue(
      LS_X_API_EMAIL_KEY,
      "be.equal",
      "5678@mentorpal.org"
    );
  });

  it("userEmail in url param", () => {
    cy.visit("/?userEmail=test@mentorpal.org");
    confirmPageLoaded(cy);
    assertLocalStorageUserDataValue(LS_USER_ID_KEY, "be.equal", "");
    assertLocalStorageUserDataValue(
      LS_EMAIL_KEY,
      "be.equal",
      "test@mentorpal.org"
    );
    assertLocalStorageUserDataValue(
      LS_X_API_EMAIL_KEY,
      "be.equal",
      "test@mentorpal.org"
    );
  });

  it("userEmail equivalent to f(userid) in url param (gets inserted but no changes)", () => {
    cy.visit("/?userEmail=1234@mentorpal.org");
    confirmPageLoaded(cy);
    assertLocalStorageUserDataValue(LS_USER_ID_KEY, "be.equal", "1234");
    assertLocalStorageUserDataValue(
      LS_EMAIL_KEY,
      "be.equal",
      "1234@mentorpal.org"
    );
    assertLocalStorageUserDataValue(
      LS_X_API_EMAIL_KEY,
      "be.equal",
      "1234@mentorpal.org"
    );
  });

  it("NEW userid and userEmail in url param", () => {
    cy.visit("/?userEmail=test@mentorpal.org&userid=1234");
    confirmPageLoaded(cy);
    assertLocalStorageUserDataValue(LS_USER_ID_KEY, "be.equal", "1234");
    assertLocalStorageUserDataValue(
      LS_EMAIL_KEY,
      "be.equal",
      "test@mentorpal.org"
    );
    assertLocalStorageUserDataValue(
      LS_X_API_EMAIL_KEY,
      "be.equal",
      "test@mentorpal.org"
    );
  });
});

describe("site previously visited with just email in url params", () => {
  beforeEach(() => {
    mockDefaultSetup(cy);
    cy.visit("/?userEmail=test@mentorpal.org");
    confirmPageLoaded(cy);
  });

  it("visited with no param urls", () => {
    cy.visit("/");
    assertLocalStorageUserDataValue(LS_USER_ID_KEY, "be.equal", "");
    assertLocalStorageUserDataValue(
      LS_EMAIL_KEY,
      "be.equal",
      "test@mentorpal.org"
    );
    assertLocalStorageUserDataValue(
      LS_X_API_EMAIL_KEY,
      "be.equal",
      "test@mentorpal.org"
    );
  });

  it("userid in url param", () => {
    cy.visit("/?userid=5678");
    confirmPageLoaded(cy);
    assertLocalStorageUserDataValue(LS_USER_ID_KEY, "be.equal", "5678");
    assertLocalStorageUserDataValue(LS_EMAIL_KEY, "be.equal", "");
    assertLocalStorageUserDataValue(
      LS_X_API_EMAIL_KEY,
      "be.equal",
      "5678@mentorpal.org"
    );
  });

  it("NEW userEmail in url param", () => {
    cy.visit("/?userEmail=testnewemail@mentorpal.org");
    confirmPageLoaded(cy);
    assertLocalStorageUserDataValue(LS_USER_ID_KEY, "be.equal", "");
    assertLocalStorageUserDataValue(
      LS_EMAIL_KEY,
      "be.equal",
      "testnewemail@mentorpal.org"
    );
    assertLocalStorageUserDataValue(
      LS_X_API_EMAIL_KEY,
      "be.equal",
      "testnewemail@mentorpal.org"
    );
  });

  it("NEW userid and userEmail in url param", () => {
    cy.visit("/?userEmail=testnewemail@mentorpal.org&userid=1234");
    confirmPageLoaded(cy);
    assertLocalStorageUserDataValue(LS_USER_ID_KEY, "be.equal", "1234");
    assertLocalStorageUserDataValue(
      LS_EMAIL_KEY,
      "be.equal",
      "testnewemail@mentorpal.org"
    );
    assertLocalStorageUserDataValue(
      LS_X_API_EMAIL_KEY,
      "be.equal",
      "testnewemail@mentorpal.org"
    );
  });
});

describe("site first visited with both email and userid in url params", () => {
  beforeEach(() => {
    mockDefaultSetup(cy);
    cy.visit("/?userEmail=test@mentorpal.org&userid=1234");
    confirmPageLoaded(cy);
  });

  it("visited with no param urls", () => {
    cy.visit("/");
    assertLocalStorageUserDataValue(LS_USER_ID_KEY, "be.equal", "1234");
    assertLocalStorageUserDataValue(
      LS_EMAIL_KEY,
      "be.equal",
      "test@mentorpal.org"
    );
    assertLocalStorageUserDataValue(
      LS_X_API_EMAIL_KEY,
      "be.equal",
      "test@mentorpal.org"
    );
  });

  it("EQUIVALENT userid in url param", () => {
    cy.visit("/?userid=1234");
    confirmPageLoaded(cy);
    assertLocalStorageUserDataValue(LS_USER_ID_KEY, "be.equal", "1234");
    assertLocalStorageUserDataValue(
      LS_EMAIL_KEY,
      "be.equal",
      "test@mentorpal.org"
    );
    assertLocalStorageUserDataValue(
      LS_X_API_EMAIL_KEY,
      "be.equal",
      "test@mentorpal.org"
    );
  });

  it("EQUIVALENT userEmail in url param", () => {
    cy.visit("/?userEmail=test@mentorpal.org");
    confirmPageLoaded(cy);
    assertLocalStorageUserDataValue(LS_USER_ID_KEY, "be.equal", "1234");
    assertLocalStorageUserDataValue(
      LS_EMAIL_KEY,
      "be.equal",
      "test@mentorpal.org"
    );
    assertLocalStorageUserDataValue(
      LS_X_API_EMAIL_KEY,
      "be.equal",
      "test@mentorpal.org"
    );
  });

  it("NEW userid in url param", () => {
    cy.visit("/?userid=5678");
    confirmPageLoaded(cy);
    assertLocalStorageUserDataValue(LS_USER_ID_KEY, "be.equal", "5678");
    assertLocalStorageUserDataValue(LS_EMAIL_KEY, "be.equal", "");
    assertLocalStorageUserDataValue(
      LS_X_API_EMAIL_KEY,
      "be.equal",
      "5678@mentorpal.org"
    );
  });

  it("NEW userEmail in url param", () => {
    cy.visit("/?userEmail=testnewemail@mentorpal.org");
    confirmPageLoaded(cy);
    assertLocalStorageUserDataValue(LS_USER_ID_KEY, "be.equal", "");
    assertLocalStorageUserDataValue(
      LS_EMAIL_KEY,
      "be.equal",
      "testnewemail@mentorpal.org"
    );
    assertLocalStorageUserDataValue(
      LS_X_API_EMAIL_KEY,
      "be.equal",
      "testnewemail@mentorpal.org"
    );
  });

  it("NEW userid and NEW userEmail in url param", () => {
    cy.visit("/?userEmail=testnewemail@mentorpal.org&userid=5678");
    confirmPageLoaded(cy);
    assertLocalStorageUserDataValue(LS_USER_ID_KEY, "be.equal", "5678");
    assertLocalStorageUserDataValue(
      LS_EMAIL_KEY,
      "be.equal",
      "testnewemail@mentorpal.org"
    );
    assertLocalStorageUserDataValue(
      LS_X_API_EMAIL_KEY,
      "be.equal",
      "testnewemail@mentorpal.org"
    );
  });
});
