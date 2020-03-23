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
  defaultRootGuestUrl: toGuestUrl("/", "guest"),
  toGuestUrl,
  addGuestParams,
};
