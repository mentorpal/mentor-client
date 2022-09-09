/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { LaunchParameters } from "@kycarr/cmi5";
import queryString from "query-string";
import { Agent } from "@gradiant/xapi-dsl";
import { Config, XapiResultCustom } from "types";
import { getRegistrationId } from "utils";

export interface CmiParams {
  activityId: string;
  actor: Agent;
  endpoint: string;
  fetch: string;
  registration: string;
}

export function addCmiUrl(
  url: string,
  cp: LaunchParameters,
  referrer: string,
  userEmail: string
): string {
  return `${url}${url.includes("?") ? "" : "?"}${
    url.endsWith("&") ? "" : "&"
  }activityId=${encodeURIComponent(cp.activityId)}&actor=${encodeURIComponent(
    JSON.stringify(cp.actor)
  )}&endpoint=${encodeURIComponent(cp.endpoint)}&fetch=${encodeURIComponent(
    cp.fetch
  )}&registration=${encodeURIComponent(
    cp.registration
  )}&referrer=${encodeURIComponent(referrer)}&userEmail=${encodeURIComponent(
    userEmail
  )}`;
}

export function getCmiParams(
  userID: string,
  userEmail: string,
  homePage: string,
  config: Config
): LaunchParameters {
  const urlRoot = `${window.location.protocol}//${window.location.host}`;
  const userId = userID;
  return {
    activityId: window.location.href,
    actor: {
      objectType: "Agent",
      account: {
        homePage: `${urlRoot}/${homePage}`,
        name: userID,
      },
      name: userID,
      mbox: `mailto:${userEmail}`,
    },
    endpoint: config.cmi5Endpoint,
    fetch: `${config.cmi5Fetch}${
      config.cmi5Fetch.includes("?") ? "" : "?"
    }&username=${encodeURIComponent(userEmail)}&userid=${userId}`,
    registration: getRegistrationId(),
  };
}

export function hasCmi(urlOrQueryString: string): boolean {
  const cutIx = urlOrQueryString.indexOf("?");
  const urlQs =
    cutIx !== -1 ? urlOrQueryString.substring(cutIx + 1) : urlOrQueryString;
  const params = queryString.parse(urlQs);
  return Boolean(
    params.endpoint &&
      params.fetch &&
      params.actor &&
      params.registration &&
      params.activityId
  );
}

export function getParams(urlOrQueryString: string): string | string[] {
  const cutIx = urlOrQueryString.indexOf("?");
  const urlQs =
    cutIx !== -1 ? urlOrQueryString.substring(cutIx + 1) : urlOrQueryString;
  const params = queryString.parse(urlQs);
  const userID =
    params.userID && !Array.isArray(params.userID) ? params.userID : "";

  return userID;
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
