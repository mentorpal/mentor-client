/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import queryString from "query-string";
import { Agent } from "@gradiant/xapi-dsl";
import Cmi5, { LaunchParameters } from "@kycarr/cmi5";
import { Statement } from "@xapi/xapi";

import { Config, XapiResultCustom } from "types";
import {
  getLocalStorage,
  getLocalStorageUserData,
  getRegistrationId,
} from "utils";
import { LS_USER_ID_KEY } from "local-constants";
import {
  POST_SURVEY_TIME_KEY,
  TIME_SPENT_ON_PAGE_KEY,
} from "components/survey-dialog";

export interface CmiParams {
  activityId: string;
  actor: Agent;
  endpoint: string;
  fetch: string;
  registration: string;
}

export function getCmiParams(
  userID: string,
  userEmail: string,
  homePage: string,
  config: Config
): LaunchParameters {
  const urlRoot = `${window.location.protocol}//${window.location.host}`;
  const userId = userID;
  const lp = getCmiParamsFromUri();
  return {
    activityId: lp?.activityId || window.location.href,
    actor: lp?.actor || {
      objectType: "Agent",
      account: {
        homePage: `${urlRoot}/${homePage}`,
        name: userID,
      },
      name: userID,
      mbox: `mailto:${userEmail}`,
    },
    endpoint: lp?.endpoint || config.cmi5Endpoint,
    fetch:
      lp?.fetch ||
      `${config.cmi5Fetch}${
        config.cmi5Fetch.includes("?") ? "" : "?"
      }&username=${encodeURIComponent(userEmail)}&userid=${userId}`,
    registration: lp?.registration || getRegistrationId(),
  };
}

export function getCmiParamsFromUri(): LaunchParameters | undefined {
  const params = queryString.parse(window.location.search);
  const { activityId, actor, endpoint, fetch, registration } = params;
  if (!activityId || !actor || !endpoint || !fetch || !registration) {
    return undefined;
  }
  if (
    Array.isArray(activityId) ||
    Array.isArray(actor) ||
    Array.isArray(endpoint) ||
    Array.isArray(fetch) ||
    Array.isArray(registration)
  ) {
    return undefined;
  }
  return {
    activityId: activityId,
    actor: JSON.parse(actor),
    endpoint: endpoint,
    fetch: fetch,
    registration: registration,
  };
}

export function toXapiResultExtCustom(
  verb: string,
  userid: string,
  userEmail: string,
  referrer: string,
  postSurveyTime: string,
  timeSpentOnPage: string,
  qualtricsUserId: string
): XapiResultCustom {
  return {
    verb,
    userid,
    userEmail,
    referrer,
    postSurveyTime,
    timeSpentOnPage,
    qualtricsUserId,
  };
}

function stripNonAsciiCharacters(input: string): string {
  const regex = new RegExp("[^\x00-\x7F]+");
  return input.replace(regex, "");
}

export function customInitCmi5Statement(
  chatSessionId: string,
  sessionIdInState: string
): void {
  const data = getLocalStorageUserData();
  const xapiUserData = {
    verb: "terminated",
    userid: data.givenUserId,
    userEmail: data.xapiUserEmail,
    referrer: data.referrer,
    postSurveyTime: getLocalStorage(POST_SURVEY_TIME_KEY),
    timeSpentOnPage: getLocalStorage(TIME_SPENT_ON_PAGE_KEY),
    qualtricsUserId: getLocalStorage(LS_USER_ID_KEY),
  };
  sendCmi5Statement(
    {
      verb: {
        id: `https://mentorpal.org/xapi/verb/initialized`,
        display: {
          "en-US": "initialized",
        },
      },
      result: {
        extensions: {
          "https://mentorpal.org/xapi/verb/initialized": toXapiResultExtCustom(
            xapiUserData.verb,
            xapiUserData.userid,
            xapiUserData.userEmail,
            xapiUserData.referrer,
            xapiUserData.postSurveyTime,
            xapiUserData.timeSpentOnPage,
            xapiUserData.qualtricsUserId
          ),
        },
      },
      object: {
        id: `${window.location.protocol}//${window.location.host}`,
        objectType: "Activity",
      },
    },
    chatSessionId,
    sessionIdInState
  );
}

export async function initCmi5(
  userID: string,
  userEmail: string,
  homePage: string,
  config: Config,
  sessionIdInState: string,
  chatSessionId: string
): Promise<void> {
  if (!userID && !userEmail) {
    console.error("No user id or user email passed in");
    return;
  }
  const launchParams = getCmiParams(userID, userEmail, homePage, config);
  try {
    cmi5_instance = new Cmi5(launchParams);
    await cmi5_instance.initialize();
    customInitCmi5Statement(chatSessionId, sessionIdInState);
  } catch (err) {
    console.error(
      err,
      `Failed to init cmi5 with params ${launchParams}, cleaning email of non-ascii domain if none exists`
    );
    if (launchParams.actor.mbox) {
      launchParams.actor.mbox = stripNonAsciiCharacters(
        launchParams.actor.mbox
      );
      // Append email domain if one does not exist
      if (!launchParams.actor.mbox.includes("@")) {
        launchParams.actor.mbox += "@mentorpal.org";
      }
    }
    try {
      cmi5_instance = new Cmi5(launchParams);
      await cmi5_instance.initialize();
      customInitCmi5Statement(chatSessionId, sessionIdInState);
    } catch (err) {
      console.error(
        err,
        `Failed to init cmi5 with cleaned mbox ${launchParams.actor.mbox}, going with default`
      );
      if (launchParams.actor.mbox) {
        launchParams.actor.mbox = `${userID}.guest@mentorpal.org`;
      }
      try {
        cmi5_instance = new Cmi5(launchParams);
        await cmi5_instance.initialize();
        customInitCmi5Statement(chatSessionId, sessionIdInState);
      } catch (err) {
        console.error(err);
      }
    }
  }
}

export function sendCmi5Statement(
  statement: Partial<Statement>,
  chatSessionId: string,
  sessionId: string
): void {
  if (!cmi5_instance) {
    console.error("cannot send cmi5 statement because it is not available");
    return;
  }
  try {
    const statementData: Partial<Statement> = {
      ...statement,
      context: {
        ...statement.context,
        registration: getRegistrationId(),
        extensions: {
          ...statement.context?.extensions,
          chatSessionId,
          sessionId,
        },
      },
    };
    cmi5_instance
      .sendCmi5AllowedStatement(statementData)
      .catch((err: Error) => console.error(`failed to send statement ${err}`));
  } catch (err2) {
    console.error(`failed to send statement ${err2}`);
  }
}

export let cmi5_instance: Cmi5 | undefined = undefined;
