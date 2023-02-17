/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import {
  EVENTS_KEY,
  LS_EMAIL_KEY,
  LS_USER_ID_KEY,
  LS_X_API_EMAIL_KEY,
  REFERRER_KEY,
} from "./local-constants";

export interface Mentor {
  _id: string;
  name: string;
  title: string;
  mentorType: MentorType;
  topics: Topic[];
  answers: Answer[];
  utterances: Answer[];
}

export interface Topic {
  _id: string;
  name: string;
}

export interface Answer {
  _id: string;
  transcript: string;
  question: Question;
}

export interface Question {
  question: string;
  name: string;
}

export enum MentorType {
  VIDEO = "VIDEO",
  CHAT = "CHAT",
}

export enum QuestionType {
  UTTERANCE = "UTTERANCE",
  QUESTION = "QUESTION",
}

export enum Status {
  INCOMPLETE = "INCOMPLETE",
  COMPLETE = "COMPLETE",
}

export enum UtteranceName {
  IDLE = "_IDLE_",
  INTRO = "_INTRO_",
  OFF_TOPIC = "_OFF_TOPIC_",
  PROMPT = "_PROMPT_",
  FEEDBACK = "_FEEDBACK_",
  REPEAT = "_REPEAT_",
  REPEAT_BUMP = "_REPEAT_BUMP_",
  PROFANIY = "_PROFANITY_",
}

export interface LocalStorageUserData {
  [LS_USER_ID_KEY]: string;
  [LS_EMAIL_KEY]: string;
  [LS_X_API_EMAIL_KEY]: string;
  [REFERRER_KEY]: string;
  [EVENTS_KEY]: string[];
}
