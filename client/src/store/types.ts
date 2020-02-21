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
    answerRecievedAt: new Date(Number.NaN),
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
  answerRecievedAt: Date;
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
  curMentor: string; // id of selected mentor
  curMentorReason: MentorSelectReason;
  curQuestion: string; // question that was last asked
  curQuestionUpdatedAt: Date;
  curTopic: string; // topic to show questions for
  mentorFaved: string; // id of the preferred mentor
  isIdle: boolean;
  mentorsById: {
    [mentor: string]: MentorData;
  };
  mentorNext: string; // id of the next mentor to speak after the current finishes
  questionsAsked: string[];
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
  questionCur: string;
  questionIndex: number;
  questionsAsked: string[];
  timestampAsked: Date;
  timestampAnswered: Date;
}
