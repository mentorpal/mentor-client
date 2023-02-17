/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { MentorState, MentorQuestionStatus, TopicQuestions } from "types";
import queryString from "query-string";
import { v4 as uuid } from "uuid";
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import {
  EVENTS_KEY,
  LS_EMAIL_KEY,
  LS_USER_ID_KEY,
  LS_X_API_EMAIL_KEY,
  QUALTRICS_USER_ID_URL_PARAM_KEY,
  REFERRER_KEY,
  REGISTRATION_ID_KEY,
  TIME_SPENT_ON_PAGE_KEY,
} from "local-constants";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const _ = require("lodash");

export function normalizeString(s: string): string {
  return s.replace(/\W+/g, "").normalize().toLowerCase();
}

export function chromeVersion(): number {
  // eslint-disable-next-line no-undef
  if (typeof navigator === `undefined`) {
    return 0;
  }
  // eslint-disable-next-line no-undef
  const raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
  return raw ? parseInt(raw[2], 10) : 0;
}

export const isUrl = (string: string): boolean => {
  return string.startsWith("http:") || string.startsWith("https:");
};

export const getUserIdFromURL = (): string => {
  const fetch = new URL(location.href).searchParams.get("fetch");
  const userIfFetch =
    fetch && isUrl(fetch)
      ? new URL(fetch).searchParams.get(QUALTRICS_USER_ID_URL_PARAM_KEY)
      : "";
  const userIdfromURL = new URL(location.href).searchParams.get(
    QUALTRICS_USER_ID_URL_PARAM_KEY
  );
  return userIdfromURL || userIfFetch || "";
};

export const validatedEmail = (email: string | null): string => {
  if (!email) {
    return "";
  }
  const re = /\S+@\S+\.\S+/;
  if (re.test(email)) {
    return email;
  }
  return generateFromWrongEmail(email);
};

const generateFromWrongEmail = (wrongEmail: string): string => {
  return `${cleanWrongEmail(wrongEmail)}@mentorpal.org`;
};

export const cleanWrongEmail = (email: string | null): string => {
  if (!email) {
    return "";
  }
  return email.replace("@", "-").replace(".", "-").replace("_", "-");
};

export function isMentorReady(m: MentorState): boolean {
  return (
    m.status === MentorQuestionStatus.READY ||
    m.status === MentorQuestionStatus.ANSWERED
  );
}

export function setLocalStorage(key: string, value: string): void {
  if (typeof window == "undefined") {
    return;
  }
  localStorage.setItem(key, value);
}

export function getLocalStorage(key: string): string {
  if (typeof window == "undefined") {
    return "";
  }
  return localStorage.getItem(key) || "";
}

export function removeLocalStorageItem(key: string): void {
  if (typeof window == "undefined") {
    return;
  }
  localStorage.removeItem(key);
}

export function getRegistrationId(): string {
  const registrationIdFromUrl = new URL(location.href).searchParams.get(
    REGISTRATION_ID_KEY
  );
  if (!registrationIdFromUrl) {
    const registrationIdFromStorage = getLocalStorage(REGISTRATION_ID_KEY);
    if (!registrationIdFromStorage) {
      const registrationId = uuid();
      setLocalStorage(REGISTRATION_ID_KEY, registrationId);
      return registrationId;
    }
    return registrationIdFromStorage;
  }
  return registrationIdFromUrl;
}

export function printLocalStorage(): void {
  if (typeof window == "undefined") {
    return;
  }
  console.info("local storage");
  for (let i = 0; i < localStorage.length; i++) {
    console.info(
      localStorage.key(i) +
        "=[" +
        localStorage.getItem(localStorage.key(i) || "") +
        "]"
    );
  }
}

export function loadSentry(): void {
  Sentry.init({
    dsn: "https://75accb4ecbef4766ae3bf62ecfb56658@o1081855.ingest.sentry.io/6439056",
    integrations: [new BrowserTracing()],
    tracesSampleRate: process.env.GATSBY_STAGE == "cf" ? 0.2 : 0.0,
    environment: process.env.GATSBY_STAGE,
  });
}

function getAllSearchParams(url = location.href) {
  const recommendedTopics: Record<string, string | string[]> = {};

  new URL(url).searchParams.forEach((queryVal, queryKey) => {
    const dictValue = recommendedTopics[queryKey];
    if (dictValue !== undefined) {
      if (!Array.isArray(dictValue)) {
        recommendedTopics[queryKey] = [dictValue, queryVal];
      } else {
        recommendedTopics[queryKey] = dictValue.concat(queryVal);
      }
    } else {
      recommendedTopics[queryKey] = queryVal;
    }
  });

  return recommendedTopics;
}

