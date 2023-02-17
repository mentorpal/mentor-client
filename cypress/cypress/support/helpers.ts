/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { v1 as uuidv1 } from "uuid";
import { LocalStorageUserData } from "./types";

interface StaticResponse {
  /**
   * Serve a fixture as the response body.
   */
  fixture?: string;
  /**
   * Serve a static string/JSON object as the response body.
   */
  body?: string | object | object[];
  /**
   * HTTP headers to accompany the response.
   * @default {}
   */
  headers?: { [key: string]: string };
  /**
   * The HTTP status code to send.
   * @default 200
   */
  statusCode?: number;
  /**
   * If 'forceNetworkError' is truthy, Cypress will destroy the browser connection
   * and send no response. Useful for simulating a server that is not reachable.
   * Must not be set in combination with other options.
   */
  forceNetworkError?: boolean;
  /**
   * Milliseconds to delay before the response is sent.
   */
  delayMs?: number;
  /**
   * Kilobits per second to send 'body'.
   */
  throttleKbps?: number;
}

interface MockGraphQLQuery {
  query: string;
  data: any | any[];
}

export function visitAsCustomWithDefaultSetup(cy, url = "/", customParams) {
  mockDefaultSetup(cy);
  cy.visit(url, {
    qs: addCustomParams({}, customParams.userId, customParams),
  });
}

interface CustomParams {
  userid?: string;
  userEmail?: string;
  referrer?: string;
}

export function addCustomParams(
  query = {},
  guestName,
  customParam: CustomParams
) {
  return {
    activityId: "https://fake.org/resources/fake-activity",
    actor: {
      objectType: "Agent",
      account: {
        homePage: `https://fake.org/homepage/?referrer=${customParam.referrer}`,
        name: customParam.userid,
      },
      name: customParam.userid || guestName,
      mbox: `mailto:${customParam.userEmail}`,
    },
    endpoint: "https://fake.org/lrs/xapi",
    fetch: `https://fake.org/lrs/xapi/?&username=${encodeURIComponent(
      customParam.userEmail
    )}&userid=${customParam.userid}`,
    registration: uuidv1(),
    ...(query || {}),
  };
}

export type SurveyButtonInDisclaimer =
  | "OFF"
  | "ALWAYS"
  | "PROVIDED_USER_IDENTIFIER";

export function cySetup(cy) {
  cy.server();
  cy.viewport(1280, 720);
}

function staticResponse(s: StaticResponse): StaticResponse {
  return {
    ...{
      headers: {
        "access-control-allow-origin": window.location.origin,
        "Access-Control-Allow-Credentials": "true",
      },
      ...s,
    },
  };
}

export function cyInterceptGraphQL(cy, mocks: MockGraphQLQuery[]): void {
  const queryCalls: any = {};
  for (const mock of mocks) {
    queryCalls[mock.query] = 0;
  }
  cy.intercept("**/graphql", (req) => {
    const { body, headers } = req;
    const queryBody = body.query.replace(/\s+/g, " ").replace("\n", "").trim();

    for (const mock of mocks) {
      if (
        queryBody.match(new RegExp(`^(mutation|query) ${mock.query}[{(\\s]`))
      ) {
        const data = Array.isArray(mock.data) ? mock.data : [mock.data];
        const val = data[Math.min(queryCalls[mock.query], data.length - 1)];
        let body = val;
        req.alias = mock.query;
        req.reply(
          staticResponse({
            body: {
              data: body,
              errors: null,
            },
          })
        );
        queryCalls[mock.query] = queryCalls[mock.query] + 1;
        break;
      }
    }
  });
}

export function cyMockGQL(query: string, data: any | any[]): MockGraphQLQuery {
  return {
    query,
    data,
  };
}

export interface Config {
  cmi5Enabled: boolean;
  cmi5Endpoint: string;
  cmi5Fetch: string;
  mentorsDefault: string[];
  classifierLambdaEndpoint: string;
  urlGraphql: string;
  urlVideo: string;
  styleHeaderLogo: string;
  styleHeaderLogoUrl: string;
  styleHeaderColor: string;
  styleHeaderTextColor: string;
  filterEmailMentorAddress: string;
  disclaimerTitle: string;
  disclaimerText: string;
  disclaimerDisabled: boolean;
  displayGuestPrompt: boolean;
  postSurveyLink: string;
  postSurveyTimer: number;
  minTopicQuestionSize: number;
  postSurveyUserIdEnabled: boolean;
  postSurveyReferrerEnabled: boolean;
  surveyButtonInDisclaimer: SurveyButtonInDisclaimer;
  guestPromptInputType: string;
  guestPromptTitle: string;
  guestPromptText: string;
}

export function addGuestParams(query = {}, guestName = "guest") {
  return {
    activityId: "https://fake.org/resources/fake-activity",
    actor: {
      name: guestName,
      account: {
        name: `id4-${guestName}`,
        homePage: "https://fake.org/lrs/users",
      },
    },
    endpoint: "https://fake.org/lrs/xapi",
    fetch: `https://fake.org.lrs/auth?user=${encodeURIComponent(guestName)}`,
    registration: uuidv1(),
    ...(query || {}),
  };
}

