import { reducers as cmi5Reducer } from "redux-cmi5";
import { normalizeString } from "@/funcs/funcs";
import {
  ANSWER_FINISHED,
  MENTOR_FAVED,
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
  MENTOR_ANSWER_PLAYBACK_STARTED,
} from "./actions";
import {
  MentorData,
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
  curQuestionUpdatedAt: new Date(Number.NaN),
  curTopic: "", // topic to show questions for
  mentorFaved: "", // id of the preferred mentor
  isIdle: false,
  mentorsById: {},
  mentorNext: "", // id of the next mentor to speak after the current finishes
  questionsAsked: [],
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
      return {
        ...state,
        curQuestion: action.question,
        curQuestionUpdatedAt: new Date(Date.now()),
        questionsAsked: Array.from(
          new Set([...state.questionsAsked, normalizeString(action.question)])
        ),
      };
    case QUESTION_ANSWERED: {
      const response = action.mentor as QuestionResponse;
      const history =
        state.mentorsById[response.id].topic_questions.History || [];
      if (!history.includes(response.question)) {
        history.push(response.question);
      }
      const mentor: MentorData = {
        ...state.mentorsById[response.id],
        answer_id: response.answer_id,
        answer_text: response.answer_text,
        answerRecievedAt: new Date(Date.now()),
        classifier: response.classifier,
        confidence: response.confidence,
        is_off_topic: response.is_off_topic,
        question: response.question,
        response_time: response.response_time,
        status: MentorQuestionStatus.READY,
        topic_questions: {
          ...state.mentorsById[response.id].topic_questions,
          History: history,
        },
      };
      return {
        ...state,
        isIdle: false,
        mentorsById: {
          ...state.mentorsById,
          [response.id]: mentor,
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
            answerRecievedAt: new Date(Date.now()),
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
    default:
      return state;
  }
}
