/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  assertLocalStorageItemDoesNotExist,
  assertLocalStorageValue,
  confirmPageLoaded,
  DisplaySurveyPopupCondition,
  mockDefaultSetup,
  updateLocalStorageUserData,
} from "../support/helpers";
import {
  LS_EMAIL_KEY,
  LS_USER_ID_KEY,
  POST_SURVEY_TIME_KEY,
  TIMER_UPDATE_INTERVAL_MS,
  TIME_SPENT_ON_PAGE_KEY,
} from "../support/local-constants";

describe.skip("Survey Popup Timing Tracker", () => {
  it("Properly increments and shows survey popup", () => {
    mockDefaultSetup(cy, {
      config: {
        displayGuestPrompt: false,
        disclaimerDisabled: true,
        cmi5Enabled: false,
        postSurveyLink: "http://localhost",
        postSurveyTimer: (TIMER_UPDATE_INTERVAL_MS * 4) / 1000,
      },
    });
    cy.visit("/?userid=123");
    confirmPageLoaded(cy);
    assertLocalStorageValue(
      POST_SURVEY_TIME_KEY,
      "be.equal",
      String((TIMER_UPDATE_INTERVAL_MS / 1000) * 4)
    );
    assertLocalStorageValue(TIME_SPENT_ON_PAGE_KEY, "be.equal", "0");
    cy.wait(TIMER_UPDATE_INTERVAL_MS);
    assertLocalStorageValue(
      TIME_SPENT_ON_PAGE_KEY,
      "be.equal",
      String((TIMER_UPDATE_INTERVAL_MS * 1) / 1000)
    );
    cy.wait(TIMER_UPDATE_INTERVAL_MS);
    assertLocalStorageValue(
      TIME_SPENT_ON_PAGE_KEY,
      "be.equal",
      String((TIMER_UPDATE_INTERVAL_MS * 2) / 1000)
    );
    cy.wait(TIMER_UPDATE_INTERVAL_MS);
    assertLocalStorageValue(
      TIME_SPENT_ON_PAGE_KEY,
      "be.equal",
      String((TIMER_UPDATE_INTERVAL_MS * 3) / 1000)
    );
    cy.wait(TIMER_UPDATE_INTERVAL_MS);
    assertLocalStorageValue(
      TIME_SPENT_ON_PAGE_KEY,
      "be.equal",
      String((TIMER_UPDATE_INTERVAL_MS * 4) / 1000)
    );
    cy.get("[data-cy=survey-dialog]").should("exist");
  });

  it("Properly increments after revisiting page with same url", () => {
    mockDefaultSetup(cy, {
      config: {
        displayGuestPrompt: false,
        disclaimerDisabled: true,
        cmi5Enabled: false,
        postSurveyLink: "http://localhost",
        postSurveyTimer: (TIMER_UPDATE_INTERVAL_MS * 4) / 1000,
      },
    });
    cy.visit("/?userid=123");
    confirmPageLoaded(cy);
    assertLocalStorageValue(
      POST_SURVEY_TIME_KEY,
      "be.equal",
      String((TIMER_UPDATE_INTERVAL_MS / 1000) * 4)
    );
    assertLocalStorageValue(TIME_SPENT_ON_PAGE_KEY, "be.equal", "0");
    cy.wait(TIMER_UPDATE_INTERVAL_MS);
    assertLocalStorageValue(
      TIME_SPENT_ON_PAGE_KEY,
      "be.equal",
      String((TIMER_UPDATE_INTERVAL_MS * 1) / 1000)
    );
    cy.wait(TIMER_UPDATE_INTERVAL_MS);
    assertLocalStorageValue(
      TIME_SPENT_ON_PAGE_KEY,
      "be.equal",
      String((TIMER_UPDATE_INTERVAL_MS * 2) / 1000)
    );
    cy.visit("/?userid=123");
    confirmPageLoaded(cy);
    cy.wait(TIMER_UPDATE_INTERVAL_MS);
    assertLocalStorageValue(
      TIME_SPENT_ON_PAGE_KEY,
      "be.equal",
      String((TIMER_UPDATE_INTERVAL_MS * 3) / 1000)
    );
    cy.wait(TIMER_UPDATE_INTERVAL_MS);
    assertLocalStorageValue(
      TIME_SPENT_ON_PAGE_KEY,
      "be.equal",
      String((TIMER_UPDATE_INTERVAL_MS * 4) / 1000)
    );
    cy.get("[data-cy=survey-dialog]").should("exist");
  });

  it("Properly increments after revisiting page with empty url", () => {
    mockDefaultSetup(cy, {
      config: {
        displayGuestPrompt: false,
        disclaimerDisabled: true,
        cmi5Enabled: false,
        postSurveyLink: "http://localhost",
        postSurveyTimer: (TIMER_UPDATE_INTERVAL_MS * 4) / 1000,
      },
    });
    cy.visit("/?userid=123");
    confirmPageLoaded(cy);
    assertLocalStorageValue(
      POST_SURVEY_TIME_KEY,
      "be.equal",
      String((TIMER_UPDATE_INTERVAL_MS / 1000) * 4)
    );
    assertLocalStorageValue(TIME_SPENT_ON_PAGE_KEY, "be.equal", "0");
    cy.wait(TIMER_UPDATE_INTERVAL_MS);
    assertLocalStorageValue(
      TIME_SPENT_ON_PAGE_KEY,
      "be.equal",
      String((TIMER_UPDATE_INTERVAL_MS * 1) / 1000)
    );
    cy.wait(TIMER_UPDATE_INTERVAL_MS);
    assertLocalStorageValue(
      TIME_SPENT_ON_PAGE_KEY,
      "be.equal",
      String((TIMER_UPDATE_INTERVAL_MS * 2) / 1000)
    );
    cy.visit("/");
    confirmPageLoaded(cy);
    cy.wait(TIMER_UPDATE_INTERVAL_MS);
    assertLocalStorageValue(
      TIME_SPENT_ON_PAGE_KEY,
      "be.equal",
      String((TIMER_UPDATE_INTERVAL_MS * 3) / 1000)
    );
    cy.wait(TIMER_UPDATE_INTERVAL_MS);
    assertLocalStorageValue(
      TIME_SPENT_ON_PAGE_KEY,
      "be.equal",
      String((TIMER_UPDATE_INTERVAL_MS * 4) / 1000)
    );
    cy.get("[data-cy=survey-dialog]").should("exist");
  });

  it("resets and properly increments after visiting with new user identifier", () => {
    mockDefaultSetup(cy, {
      config: {
        displayGuestPrompt: false,
        disclaimerDisabled: true,
        cmi5Enabled: false,
        postSurveyLink: "http://localhost",
        postSurveyTimer: (TIMER_UPDATE_INTERVAL_MS * 4) / 1000,
      },
    });
    cy.visit("/?userid=123");
    confirmPageLoaded(cy);
    assertLocalStorageValue(
      POST_SURVEY_TIME_KEY,
      "be.equal",
      String((TIMER_UPDATE_INTERVAL_MS / 1000) * 4)
    );
    assertLocalStorageValue(TIME_SPENT_ON_PAGE_KEY, "be.equal", "0");
    cy.wait(TIMER_UPDATE_INTERVAL_MS);
    assertLocalStorageValue(
      TIME_SPENT_ON_PAGE_KEY,
      "be.equal",
      String((TIMER_UPDATE_INTERVAL_MS * 1) / 1000)
    );
    cy.wait(TIMER_UPDATE_INTERVAL_MS);
    assertLocalStorageValue(
      TIME_SPENT_ON_PAGE_KEY,
      "be.equal",
      String((TIMER_UPDATE_INTERVAL_MS * 2) / 1000)
    );
    cy.visit("/?userid=5678");
    confirmPageLoaded(cy);
    assertLocalStorageValue(TIME_SPENT_ON_PAGE_KEY, "be.equal", "0");
    cy.wait(TIMER_UPDATE_INTERVAL_MS);
    assertLocalStorageValue(
      TIME_SPENT_ON_PAGE_KEY,
      "be.equal",
      String((TIMER_UPDATE_INTERVAL_MS * 1) / 1000)
    );
    cy.wait(TIMER_UPDATE_INTERVAL_MS);
    assertLocalStorageValue(
      TIME_SPENT_ON_PAGE_KEY,
      "be.equal",
      String((TIMER_UPDATE_INTERVAL_MS * 2) / 1000)
    );
    cy.wait(TIMER_UPDATE_INTERVAL_MS);
    assertLocalStorageValue(
      TIME_SPENT_ON_PAGE_KEY,
      "be.equal",
      String((TIMER_UPDATE_INTERVAL_MS * 3) / 1000)
    );
    cy.wait(TIMER_UPDATE_INTERVAL_MS);
    assertLocalStorageValue(
      TIME_SPENT_ON_PAGE_KEY,
      "be.equal",
      String((TIMER_UPDATE_INTERVAL_MS * 4) / 1000)
    );
    cy.get("[data-cy=survey-dialog]").should("exist");
  });
});

