/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
const cmi5Reducer = require("redux-cmi5").reducers;
import { normalizeString } from "funcs/funcs";
import {
  ANSWER_FINISHED,
  MENTOR_FAVED,
  MENTOR_ANSWER_PLAYBACK_STARTED,
  MENTOR_NEXT,
  MENTOR_DATA_REQUESTED,
  MENTOR_DATA_RESULT,
  MENTOR_SELECTED,
  QUESTION_ANSWERED,
  QUESTION_ERROR,
  QUESTION_SENT,
  TOPIC_SELECTED,
  MentorDataResultAction,
  MentorDataRequestedAction,
  MentorSelectedAction,
  MentorAnswerPlaybackStartedAction,
  QuestionSentAction,
  GUEST_NAME_SET,
} from "./actions";
import {
  MentorData,
  MentorQuestionSource,
  MentorQuestionStatus,
  newMentorData,
  QuestionResponse,
  ResultStatus,
  State,
  MentorSelectReason,
} from "./types";

export const initialState: State = cmi5Reducer({
  curMentor: "", // id of selected mentor
  curMentorReason: MentorSelectReason.NONE,
  curQuestion: "", // question that was last asked
  curQuestionSource: MentorQuestionSource.NONE,
  curTopic: "", // topic to show questions for
  mentorFaved: "", // id of the preferred mentor
  isIdle: false,
  mentorsById: {},
  mentorNext: "", // id of the next mentor to speak after the current finishes
  questionsAsked: [],
  guestName: "",
});

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
      curMentor: mentor.id, // TODO: why is the current mentor any random last that loaded?
      isIdle: false,
      mentorsById: {
        ...state.mentorsById,
        [mentor.id]: {
          ...state.mentorsById[mentor.id],
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
      mentorsByIdAcc[mentorId] = newMentorData(mentorId);
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

export default function reducer(state = initialState, action: any): State {
  state = cmi5Reducer(state, action);
  switch (action.type) {
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
      const history =
        state.mentorsById[response.mentor].topic_questions.History || [];
      if (!history.includes(response.question)) {
        history.push(response.question);
      }
      const mentor: MentorData = {
        ...state.mentorsById[response.mentor],
        answer_id: response.answerId,
        answer_text: response.answerText,
        answerReceivedAt: new Date(Date.now()),
        classifier: response.answerClassifier,
        confidence: response.answerConfidence,
        is_off_topic: response.answerIsOffTopic,
        question: response.question,
        response_time: response.answerResponseTimeSecs,
        status: MentorQuestionStatus.READY,
        topic_questions: {
          ...state.mentorsById[response.mentor].topic_questions,
          History: history,
        },
      };
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
    default:
      return state;
  }
}
