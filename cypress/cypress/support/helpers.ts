/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { v1 as uuidv1 } from "uuid";

export const MODE_CHAT = "chat"
export const MODE_VIDEO = "video";
export type Mode = typeof MODE_CHAT | typeof MODE_VIDEO

export interface Config {
  cmi5Enabled: boolean;
  cmi5Endpoint: string;
  cmi5Fetch: string;
  mentorsDefault: string[];
  modeDefault: Mode;
  urlClassifier: string;
  urlGraphql: string;
  urlVideo: string;
  styleHeaderLogo: string;
  styleHeaderColor: string;
  styleHeaderTextColor: string;
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

export function mockMentorData(cy) {
  cy.intercept("**/mentors/clint/data", { fixture: "clint.json" });
  cy.intercept("**/mentors/dan/data", { fixture: "dan.json" });
  cy.intercept("**/mentors/carlos/data", { fixture: "carlos.json" });
  cy.intercept("**/mentors/julianne/data", { fixture: "julianne.json" });
  cy.intercept("**/mentors/jd_thomas/data", { fixture: "jd_thomas.json" });
  cy.intercept("**/mentors/mario-pais/data", { fixture: "mario-pais.json" });
  cy.intercept("**/mentors/dan-burns/data", { fixture: "dan-burns.json" });
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
  modeDefault: MODE_VIDEO,
  urlClassifier: "/classifier",
  urlGraphql: "/graphql",
  urlVideo: "/video",
  styleHeaderLogo: "",
  styleHeaderColor: "",
  styleHeaderTextColor: "",
};

export function mockConfig(cy, config: Partial<Config> = {}) {
  cy.intercept("**/config", { ...CONFIG_DEFAULT, ...config });
}

export function mockDefaultSetup(cy, config: Partial<Config> = {}) {
  mockConfig(cy, config);
  mockMentorData(cy);
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