describe("Survey Popup After Timer", () => {
  it("not visible if postSurveyLink not in config", () => {
    mockDefaultSetup(cy, {
      config: {
        displayGuestPrompt: false,
        disclaimerDisabled: true,
        cmi5Enabled: false,
        postSurveyTimer: 1,
        displaySurveyPopupCondition: DisplaySurveyPopupCondition.ALWAYS,
      },
    });
    cy.visit("/");
    confirmPageLoaded(cy);
    cy.wait(TIMER_UPDATE_INTERVAL_MS + 1000);
    cy.get("[data-cy=survey-dialog]").should("not.exist");
  });

  it("not visible if postSurveyTimer not in config", () => {
    mockDefaultSetup(cy, {
      config: {
        displayGuestPrompt: false,
        disclaimerDisabled: true,
        cmi5Enabled: false,
        postSurveyLink: "http://localhost",
        displaySurveyPopupCondition: DisplaySurveyPopupCondition.ALWAYS,
      },
    });
    cy.visit("/");
    confirmPageLoaded(cy);
    cy.wait(TIMER_UPDATE_INTERVAL_MS + 1000);
    cy.get("[data-cy=survey-dialog]").should("not.exist");
  });

  it("not visible if condition set to userId and no userId provided", () => {
    mockDefaultSetup(cy, {
      config: {
        displayGuestPrompt: false,
        disclaimerDisabled: true,
        cmi5Enabled: false,
        postSurveyLink: "http://localhost",
        postSurveyTimer: 1,
        displaySurveyPopupCondition: DisplaySurveyPopupCondition.USER_ID,
      },
    });
    cy.visit("/?userEmail=123@mentorpal.org");
    confirmPageLoaded(cy);
    cy.wait(TIMER_UPDATE_INTERVAL_MS + 1000);
    cy.get("[data-cy=survey-dialog]").should("not.exist");
  });

  it("visible if condition set to userId and userId provided", () => {
    mockDefaultSetup(cy, {
      config: {
        displayGuestPrompt: false,
        disclaimerDisabled: true,
        cmi5Enabled: false,
        postSurveyLink: "http://localhost",
        postSurveyTimer: 1,
        displaySurveyPopupCondition: DisplaySurveyPopupCondition.USER_ID,
      },
    });
    cy.visit("/?userid=123");
    confirmPageLoaded(cy);
    cy.wait(TIMER_UPDATE_INTERVAL_MS + 1000);
    cy.get("[data-cy=survey-dialog]").should("exist");
  });

  it("not visible if display set to userId and email and only userId provided", () => {
    mockDefaultSetup(cy, {
      config: {
        displayGuestPrompt: false,
        disclaimerDisabled: true,
        cmi5Enabled: false,
        postSurveyLink: "http://localhost",
        postSurveyTimer: 1,
        displaySurveyPopupCondition:
          DisplaySurveyPopupCondition.USER_ID_AND_EMAIL,
      },
    });
    cy.visit("/?userid=123");
    confirmPageLoaded(cy);
    cy.wait(TIMER_UPDATE_INTERVAL_MS + 1000);
    cy.get("[data-cy=survey-dialog]").should("not.exist");
  });

  it("not visible if display set to userId and email and only userEmail provided", () => {
    mockDefaultSetup(cy, {
      config: {
        displayGuestPrompt: false,
        disclaimerDisabled: true,
        cmi5Enabled: false,
        postSurveyLink: "http://localhost",
        postSurveyTimer: 1,
        displaySurveyPopupCondition: DisplaySurveyPopupCondition.USER_ID,
      },
    });
    cy.visit("/?userEmail=123@mentorpal.org");
    confirmPageLoaded(cy);
    cy.wait(TIMER_UPDATE_INTERVAL_MS + 1000);
    cy.get("[data-cy=survey-dialog]").should("not.exist");
  });

  it("visible if display set to userId and email and both are provided", () => {
    mockDefaultSetup(cy, {
      config: {
        displayGuestPrompt: false,
        disclaimerDisabled: true,
        cmi5Enabled: false,
        postSurveyLink: "http://localhost",
        postSurveyTimer: 1,
        displaySurveyPopupCondition: DisplaySurveyPopupCondition.USER_ID,
      },
    });
    cy.visit("/?userid=123&userEmail=123@mentorpal.org");
    confirmPageLoaded(cy);
    cy.wait(TIMER_UPDATE_INTERVAL_MS + 1000);
    cy.get("[data-cy=survey-dialog]").should("exist");
  });

  it("not visible if condition set to NEVER despite everything being provided", () => {
    mockDefaultSetup(cy, {
      config: {
        displayGuestPrompt: false,
        disclaimerDisabled: true,
        cmi5Enabled: false,
        postSurveyLink: "http://localhost",
        postSurveyTimer: 1,
        displaySurveyPopupCondition: DisplaySurveyPopupCondition.NEVER,
      },
    });
    cy.visit("/?userid=123&userEmail=123@mentorpal.org");
    confirmPageLoaded(cy);
    cy.wait(TIMER_UPDATE_INTERVAL_MS + 1000);
    cy.get("[data-cy=survey-dialog]").should("not.exist");
  });

  it("visible if postSurveyLink and postSurveyTimer in config, and qualtricsuserid in localstorage", () => {
    updateLocalStorageUserData(cy, { [LS_USER_ID_KEY]: "123" });

    mockDefaultSetup(cy, {
      config: {
        displayGuestPrompt: false,
        disclaimerDisabled: true,
        cmi5Enabled: false,
        postSurveyLink: "http://localhost",
        postSurveyTimer: 1,
      },
    });
    cy.visit("/");
    confirmPageLoaded(cy);
    cy.wait(TIMER_UPDATE_INTERVAL_MS + 1000);

    cy.get("[data-cy=survey-dialog]").should("exist");
  });

  it("pops up if postSurveyLink in config, and postsurveytime in url, and qualtricsuserid in localstorage", () => {
    updateLocalStorageUserData(cy, { [LS_USER_ID_KEY]: "123" });

    mockDefaultSetup(cy, {
      config: {
        displayGuestPrompt: false,
        disclaimerDisabled: true,
        cmi5Enabled: false,
        postSurveyLink: "http://localhost",
        postSurveyTimer: 1,
      },
    });
    cy.visit("/?postsurveytime=1");
    confirmPageLoaded(cy);
    cy.wait(TIMER_UPDATE_INTERVAL_MS + 1000);
    cy.get("[data-cy=survey-dialog]").should("exist");
  });

  it("does not pop up right away if local storage is setup correctly and time not passed", () => {
    mockDefaultSetup(cy, {
      config: {
        displayGuestPrompt: false,
        disclaimerDisabled: true,
        cmi5Enabled: false,
        postSurveyLink: "http://localhost",
        postSurveyTimer: 1,
      },
    });
    cy.visit("/?userid=123");
    confirmPageLoaded(cy);
    cy.get("[data-cy=survey-dialog]").should("not.exist");
  });
});

