/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

export enum Feedback {
  GOOD = "GOOD",
  BAD = "BAD",
  NEUTRAL = "NEUTRAL",
}

export enum LoadStatus {
  NONE = "NONE",
  LOAD_IN_PROGRESS = "LOAD_IN_PROGRESS",
  LOADED = "LOADED",
  LOAD_FAILED = "LOAD_FAILED",
}

export const MODE_CHAT = "chat"
export const MODE_VIDEO = "video";
export type Mode = typeof MODE_CHAT | typeof MODE_VIDEO

export interface Config {
  cmi5Enabled: boolean;
  cmi5Endpoint: string;
  cmi5Fetch: string;
  mentorsDefault: string[];
  modeDefault: Mode;
  urlClassifier: string;
  urlGraphql: string;
  urlVideo: string;
  styleHeaderLogo: string;
}

export enum MentorQuestionStatus {
  NONE = "NONE",
  ANSWERED = "ANSWERED",
  ERROR = "ERROR",
  READY = "READY",
}

export enum MentorQuestionSource {
  NONE = "NONE",
  USER = "USER",
  TOPIC_LIST = "TOPIC_LIST",
}

export enum MentorSelectReason {
  HIGHEST_CONFIDENCE = "HIGHEST_CONFIDENCE",
  NEXT_READY = "NEXT_READY",
  NONE = "NONE",
  OFF_TOPIC_CUR = "OFF_TOPIC_CUR",
  OFF_TOPIC_FAV = "OFF_TOPIC_FAV",
  USER_FAV = "USER_FAV",
  USER_SELECT = "USER_SELECT",
}

export interface MentorSelection {
  id: string;
  reason: MentorSelectReason;
}

export enum ResultStatus {
  NONE = "NONE",
  IN_PROGRESS = "IN_PROGRESS",
  SUCCEEDED = "SUCCEEDED",
  FAILED = "FAILED",
}

export function newMentorData(id: string): MentorData {
  return {
    answerDuration: Number.NaN,
    id: id,
    name: "",
    questions_by_id: {},
    short_name: "",
    status: MentorQuestionStatus.NONE,
    title: "",
    topics_by_id: {},
    topic_questions: {},
    utterances_by_type: {},
  };
}

export interface MentorData {
  answer_id?: string;
  answer_text?: string;
  answerDuration: number;
  answerReceivedAt?: Date;
  answerFeedbackId?: string;
  classifier?: string;
  confidence?: number;
  id: string;
  is_off_topic?: boolean;
  name: string;
  question?: string;
  questions_by_id: {
    [question_id: string]: {
      question_text: string;
    };
  };
  response_time?: number;
  short_name: string;
  status: MentorQuestionStatus;
  title: string;
  topics_by_id: {
    [topic_id: string]: {
      name: string;
      questions: string[];
    };
  };
  topic_questions: {
    [topic_id: string]: string[];
  };
  utterances_by_type: {
    [utterance_type: string]: string[][];
  };
}

export interface MentorDataResult {
  data: MentorData | undefined;
  status: ResultStatus;
}

export interface QuestionResult {
  status: ResultStatus;
}

export interface State {
  config: Config;
  configLoadStatus: LoadStatus;
  curMentor: string; // id of selected mentor
  curMentorReason: MentorSelectReason;
  curQuestion: string; // question that was last asked
  curQuestionSource: MentorQuestionSource;
  curQuestionUpdatedAt?: Date;
  curTopic: string; // topic to show questions for
  mentorFaved: string; // id of the preferred mentor
  isIdle: boolean;
  mentorsById: Record<string, MentorData>;
  mentorNext: string; // id of the next mentor to speak after the current finishes
  questionsAsked: string[];
  guestName: string;
}

export interface QuestionResponse {
  answerId: string;
  answerText: string;
  answerClassifier: string;
  answerConfidence: number;
  answerIsOffTopic: boolean;
  answerResponseTimeSecs: number;
  answerFeedbackId: string;
  mentor: string;
  question: string;
  questionSource: MentorQuestionSource;
  status: MentorQuestionStatus;
}

export interface XapiResultMentorAnswerStatus {
  answerId: string;
  mentor: string;
  status: MentorQuestionStatus;
  confidence: number;
  isOffTopic: boolean;
  responseTimeSecs: number;
}

export interface XapiResultAnswerStatusByMentorId {
  [mentor: string]: XapiResultMentorAnswerStatus;
}

export interface XapiResultExt {
  answerClassifier: string;
  answerConfidence: number;
  answerDuration: number;
  answerId: string;
  answerIsOffTopic: boolean;
  answerResponseTimeSecs: number;
  answerStatusByMentor: XapiResultAnswerStatusByMentorId;
  answerText: string;
  mentorCur: string;
  mentorCurIsFav: boolean;
  mentorCurReason: MentorSelectReason;
  mentorCurStatus: MentorQuestionStatus;
  mentorFaved: string;
  mentorNext: string;
  mentorTopicDisplayed: string;
  question: string;
  questionIndex: number;
  questionSource: MentorQuestionSource;
  questionsAsked: string[];
  timestampAsked?: Date;
  timestampAnswered?: Date;
}
