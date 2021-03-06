/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { MentorState, MentorQuestionStatus } from "types";

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