describe("URL PARAMS Survey Popup button in disclaimer", () => {
  describe("visible", () => {
    it("if config set to ALWAYS and no info provided", () => {
      mockDefaultSetup(cy, {
        config: {
          displayGuestPrompt: false,
          cmi5Enabled: false,
          postSurveyLink: "http://localhost",
          surveyButtonInDisclaimer: "ALWAYS",
        },
      });
      cy.visit("/");
      confirmPageLoaded(cy);

      cy.get("[data-cy=header-survey-popup-btn]").should("exist");
    });

    it("if config set to ALWAYS and only userid provided in url", () => {
      mockDefaultSetup(cy, {
        config: {
          displayGuestPrompt: false,
          cmi5Enabled: false,
          postSurveyLink: "http://localhost",
          surveyButtonInDisclaimer: "ALWAYS",
        },
      });
      cy.visit("/?userid=123");
      confirmPageLoaded(cy);

      cy.get("[data-cy=header-survey-popup-btn]").should("exist");
    });

    it("if config set to ALWAYS and only userEmail provided", () => {
      mockDefaultSetup(cy, {
        config: {
          displayGuestPrompt: false,
          cmi5Enabled: false,
          postSurveyLink: "http://localhost",
          surveyButtonInDisclaimer: "ALWAYS",
        },
      });
      cy.visit("/?userEmail=123@mentorpal.org");
      confirmPageLoaded(cy);

      cy.get("[data-cy=header-survey-popup-btn]").should("exist");
    });

    it("if config set to ALWAYS and both identifiers provided", () => {
      mockDefaultSetup(cy, {
        config: {
          displayGuestPrompt: false,
          cmi5Enabled: false,
          postSurveyLink: "http://localhost",
          surveyButtonInDisclaimer: "ALWAYS",
        },
      });
      cy.visit("/?userEmail=123@mentorpal.org&userid=123");
      confirmPageLoaded(cy);

      cy.get("[data-cy=header-survey-popup-btn]").should("exist");
    });

    it("config set to PROVIDED_USER_IDENTIFIER and user email provided", () => {
      mockDefaultSetup(cy, {
        config: {
          displayGuestPrompt: false,
          cmi5Enabled: false,
          postSurveyLink: "http://localhost",
          surveyButtonInDisclaimer: "PROVIDED_USER_IDENTIFIER",
        },
      });
      cy.visit("/?userEmail=123@mentorpal.org");
      confirmPageLoaded(cy);

      cy.get("[data-cy=header-survey-popup-btn]").should("exist");
    });

    it("config set to PROVIDED_USER_IDENTIFIER and userid provided", () => {
      mockDefaultSetup(cy, {
        config: {
          displayGuestPrompt: false,
          cmi5Enabled: false,
          postSurveyLink: "http://localhost",
          surveyButtonInDisclaimer: "PROVIDED_USER_IDENTIFIER",
        },
      });
      cy.visit("/?userid=123");
      confirmPageLoaded(cy);

      cy.get("[data-cy=header-survey-popup-btn]").should("exist");
    });

    it("config set to PROVIDED_USER_IDENTIFIER and both identifiers provided", () => {
      mockDefaultSetup(cy, {
        config: {
          displayGuestPrompt: false,
          cmi5Enabled: false,
          postSurveyLink: "http://localhost",
          surveyButtonInDisclaimer: "PROVIDED_USER_IDENTIFIER",
        },
      });
      cy.visit("/?userEmail=123@mentorpal.org&userid=123");
      confirmPageLoaded(cy);

      cy.get("[data-cy=header-survey-popup-btn]").should("exist");
    });
  });

  describe("not visible", () => {
    it("config set to ALWAYS but no surveylink provided", () => {
      mockDefaultSetup(cy, {
        config: {
          displayGuestPrompt: false,
          cmi5Enabled: false,
          postSurveyLink: "",
          surveyButtonInDisclaimer: "ALWAYS",
        },
      });
      cy.visit("/?userEmail=123@mentorpal.org&userid=123");
      confirmPageLoaded(cy);

      cy.get("[data-cy=header-survey-popup-btn]").should("not.exist");
    });

    it("config set to PROVIDED_USER_IDENTIFIER and no credentials provided", () => {
      mockDefaultSetup(cy, {
        config: {
          displayGuestPrompt: false,
          cmi5Enabled: false,
          postSurveyLink: "http://localhost",
          surveyButtonInDisclaimer: "PROVIDED_USER_IDENTIFIER",
        },
      });
      cy.visit("/");
      confirmPageLoaded(cy);

      cy.get("[data-cy=header-survey-popup-btn]").should("not.exist");
    });

    it("config set to OFF and no credentials provided", () => {
      mockDefaultSetup(cy, {
        config: {
          displayGuestPrompt: false,
          cmi5Enabled: false,
          postSurveyLink: "http://localhost",
          surveyButtonInDisclaimer: "OFF",
        },
      });
      cy.visit("/");
      confirmPageLoaded(cy);

      cy.get("[data-cy=header-survey-popup-btn]").should("not.exist");
    });

    it("config set to OFF and userid provided", () => {
      mockDefaultSetup(cy, {
        config: {
          displayGuestPrompt: false,
          cmi5Enabled: false,
          postSurveyLink: "http://localhost",
          surveyButtonInDisclaimer: "OFF",
        },
      });
      cy.visit("/?userid=123");
      confirmPageLoaded(cy);

      cy.get("[data-cy=header-survey-popup-btn]").should("not.exist");
    });

    it("config set to OFF and userEmail provided", () => {
      mockDefaultSetup(cy, {
        config: {
          displayGuestPrompt: false,
          cmi5Enabled: false,
          postSurveyLink: "http://localhost",
          surveyButtonInDisclaimer: "OFF",
        },
      });
      cy.visit("/?userEmail=123@mentorpal.org");
      confirmPageLoaded(cy);

      cy.get("[data-cy=header-survey-popup-btn]").should("not.exist");
    });

    it("config set to OFF and both identifiers provided", () => {
      mockDefaultSetup(cy, {
        config: {
          displayGuestPrompt: false,
          cmi5Enabled: false,
          postSurveyLink: "http://localhost",
          surveyButtonInDisclaimer: "OFF",
        },
      });
      cy.visit("/?userEmail=123@mentorpal.org&userid=5678");
      confirmPageLoaded(cy);

      cy.get("[data-cy=header-survey-popup-btn]").should("not.exist");
    });
  });
});

