/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { normalizeString } from "utils";
import {
  ANSWER_FINISHED,
  MENTOR_FAVED,
  MENTOR_ANSWER_PLAYBACK_STARTED,
  MENTOR_NEXT,
  MENTOR_SELECTED,
  QUESTION_ANSWERED,
  QUESTION_ERROR,
  QUESTION_SENT,
  TOPIC_SELECTED,
  MentorSelectedAction,
  MentorAnswerPlaybackStartedAction,
  QuestionSentAction,
  GUEST_NAME_SET,
  ConfigLoadSucceededAction,
  CONFIG_LOAD_FAILED,
  CONFIG_LOAD_STARTED,
  CONFIG_LOAD_SUCCEEDED,
  MentorDataResultAction,
  MENTOR_DATA_RESULT,
  MentorDataRequestedAction,
  MENTOR_DATA_REQUESTED,
  RECOMMENDED_QUESTIONS_SET,
} from "./actions";
import {
  MentorData,
  MentorQuestionSource,
  MentorQuestionStatus,
  QuestionResponse,
  State,
  MentorSelectReason,
  LoadStatus,
  ResultStatus,
  MentorType,
} from "../types";

export const initialState: State = {
  config: {
    cmi5Enabled: false,
    cmi5Endpoint: process.env.CMI5_ENDPOINT || "/lrs/xapi",
    cmi5Fetch: process.env.CMI5_FETCH || "/lrs/auth/guesttoken",
    mentorsDefault: [],
    urlGraphql: process.env.MENTOR_GRAPHQL_URL || "/graphql",
    urlClassifier: process.env.MENTOR_API_URL || "/classifier",
    urlVideo: process.env.MENTOR_VIDEO_URL || "/videos",
    styleHeaderLogo: process.env.HEADER_LOGO || "",
    styleHeaderColor: process.env.HEADER_COLOR || "",
    styleHeaderTextColor: process.env.HEADER_TEXT_COLOR || "",
  },
  configLoadStatus: LoadStatus.NONE,
  guestName: "",
  curMentor: "", // id of selected mentor
  curMentorReason: MentorSelectReason.NONE,
  curQuestion: "", // question that was last asked
  curQuestionSource: MentorQuestionSource.NONE,
  curTopic: "", // topic to show questions for
  mentorFaved: "", // id of the preferred mentor
  isIdle: false,
  mentorsById: {},
  mentorNext: "", // id of the next mentor to speak after the current finishes
  recommendedQuestions: [],
  questionsAsked: [],
};

function mentorSelected(state: State, action: MentorSelectedAction): State {
  const mentorId = action.payload.id;
  return {
    ...state,
    curMentor: action.payload.id,
    curMentorReason: action.payload.reason,
    isIdle: false,
    mentorsById: {
      ...state.mentorsById,
      [mentorId]: {
        ...state.mentorsById[mentorId],
        status: MentorQuestionStatus.ANSWERED,
      },
    },
  };
}

function onMentorAnswerPlaybackStarted(
  state: State,
  action: MentorAnswerPlaybackStartedAction
): State {
  const mentorData = state.mentorsById[action.payload.mentor];
  if (!mentorData) {
    return state;
  }
  return {
    ...state,
    mentorsById: {
      ...state.mentorsById,
      [action.payload.mentor]: {
        ...state.mentorsById[action.payload.mentor],
        answerDuration: Number(action.payload.duration),
      },
    },
  };
}

function onMentorDataResult(
  state: State,
  action: MentorDataResultAction
): State {
  if (action.payload.status === ResultStatus.SUCCEEDED) {
    const mentor = action.payload.data as MentorData;
    return {
      ...state,
      curMentor: mentor.mentor._id, // TODO: why is the current mentor any random last that loaded?
      isIdle: false,
      mentorsById: {
        ...state.mentorsById,
        [mentor.mentor._id]: {
          ...state.mentorsById[mentor.mentor._id],
          ...mentor,
          status: MentorQuestionStatus.READY,
        },
      },
    };
  }
  return state;
}