export function cyMockMentorData(data: any[]) {
  let mentorList = [];
  if (Array.isArray(data)) {
    data.forEach((mentor) => {
      mentorList.push({ mentorClientData: mentor });
    });
  } else {
    mentorList.push({ mentorClientData: data });
  }
  return cyMockGQL("FetchMentor", mentorList);
}

export function cyMockConfig(config: Partial<Config>) {
  return cyMockGQL("FetchConfig", {
    orgConfig: { ...CONFIG_DEFAULT, ...config },
  });
}

export function mockMentorVideos(cy) {
  cy.intercept("**/idle.mp4", { fixture: "3.mp4" });
  cy.intercept("**/*.mp4*", { fixture: "video_response.mp4" });
}

export function mockMentorVtt(cy) {
  cy.intercept("**/*.vtt", { fixture: "default.vtt" });
}

export function mockApiQuestions(cy, response?: string) {
  cy.intercept("**/questions/?mentor=*&query=*", {
    fixture: response || "response.json",
  });
  cy.intercept("**/questions/?mentor=clint&query=*", {
    fixture: response || "response.json",
    delay: 3000,
  }).as("clint-query");
  cy.intercept("**/questions/?mentor=carlos&query=*", {
    fixture: response || "response.json",
  }).as("carlos-query");
  cy.intercept("**/questions/?mentor=*&query=*&ping=**", {});
}

const disclaimerText = require("../fixtures/disclaimer_text.json");

export const CONFIG_DEFAULT: Config = {
  cmi5Enabled: false,
  cmi5Endpoint: "",
  cmi5Fetch: "",
  mentorsDefault: ["clint", "carlos", "julianne"],
  classifierLambdaEndpoint: "",
  urlGraphql: "/graphql",
  urlVideo: "/video",
  styleHeaderLogo: "",
  styleHeaderLogoUrl: "",
  styleHeaderColor: "",
  styleHeaderTextColor: "",
  filterEmailMentorAddress: "",
  disclaimerTitle: "",
  disclaimerText: disclaimerText.disclaimerText,
  disclaimerDisabled: true,
  displayGuestPrompt: true,
  postSurveyLink: "",
  postSurveyTimer: 0,
  minTopicQuestionSize: 0,
  surveyButtonInDisclaimer: "ALWAYS",
  postSurveyUserIdEnabled: true,
  postSurveyReferrerEnabled: true,
  guestPromptInputType: "Email",
  guestPromptTitle: "Welcome to CareerFair.ai",
  guestPromptText:
    "We make high-quality mentoring available to students for free, using virtual agents representing real-life STEM mentors.\n\nIf you are from the CSUF study or wish to receive information (no more than monthly) about CareerFair.ai, please put your email here:",
};

const clint = require("../fixtures/clint.json");
const carlos = require("../fixtures/carlos.json");
const julianne = require("../fixtures/julianne.json");
const tokenToData = require("../fixtures/tokenToData.json");

export function mockDefaultSetup(
  cy,
  args: {
    config?: Partial<Config>;
    mentorData?: any[];
    gqlQueries?: MockGraphQLQuery[];
    apiResponse?: string;
    noMockApi?: boolean;
  } = {}
) {
  const config = args.config || {};
  const mentorData = args.mentorData || [clint, carlos, julianne];
  const gqlQueries = args.gqlQueries || [];
  // const tokenData = args.tokenToData || tokenToData;
  mockMentorVideos(cy);
  if (!args.noMockApi) {
    mockApiQuestions(cy, args.apiResponse);
  }
  mockMentorVtt(cy);
  cyInterceptGraphQL(cy, [
    cyMockGQL("RefreshAccessToken", {
      refreshAccessToken: {
        accessToken: "",
        errorMessage: "",
        authenticated: true,
      },
    }),
    cyMockConfig(config),
    // cyMockTokenData(tokenData),
    cyMockMentorData(mentorData),
    ...gqlQueries,
  ]);
  cy.viewport("iphone-x");
}

export function visitAsGuestWithDefaultSetup(cy, url = "/") {
  mockDefaultSetup(cy);
  cy.visit(url, { qs: addGuestParams() });
}

export function assertLocalStorageValue(
  key: string,
  comparater: string,
  value: string
) {
  cy.window().then((win) => {
    const userData = win.localStorage.getItem(key);
    cy.wrap(userData).should(comparater, value);
  });
}

export function assertLocalStorageUserDataValue(
  key: string,
  comparater: string,
  value: string
) {
  cy.window().then((win) => {
    const userData = JSON.parse(win.localStorage.getItem("userData"));
    cy.wrap(userData[key]).should(comparater, value);
  });
}

export function assertLocalStorageItemDoesNotExist(key: string) {
  cy.window().then((win) => {
    const storedData = win.localStorage.getItem(key);
    cy.wrap(storedData).should("not.exist");
  });
}

export function confirmPageLoaded(cy) {
  cy.get("[data-cy=chat-thread]").should("be.visible");
}

export function updateLocalStorageUserData(
  cy,
  updatedObject: Partial<LocalStorageUserData>
) {
  const startingData: LocalStorageUserData = {
    givenUserEmail: "",
    givenUserId: "",
    referrer: "",
    events: [],
    xapiUserEmail: "",
  };

  cy.setLocalStorage(
    "userData",
    JSON.stringify({ ...startingData, ...updatedObject })
  );
}