describe("LOCAL STORAGE Survey Popup button in disclaimer", () => {
  describe("visible", () => {
    it("if config set to ALWAYS and only userid provided", () => {
      updateLocalStorageUserData(cy, { [LS_USER_ID_KEY]: "123" });
      mockDefaultSetup(cy, {
        config: {
          displayGuestPrompt: false,
          cmi5Enabled: false,
          postSurveyLink: "http://localhost",
          surveyButtonInDisclaimer: "ALWAYS",
        },
      });
      cy.visit("/");
      confirmPageLoaded(cy);
      cy.get("[data-cy=header-survey-popup-btn]").should("exist");
    });

    it("if config set to ALWAYS and only userEmail provided", () => {
      updateLocalStorageUserData(cy, { [LS_EMAIL_KEY]: "123@mentorpal.org" });
      mockDefaultSetup(cy, {
        config: {
          displayGuestPrompt: false,
          cmi5Enabled: false,
          postSurveyLink: "http://localhost",
          surveyButtonInDisclaimer: "ALWAYS",
        },
      });
      cy.visit("/");
      confirmPageLoaded(cy);

      cy.get("[data-cy=header-survey-popup-btn]").should("exist");
    });

    it("if config set to ALWAYS and both identifiers provided", () => {
      updateLocalStorageUserData(cy, {
        [LS_EMAIL_KEY]: "123@mentorpal.org",
        [LS_USER_ID_KEY]: "123",
      });
      mockDefaultSetup(cy, {
        config: {
          displayGuestPrompt: false,
          cmi5Enabled: false,
          postSurveyLink: "http://localhost",
          surveyButtonInDisclaimer: "ALWAYS",
        },
      });
      cy.visit("/");
      confirmPageLoaded(cy);

      cy.get("[data-cy=header-survey-popup-btn]").should("exist");
    });

    it("config set to PROVIDED_USER_IDENTIFIER and user email provided", () => {
      updateLocalStorageUserData(cy, { [LS_EMAIL_KEY]: "123@mentorpal.org" });

      mockDefaultSetup(cy, {
        config: {
          displayGuestPrompt: false,
          cmi5Enabled: false,
          postSurveyLink: "http://localhost",
          surveyButtonInDisclaimer: "PROVIDED_USER_IDENTIFIER",
        },
      });
      cy.visit("/");
      confirmPageLoaded(cy);

      cy.get("[data-cy=header-survey-popup-btn]").should("exist");
    });

    it("config set to PROVIDED_USER_IDENTIFIER and userid provided", () => {
      updateLocalStorageUserData(cy, { [LS_USER_ID_KEY]: "123" });

      mockDefaultSetup(cy, {
        config: {
          displayGuestPrompt: false,
          cmi5Enabled: false,
          postSurveyLink: "http://localhost",
          surveyButtonInDisclaimer: "PROVIDED_USER_IDENTIFIER",
        },
      });
      cy.visit("/");
      confirmPageLoaded(cy);

      cy.get("[data-cy=header-survey-popup-btn]").should("exist");
    });

    it("config set to PROVIDED_USER_IDENTIFIER and both identifiers provided", () => {
      updateLocalStorageUserData(cy, {
        [LS_EMAIL_KEY]: "123@mentorpal.org",
        [LS_USER_ID_KEY]: "123",
      });

      mockDefaultSetup(cy, {
        config: {
          displayGuestPrompt: false,
          cmi5Enabled: false,
          postSurveyLink: "http://localhost",
          surveyButtonInDisclaimer: "PROVIDED_USER_IDENTIFIER",
        },
      });
      cy.visit("/");
      confirmPageLoaded(cy);

      cy.get("[data-cy=header-survey-popup-btn]").should("exist");
    });
  });

  describe("not visible", () => {
    it("config set to OFF and userid provided", () => {
      updateLocalStorageUserData(cy, { [LS_USER_ID_KEY]: "123" });

      mockDefaultSetup(cy, {
        config: {
          displayGuestPrompt: false,
          cmi5Enabled: false,
          postSurveyLink: "http://localhost",
          surveyButtonInDisclaimer: "OFF",
        },
      });
      cy.visit("/");
      confirmPageLoaded(cy);

      cy.get("[data-cy=header-survey-popup-btn]").should("not.exist");
    });

    it("config set to OFF and userEmail provided", () => {
      updateLocalStorageUserData(cy, { [LS_EMAIL_KEY]: "123@mentorpal.org" });

      mockDefaultSetup(cy, {
        config: {
          displayGuestPrompt: false,
          cmi5Enabled: false,
          postSurveyLink: "http://localhost",
          surveyButtonInDisclaimer: "OFF",
        },
      });
      cy.visit("/");
      confirmPageLoaded(cy);

      cy.get("[data-cy=header-survey-popup-btn]").should("not.exist");
    });

    it("config set to OFF and both identifiers provided", () => {
      updateLocalStorageUserData(cy, {
        [LS_EMAIL_KEY]: "123@mentorpal.org",
        [LS_USER_ID_KEY]: "123",
      });

      mockDefaultSetup(cy, {
        config: {
          displayGuestPrompt: false,
          cmi5Enabled: false,
          postSurveyLink: "http://localhost",
          surveyButtonInDisclaimer: "OFF",
        },
      });
      cy.visit("/");
      confirmPageLoaded(cy);

      cy.get("[data-cy=header-survey-popup-btn]").should("not.exist");
    });
  });
});

