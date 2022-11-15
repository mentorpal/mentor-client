/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
export interface ChatData {
  lastQuestionAt?: Date;
  lastAnswerAt?: Date;
  messages: ChatMsg[];
  questionSent: boolean;
  lastQuestionCounter?: number;
}

export const LINK_TYPE_ASK = "ask";
export const LINK_TYPE_WEB = "web";
export interface WebLink {
  type: typeof LINK_TYPE_WEB;
  href: string;
  answerId: string;
}
export interface AskLink {
  type: typeof LINK_TYPE_ASK;
  question: string;
  href: string;
  askLinkIndex: number;
}
export type ChatLink = AskLink | WebLink;

export interface ChatMsg {
  // we should change name, color, and isUser to just mentorIds
  id: string;
  name: string;
  color: string;
  mentorId: string;
  isIntro: boolean;
  isUser: boolean;
  text: string;
  feedback: Feedback;
  feedbackId: string;
  isFeedbackSendInProgress: boolean;
  utterances?: Utterance[];
  questionId: string;
  askLinks?: AskLink[];
  webLinks?: WebLink[];
  answerMedia?: Media[];
  answerId?: string;
  isVideoInProgress?: boolean;
  confidence?: number;
  curMentor?: string;
  timestampAnswered?: number;
  questionCounter?: number;
}

export interface XapiResultCustom {
  verb: string;
  userid: string;
  userEmail: string;
  referrer: string;
  postSurveyTime: string;
  timeSpentOnPage: string;
  qualtricsUserId: string;
}

export interface MentorClientData {
  _id: string;
  name: string;
  title: string;
  email: string;
  mentorType: MentorType;
  topicQuestions: TopicQuestions[];
  utterances: Utterance[];
  allowContact: boolean;
  hasVirtualBackground: boolean;
  virtualBackgroundUrl: string;
}

export interface Utterance {
  _id: string;
  name: string;
  transcript: string;
  media: Media[];
}

export interface Media {
  type: string;
  tag: string;
  url: string;
  transparentVideoUrl: string;
}

interface AnswerMediaClassifier {
  web_media: Media;
  mobile_media: Media;
  vtt_media: Media;
}

export interface QuestionApiData {
  query: string;
  answer_id: string;
  answer_text: string;
  answer_markdown_text: string;
  answer_media: AnswerMediaClassifier;
  confidence: number;
  feedback_id: string;
  classifier: string;
}

export interface Config {
  cmi5Enabled: boolean;
  cmi5Endpoint: string;
  cmi5Fetch: string;
  mentorsDefault: string[];
  classifierLambdaEndpoint: string;
  urlGraphql: string;
  urlVideo: string;
  styleHeaderLogo: string;
  styleHeaderColor: string;
  styleHeaderTextColor: string;
  filterEmailMentorAddress: string;
  disclaimerTitle: string;
  disclaimerText: string;
  disclaimerDisabled: boolean;
  displayGuestPrompt: boolean;
  defaultVirtualBackground: string;
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

export enum MentorType {
  VIDEO = "VIDEO",
  CHAT = "CHAT",
}

export enum Feedback {
  NONE = "NONE",
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
  CHAT_LINK = "CHAT_LINK",
}

export enum MentorSelectReason {
  HIGHEST_CONFIDENCE = "HIGHEST_CONFIDENCE",
  NEXT_READY = "NEXT_READY",
  NONE = "NONE",
  OFF_TOPIC_CUR = "OFF_TOPIC_CUR",
  OFF_TOPIC_FAV = "OFF_TOPIC_FAV",
  USER_FAV = "USER_FAV",
  USER_SELECT = "USER_SELECT",
  REPLAY = "REPLAY",
}

export enum ResultStatus {
  NONE = "NONE",
  IN_PROGRESS = "IN_PROGRESS",
  SUCCEEDED = "SUCCEEDED",
  FAILED = "FAILED",
  REMOVED = "REMOVED",
}

export interface MentorSelection {
  id: string;
  reason: MentorSelectReason;
  setFav?: boolean;
}

export interface TopicQuestions {
  topic: string;
  questions: string[];
}

export interface MentorState {
  mentor: MentorClientData;
  topic_questions: TopicQuestions[];
  status: MentorQuestionStatus;
  answerDuration: number;

  answer_id?: string;
  answer_text?: string;
  answer_media: Media[];
  answer_utterance_type: string;
  utterances: Utterance[];
  answerReceivedAt?: number;
  answerFeedbackId?: string;
  classifier?: string;
  confidence?: number;
  is_off_topic?: boolean;
  question?: string;
  response_time?: number;
}

export interface MentorDataResult {
  data?: MentorState;
  status: ResultStatus;
}

export interface MentorsLoadRequest {
  guestName?: string;
  mentors: string[];
  recommendedQuestions?: string[];
}

export interface MentorsLoadResult {
  mentorsById: Record<string, MentorDataResult>;
  firstActiveMentorId?: string;
  mentorToAddToState?: string;
  topic?: string;
}

export interface QuestionResult {
  status: ResultStatus;
}

export interface State {
  chat: ChatData;
  config: Config;
  configLoadStatus: LoadStatus;
  curMentor: string; // id of selected mentor
  curMentorReason: MentorSelectReason;
  curQuestion: string; // question that was last asked
  curQuestionSource: MentorQuestionSource;
  curQuestionUpdatedAt?: number;
  curTopic: string; // topic to show questions for
  mentorFaved: string; // id of the preferred mentor
  isIdle: boolean;
  isCmi5Init: boolean;
  mentorsById: Record<string, MentorState>;
  mentorsInitialLoadStatus: LoadStatus;
  mentorAnswersLoadStatus: LoadStatus;
  mentorNext: string; // id of the next mentor to speak after the current finishes
  guestName: string;
  questionsAsked: string[];
  recommendedQuestions: string[];
  questionInput: QuestionInput;
  visibilityShowAllPref: boolean;
  replayMessageCount: number;
}

export interface QuestionInput {
  question: string;
  source: MentorQuestionSource;
}

export interface QuestionResponse {
  answerId: string;
  answerText: string;
  answerMedia: Media[];
  answerClassifier: string;
  answerConfidence: number;
  answerIsOffTopic: boolean;
  answerUtteranceType: string;
  answerResponseTimeSecs: number;
  answerFeedbackId: string;
  mentor: string;
  question: string;
  questionId: string;
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
  timestampAsked?: number;
  timestampAnswered?: number;
}