function onMentorDataRequested(
  state: State,
  action: MentorDataRequestedAction
): State {
  const mentorsById = action.payload.reduce<{ [mentorId: string]: MentorData }>(
    (mentorsByIdAcc, mentorId) => {
      mentorsByIdAcc[mentorId] = {
        mentor: {
          _id: mentorId,
          name: "",
          firstName: "",
          title: "",
          mentorType: MentorType.CHAT,
          topics: [],
          answers: [],
          utterances: [],
        },
        topic_questions: [],
        status: MentorQuestionStatus.NONE,
        answerDuration: Number.NaN,
      };
      return mentorsByIdAcc;
    },
    {}
  );
  Object.getOwnPropertyNames(state.mentorsById).forEach(id => {
    mentorsById[id] = state.mentorsById[id];
  });
  return {
    ...state,
    mentorsById: mentorsById,
  };
}

function onQuestionSent(state: State, action: QuestionSentAction): State {
  return {
    ...state,
    curQuestion: action.payload.question,
    curQuestionSource: action.payload.source,
    curQuestionUpdatedAt: new Date(Date.now()),
    questionsAsked: Array.from(
      new Set([
        ...state.questionsAsked,
        normalizeString(action.payload.question),
      ])
    ),
  };
}

function onConfigLoadStarted(state: State): State {
  return {
    ...state,
    configLoadStatus: LoadStatus.LOAD_IN_PROGRESS,
  };
}

function onConfigLoadFailed(state: State): State {
  return {
    ...state,
    configLoadStatus: LoadStatus.LOAD_FAILED,
  };
}

function onConfigLoadSucceeded(
  state: State,
  action: ConfigLoadSucceededAction
): State {
  return {
    ...state,
    config: action.payload,
    configLoadStatus: LoadStatus.LOADED,
  };
}

export default function reducer(state = initialState, action: any): State {
  switch (action.type) {
    case CONFIG_LOAD_FAILED:
      return onConfigLoadFailed(state);
    case CONFIG_LOAD_STARTED:
      return onConfigLoadStarted(state);
    case CONFIG_LOAD_SUCCEEDED:
      return onConfigLoadSucceeded(state, action as ConfigLoadSucceededAction);
    case MENTOR_ANSWER_PLAYBACK_STARTED:
      return onMentorAnswerPlaybackStarted(
        state,
        action as MentorAnswerPlaybackStartedAction
      );
    case MENTOR_DATA_REQUESTED:
      return onMentorDataRequested(state, action as MentorDataRequestedAction);
    case MENTOR_DATA_RESULT:
      return onMentorDataResult(state, action as MentorDataResultAction);
    case MENTOR_SELECTED:
      return mentorSelected(state, action);
    case MENTOR_FAVED:
      return {
        ...state,
        mentorFaved: state.mentorFaved === action.id ? "" : action.id,
      };
    case MENTOR_NEXT:
      return {
        ...state,
        mentorNext: action.mentor,
      };
    case QUESTION_SENT:
      return onQuestionSent(state, action as QuestionSentAction);
    case QUESTION_ANSWERED: {
      const response = action.mentor as QuestionResponse;
      const mentor: MentorData = {
        ...state.mentorsById[response.mentor],
        answer_id: response.answerId,
        answer_text: response.answerText,
        answerReceivedAt: new Date(Date.now()),
        answerFeedbackId: response.answerFeedbackId,
        classifier: response.answerClassifier,
        confidence: response.answerConfidence,
        is_off_topic: response.answerIsOffTopic,
        question: response.question,
        response_time: response.answerResponseTimeSecs,
        status: MentorQuestionStatus.READY,
      };
      const history = mentor.topic_questions.length - 1;
      if (
        !mentor.topic_questions[history].questions.includes(response.question)
      ) {
        mentor.topic_questions[history].questions.push(response.question);
      }
      return {
        ...state,
        isIdle: false,
        mentorsById: {
          ...state.mentorsById,
          [response.mentor]: mentor,
        },
      };
    }
    case QUESTION_ERROR:
      return {
        ...state,
        mentorsById: {
          ...state.mentorsById,
          [action.mentor]: {
            ...state.mentorsById[action.mentor],
            answerReceivedAt: new Date(Date.now()),
            question: action.question,
            status: MentorQuestionStatus.ERROR,
          },
        },
      };
    case ANSWER_FINISHED:
      return {
        ...state,
        isIdle: true,
      };
    case TOPIC_SELECTED:
      return {
        ...state,
        curTopic: action.topic,
      };
    case GUEST_NAME_SET:
      return {
        ...state,
        guestName: action.name,
      };
    case RECOMMENDED_QUESTIONS_SET:
      return {
        ...state,
        recommendedQuestions: action.recommendedQuestions,
      };
    default:
      return state;
  }
}