describe("userid value sent to survey", () => {
  it("if config set to ALWAYS and no info provided, uses random xapi email", () => {
    mockDefaultSetup(cy, {
      config: {
        displayGuestPrompt: false,
        cmi5Enabled: false,
        postSurveyLink: "http://localhost",
        surveyButtonInDisclaimer: "ALWAYS",
        postSurveyUserIdEnabled: true,
      },
    });
    cy.visit("/");
    confirmPageLoaded(cy);
    cy.get("[data-cy=header-survey-popup-btn]").should("exist");
    cy.get("[data-cy=header-disclimer-btn]").click();
    cy.get("[data-cy=header-survey-popup-btn]").click();
    cy.get("[data-cy=survey-link]")
      .should("have.attr", "href")
      .then((hrefValue) => {
        cy.wrap(hrefValue).should("contain", "userid=");
        cy.wrap(hrefValue).should("contain", "mentorpal.org");
      });
  });

  it("if only userid provided, uses userid", () => {
    mockDefaultSetup(cy, {
      config: {
        displayGuestPrompt: false,
        cmi5Enabled: false,
        postSurveyLink: "http://localhost",
        surveyButtonInDisclaimer: "ALWAYS",
        postSurveyUserIdEnabled: true,
      },
    });
    cy.visit("/?userid=123");
    confirmPageLoaded(cy);
    cy.get("[data-cy=header-survey-popup-btn]").should("exist");
    cy.get("[data-cy=header-disclimer-btn]").click();
    cy.get("[data-cy=header-survey-popup-btn]").click();
    cy.get("[data-cy=survey-link]")
      .should("have.attr", "href")
      .then((hrefValue) => {
        cy.wrap(hrefValue).should("contain", "userid=123");
      });
  });

  it("if both userid and userEmail provided, uses userid", () => {
    mockDefaultSetup(cy, {
      config: {
        displayGuestPrompt: false,
        cmi5Enabled: false,
        postSurveyLink: "http://localhost",
        surveyButtonInDisclaimer: "ALWAYS",
        postSurveyUserIdEnabled: true,
      },
    });
    cy.visit("/?userid=123&userEmail=test@mentorpal.org");
    confirmPageLoaded(cy);
    cy.get("[data-cy=header-survey-popup-btn]").should("exist");
    cy.get("[data-cy=header-disclimer-btn]").click();
    cy.get("[data-cy=header-survey-popup-btn]").click();
    cy.get("[data-cy=survey-link]")
      .should("have.attr", "href")
      .then((hrefValue) => {
        cy.wrap(hrefValue).should("contain", "userid=123");
      });
  });

  it("if postSurveyUserIdEnabled, does not user userid despite its existence", () => {
    mockDefaultSetup(cy, {
      config: {
        displayGuestPrompt: false,
        cmi5Enabled: false,
        postSurveyLink: "http://localhost",
        surveyButtonInDisclaimer: "ALWAYS",
        postSurveyUserIdEnabled: false,
      },
    });
    cy.visit("/?userid=123&userEmail=test@mentorpal.org");
    confirmPageLoaded(cy);
    cy.get("[data-cy=header-survey-popup-btn]").should("exist");
    cy.get("[data-cy=header-disclimer-btn]").click();
    cy.get("[data-cy=header-survey-popup-btn]").click();
    cy.get("[data-cy=survey-link]")
      .should("have.attr", "href")
      .then((hrefValue) => {
        cy.wrap(hrefValue).should("not.contain", "userid=123");
      });
  });
});

