/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { MentorState, MentorQuestionStatus, TopicQuestions } from "types";
import { v4 as uuid } from "uuid";
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import { sendCmi5Statement } from "store/actions";
import { toXapiResultExtCustom } from "cmiutils";
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
    "registrationId"
  );
  if (!registrationIdFromUrl) {
    const registrationIdFromStorage = getLocalStorage("registrationId");
    if (!registrationIdFromStorage) {
      const registrationId = uuid();
      setLocalStorage("registrationId", registrationId);
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

export function onVisibilityChange(): void {
  if (document.visibilityState !== "visible") {
    const localData = localStorage.getItem("userData");
    if (!localData) {
      return;
    }
    const data = JSON.parse(localData);
    if (!data.userID) {
      return;
    }
    const userData = {
      verb: "suspended",
      userid: data.userID,
      userEmail: data.userEmail,
      referrer: data.referrer,
      postSurveyTime: getLocalStorage("postsurveytime"),
      timeSpentOnPage: getLocalStorage("postsurveytime"),
      qualtricsUserId: getLocalStorage("qualtricsuserid"),
    };
    sendCmi5Statement({
      verb: {
        id: `https://mentorpal.org/xapi/verb/${userData.verb}`,
        display: {
          "en-US": `${userData.verb}`,
        },
      },
      result: {
        extensions: {
          "https://mentorpal.org/xapi/verb/suspended": toXapiResultExtCustom(
            userData.verb,
            userData.userid,
            userData.userEmail,
            userData.referrer,
            userData.postSurveyTime,
            userData.timeSpentOnPage,
            userData.qualtricsUserId
          ),
        },
      },
      object: {
        id: `${window.location.protocol}//${window.location.host}`,
        objectType: "Activity",
      },
    });
  }
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
  // convert questions to uppercase to compare them
  const uniqueQ = Array.from(
    new Set(recommendedQuestions.map((q) => q.toUpperCase()))
  );
  // convert topics to uppercase to compare them
  const uniqueT = Array.from(
    new Set(recommendedTopics.map((t) => t.toUpperCase()))
  );

  // remove duplicates
  const uniqueQuestions = _.union(uniqueQ, uniqueT);

  return {
    topic: "Recommended",
    questions: uniqueQuestions,
  };
};
