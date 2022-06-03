/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { MentorState, MentorQuestionStatus } from "types";
import { v4 as uuid } from "uuid";
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

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
