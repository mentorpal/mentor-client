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
  toGuestUrl,
};
