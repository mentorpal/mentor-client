/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { v1 as uuidv1 } from "uuid";

function addGuestParams(query = {}, guestName = "guest") {
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

function mockMentorData(cy) {
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
  cy.route({
    method: "GET",
    url: "**/mentor-api/mentors/jd_thomas/data",
    response: "fixture:jd_thomas.json",
  });
  cy.route({
    method: "GET",
    url: "**/mentor-api/mentors/mario-pais/data",
    response: "fixture:mario-pais.json",
  });
  cy.route({
    method: "GET",
    url: "**/mentor-api/mentors/dan-burns/data",
    response: "fixture:dan-burns.json",
  });
}

function mockMentorVideos(cy) {
  cy.route({
    method: "GET",
    url: "https://video.mentorpal.org/**/*.mp4",
    // use clint's video for all responses,
    // not checking anything about the actual video content
    response: "fixture:clint_response.mp4",
  });
}

function mockMentorVtt(cy) {
  cy.route({
    method: "GET",
    url: "**/*.vtt",
    response: "fixture:default.vtt",
  });
}

function toGuestUrl(url, guestName) {
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

module.exports = {
  addGuestParams,
  defaultRootGuestUrl: toGuestUrl("/", "guest"),
  mockMentorData,
  mockMentorVideos,
  mockMentorVtt,
  toGuestUrl,
};