describe("closing survey popup", () => {
  it("does not clobber survey popup button in disclaimer", () => {
    mockDefaultSetup(cy, {
      config: {
        displayGuestPrompt: false,
        disclaimerDisabled: false,
        cmi5Enabled: false,
        postSurveyLink: "http://localhost",
        postSurveyTimer: TIMER_UPDATE_INTERVAL_MS / 1000,
      },
    });
    cy.visit("/?userid=123");
    confirmPageLoaded(cy);
    cy.get("[data-cy=header-survey-popup-btn]").should("exist");
    assertLocalStorageValue(
      POST_SURVEY_TIME_KEY,
      "be.equal",
      String(TIMER_UPDATE_INTERVAL_MS / 1000)
    );
    assertLocalStorageValue(TIME_SPENT_ON_PAGE_KEY, "be.equal", "0");
    cy.wait(TIMER_UPDATE_INTERVAL_MS);
    cy.get("[data-cy=survey-dialog]").should("exist");
    cy.get("[data-cy=close-survey-popup-btn]").click();
    cy.get("[data-cy=header-survey-popup-btn]").should("exist");
  });

  it("clears out timer-relevant local storage", () => {
    mockDefaultSetup(cy, {
      config: {
        displayGuestPrompt: false,
        disclaimerDisabled: false,
        cmi5Enabled: false,
        postSurveyLink: "http://localhost",
        postSurveyTimer: TIMER_UPDATE_INTERVAL_MS / 1000,
      },
    });
    cy.visit("/?userid=123");
    confirmPageLoaded(cy);
    cy.get("[data-cy=header-survey-popup-btn]").should("exist");
    assertLocalStorageValue(
      POST_SURVEY_TIME_KEY,
      "be.equal",
      String(TIMER_UPDATE_INTERVAL_MS / 1000)
    );
    assertLocalStorageValue(TIME_SPENT_ON_PAGE_KEY, "be.equal", "0");
    cy.wait(TIMER_UPDATE_INTERVAL_MS);
    cy.get("[data-cy=survey-dialog]").should("exist");
    cy.get("[data-cy=close-survey-popup-btn]").click();
    assertLocalStorageItemDoesNotExist(POST_SURVEY_TIME_KEY);
    assertLocalStorageItemDoesNotExist(TIME_SPENT_ON_PAGE_KEY);
  });
});

