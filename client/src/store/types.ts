export enum MentorQuestionStatus {
  NONE = "NONE",
  ANSWERED = "ANSWERED",
  ERROR = "ERROR",
  READY = "READY",
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

// TODO: transient properties--answer_id, and status should NOT be part of MentorData
export interface MentorData {
  answer_id?: string; // move elsewhere, e.g. history of QuestionStatus objects
  answer_text?: string; // move elsewhere, e.g. history of QuestionStatus objects
  classifier?: string; // move elsewhere, e.g. history of QuestionStatus objects
  confidence?: number; // move elsewhere, e.g. history of QuestionStatus objects
  id: string;
  is_off_topic?: boolean; // move elsewhere, e.g. history of QuestionStatus objects
  name: string;
  question?: string; // move elsewhere, e.g. history of QuestionStatus objects
  questions_by_id: {
    [question_id: string]: {
      question_text: string;
    };
  };
  response_time?: number; // move elsewhere, e.g. history of QuestionStatus objects
  short_name: string;
  status: MentorQuestionStatus; // move elsewhere, e.g. history of QuestionStatus objects
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
  current_mentor: string; // id of selected mentor
  currentMentorReason: MentorSelectReason;
  current_question: string; // question that was last asked
  current_topic: string; // topic to show questions for
  faved_mentor: string; // id of the preferred mentor
  isIdle: boolean;
  mentors_by_id: {
    [mentor_id: string]: MentorData;
  };
  next_mentor: string; // id of the next mentor to speak after the current finishes
  questions_asked: string[];
}

export interface QuestionResponse {
  answer_id: string;
  answer_text: string;
  classifier: string;
  confidence: number;
  id: string;
  is_off_topic: boolean;
  question: string;
  response_time: number;
  status: MentorQuestionStatus;
}

export interface XapiResultExt {
  answerId: string;
  answerText: string;
  classifier: string;
  confidence: number;
  isOffTopic: boolean;
  mentorCurrent: string;
  mentorCurrentReason: MentorSelectReason;
  mentorFaved: string;
  mentorList: string[];
  mentorNext: string;
  mentorTopicDisplayed: string;
  questionCurrent: string;
  questionIndex: number;
  questionsAsked: string[];
  responseTimeSecs: number;
}
