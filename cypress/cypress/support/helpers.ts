/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { v1 as uuidv1 } from "uuid";

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

interface MockGraphQLQuery {
  query: string,
  data: any | any[],
  me: boolean
}

export function cyInterceptGraphQL(cy, mocks: MockGraphQLQuery[]): void {
  const queryCalls: any = {}
  for (const mock of mocks) {
    queryCalls[mock.query] = 0;
  }
  cy.intercept('**/graphql', (req) => {
    const { body } = req;
    const queryBody = body.query.replace(/\s+/g, " ").replace("\n", "").trim();
    for (const mock of mocks) {
      if (queryBody.indexOf(`{ ${mock.query}(`) !== -1 || queryBody.indexOf(`{ ${mock.query} {`) !== -1) {
        const data = Array.isArray(mock.data) ? mock.data : [mock.data];
        const val = data[Math.min(queryCalls[mock.query], data.length - 1)];
        const body = {};
        if (mock.me) {
          const _inner = {};
          _inner[mock.query] = val;
          body["me"] = _inner;
        } else {
          body[mock.query] = val;
        }
        req.alias = mock.query;
        req.reply(staticResponse({
          body: {
            data: body,
            errors: null,
          }
        }));
        queryCalls[mock.query] = queryCalls[mock.query] + 1;
        break;
      }
    }
  });
}

export function cyMockGQL(query: string, data: any | any[], me = false): MockGraphQLQuery {
  return {
    query,
    data,
    me,
  }
}


export interface Config {
  cmi5Enabled: boolean;
  cmi5Endpoint: string;
  cmi5Fetch: string;
  mentorsDefault: string[];
  urlClassifier: string;
  urlGraphql: string;
  urlVideo: string;
  styleHeaderLogo: string;
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

export function mockMentorData(cy, data: any[]) {
  cyInterceptGraphQL(cy, [
    cyMockGQL("mentor", data, false),
  ]);
}

export function mockMentorVideos(cy) {
  cy.intercept("**/*.mp4", { fixture: "clint_response.mp4" });
}

export function mockMentorVtt(cy) {
  cy.intercept("**/*.vtt", { fixture: "default.vtt" });
}

export function mockApiQuestions(cy) {
  cy.intercept("**/questions/?mentor=*&query=*", {
    fixture: "clint_response.json",
  });
}

export function toGuestUrl(url: string, guestName: string) {
  const cmiParam = {
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
  };
  const urlBase = `${url}${url.includes("?") ? "" : "?"}${
    url.includes("&") ? "&" : ""
  }`;
  return Object.getOwnPropertyNames(cmiParam).reduce((acc, cur) => {
    return `${acc}&${cur}=${encodeURIComponent(cmiParam[cur])}`;
  }, urlBase);
}

export const CONFIG_DEFAULT: Config = {
  cmi5Enabled: false,
  cmi5Endpoint: "",
  cmi5Fetch: "",
  mentorsDefault: ["clint", "dan", "carlos", "julianne"],
  urlClassifier: "/classifier",
  urlGraphql: "/graphql",
  urlVideo: "/video",
  styleHeaderLogo: "",
};

export function mockConfig(cy, config: Partial<Config> = {}) {
  cy.intercept("**/config", { ...CONFIG_DEFAULT, ...config });
}

const clint_video = require("../fixtures/clint-video.json");
export function mockDefaultSetup(cy, config: Partial<Config> = {}, mentorData: any[] = [clint_video]) {
  mockConfig(cy, config);
  mockMentorData(cy, mentorData);
  mockMentorVideos(cy);
  mockApiQuestions(cy);
  mockMentorVtt(cy);
  cy.viewport("iphone-x");
}

export function visitAsGuestWithDefaultSetup(cy, url = "/") {
  mockDefaultSetup(cy);
  cy.visit(url, { qs: addGuestParams() });
}

export const defaultRootGuestUrl = toGuestUrl("/", "guest");