describe("opening and closing disclaimer survey popup", () => {
  // TODO: update this test once local storage testing is streamlined
  it.skip("does not clobber currently running timer", () => {
    mockDefaultSetup(cy, {
      config: {
        displayGuestPrompt: false,
        disclaimerDisabled: false,
        cmi5Enabled: false,
        postSurveyLink: "http://localhost",
        postSurveyTimer: (TIMER_UPDATE_INTERVAL_MS * 4) / 1000,
      },
    });
    cy.visit("/?userid=123");
    confirmPageLoaded(cy);
    cy.get("[data-cy=header-disclimer-btn]").click();
    cy.get("[data-cy=header-survey-popup-btn]").click();
    assertLocalStorageValue(
      POST_SURVEY_TIME_KEY,
      "be.equal",
      String((TIMER_UPDATE_INTERVAL_MS / 1000) * 4)
    );
    assertLocalStorageValue(TIME_SPENT_ON_PAGE_KEY, "be.equal", "0");
    cy.wait(TIMER_UPDATE_INTERVAL_MS);
    assertLocalStorageValue(
      TIME_SPENT_ON_PAGE_KEY,
      "be.equal",
      String((TIMER_UPDATE_INTERVAL_MS * 1) / 1000)
    );
    cy.get("[data-cy=close-survey-popup-btn]").click();
    cy.wait(TIMER_UPDATE_INTERVAL_MS);
    assertLocalStorageValue(
      TIME_SPENT_ON_PAGE_KEY,
      "be.equal",
      String((TIMER_UPDATE_INTERVAL_MS * 2) / 1000)
    );
    cy.wait(TIMER_UPDATE_INTERVAL_MS);
    assertLocalStorageValue(
      TIME_SPENT_ON_PAGE_KEY,
      "be.equal",
      String((TIMER_UPDATE_INTERVAL_MS * 3) / 1000)
    );
    cy.wait(TIMER_UPDATE_INTERVAL_MS);
    assertLocalStorageValue(
      TIME_SPENT_ON_PAGE_KEY,
      "be.equal",
      String((TIMER_UPDATE_INTERVAL_MS * 4) / 1000)
    );
    cy.get("[data-cy=survey-dialog]").should("exist");
  });
});