export const getRecommendedTopics = (
  mentorTopics: TopicQuestions[]
): TopicQuestions | undefined => {
  // 1. get topics from URL
  const recommendedTopicsURL = getAllSearchParams();

  if (recommendedTopicsURL["topicrec"] !== undefined) {
    //  3. find the topics that match with the mentor's topics
    const matchedTopics = mentorTopics.filter((topic) => {
      if (Array.isArray(recommendedTopicsURL["topicrec"])) {
        return recommendedTopicsURL["topicrec"].some(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (recommendedTopics: any) => {
            return (
              recommendedTopics.toUpperCase() === topic.topic.toUpperCase()
            );
          }
        );
      } else {
        return (
          recommendedTopicsURL["topicrec"].toUpperCase() ===
          topic.topic.toUpperCase()
        );
      }
    });

    // 4. get the questions from the matched mentor's topics
    const recommendedQuestions = matchedTopics.map((topic) => {
      return topic.questions;
    });

    // remove the duplicated questions
    const uniqueQuestions = _.union(
      recommendedQuestions.reduce((acc, val) => acc.concat(val), [])
    );

    return { topic: "Recommended", questions: uniqueQuestions };
  }
  return undefined;
};

// MERGE RECOMMENDED TOPICS AND QUESTIONS AND REMOVE DUPLICATES
export const mergeRecommendedTopicsQuestions = (
  recommendedTopics: string[],
  recommendedQuestions: string[]
): TopicQuestions => {
  // remove duplicates
  const uniqueQuestions: string[] = [];
  const allQuestions = recommendedQuestions.concat(recommendedTopics);
  allQuestions.forEach((question) => {
    const notRepeated = !(
      uniqueQuestions.includes(question) ||
      uniqueQuestions.includes(question.toLowerCase())
    );

    if (notRepeated) {
      uniqueQuestions.push(question);
    }
  });

  return {
    topic: "Recommended",
    questions: uniqueQuestions,
  };
};

export const shouldDisplayPortrait = (): boolean =>
  window.matchMedia && window.matchMedia("(max-width: 1200px)").matches;

export function removeQueryParam(param: string): void {
  const url = new URL(window.location.href);
  url.searchParams.delete(param);
  window.history.pushState({ path: url.href }, "", url.href);
}

export function getParamUserId(urlOrQueryString: string): string | string[] {
  const cutIx = urlOrQueryString.indexOf("?");
  const urlQs =
    cutIx !== -1 ? urlOrQueryString.substring(cutIx + 1) : urlOrQueryString;
  const params = queryString.parse(urlQs);
  const userID =
    params.userID && !Array.isArray(params.userID) ? params.userID : "";

  return userID;
}

export function XOR(a: boolean, b: boolean): boolean {
  return (a || b) && !(a && b);
}

export type LocalStorageKeys =
  | typeof LS_USER_ID_KEY
  | typeof LS_EMAIL_KEY
  | typeof LS_X_API_EMAIL_KEY;

export function updateLocalStorageUserData(
  updatedObject: Partial<LocalStorageUserData>
): LocalStorageUserData {
  const localDataString = getLocalStorage("userData");
  const localData: LocalStorageUserData = JSON.parse(localDataString || "{}");
  const newData = { ...localData, ...updatedObject };
  setLocalStorage("userData", JSON.stringify(newData));
  return localData;
}

export interface LocalStorageUserData {
  [LS_USER_ID_KEY]: string;
  [LS_EMAIL_KEY]: string;
  [LS_X_API_EMAIL_KEY]: string;
  [REFERRER_KEY]: string;
  [EVENTS_KEY]: string[];
}

export function getLocalStorageUserData(): LocalStorageUserData {
  const localData = JSON.parse(localStorage.getItem("userData") || "{}");
  const localGivenUserId = localData[LS_USER_ID_KEY] || "";
  const localEmail = localData[LS_EMAIL_KEY] || "";
  const localXapiEmail = localData[LS_X_API_EMAIL_KEY] || "";
  const localReferrer = localData[REFERRER_KEY] || "";
  const localEvents = localData[EVENTS_KEY] || [];
  return {
    [LS_USER_ID_KEY]: localGivenUserId,
    [LS_EMAIL_KEY]: localEmail,
    [LS_X_API_EMAIL_KEY]: localXapiEmail,
    [REFERRER_KEY]: localReferrer,
    [EVENTS_KEY]: localEvents,
  };
}

export function resetTimeSpentOnPage(): void {
  const curTimeSpentOnPage = getLocalStorage(TIME_SPENT_ON_PAGE_KEY);
  if (!curTimeSpentOnPage) {
    return;
  }
  setLocalStorage(TIME_SPENT_ON_PAGE_KEY, "0");
}

export function emailFromUserId(userId: string): string {
  return `${userId}@mentorpal.org`;
}

export const getParamURL = (param: string): string => {
  const paramFromURL = new URL(location.href).searchParams.get(param);
  if (paramFromURL) {
    return paramFromURL;
  }
  return "";
};
