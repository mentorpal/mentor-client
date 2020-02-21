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
} from "./actions";
import {
  MentorData,
  MentorQuestionStatus,
  newMentorData,
  QuestionMentorAnswerState,
  QuestionResponse,
  QuestionState,
  ResultStatus,
  State,
} from "./types";

export const initialState: State = cmi5Reducer({
  current_mentor: "", // id of selected mentor
  current_question: "", // question that was last asked
  current_topic: "", // topic to show questions for
  faved_mentor: "", // id of the preferred mentor
  isIdle: false,
  mentors_by_id: {},
  next_mentor: "", // id of the next mentor to speak after the current finishes
  questions: [],
  questions_asked: [],
});

function mentorSelected(state: State, action: MentorSelectedAction): State {
  const mentorId = action.payload.id;
  return {
    ...state,
    current_mentor: action.payload.id,
    isIdle: false,
    mentors_by_id: {
      ...state.mentors_by_id,
      [mentorId]: {
        ...state.mentors_by_id[mentorId],
        status: MentorQuestionStatus.ANSWERED,
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
      current_mentor: mentor.id, // TODO: why is the current mentor any random last that loaded?
      isIdle: false,
      mentors_by_id: {
        ...state.mentors_by_id,
        [mentor.id]: {
          ...state.mentors_by_id[mentor.id],
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
  Object.getOwnPropertyNames(state.mentors_by_id).forEach(id => {
    mentorsById[id] = state.mentors_by_id[id];
  });
  return {
    ...state,
    mentors_by_id: mentorsById,
  };
}

function newQuestionState(question: string, state: State): QuestionState {
  const mentors = Object.getOwnPropertyNames(state.mentors_by_id);
  return {
    question,
    answersByMentor: mentors.reduce((acc, cur) => {
      const qma: QuestionMentorAnswerState = {
        answerId: "",
        answerText: "",
        answeredAt: new Date(0),
        askedAt: new Date(Date.now()),
        classifier: "",
        confidence: Number.NaN,
        isOffTopic: false,
        responseTimeSecs: Number.NaN,
        status: MentorQuestionStatus.NONE,
      };
      acc[cur] = qma;
      return acc;
    }, {}),
  };
}

interface Transform<T> {
  (before: T): T;
}

function updateActive<T>(a: T[], transform: Transform<T>): T[] {
  const aAfter = [...a];
  aAfter[a.length - 1] = transform(a[a.length - 1]);
  return aAfter;
}

export default function reducer(state = initialState, action: any): State {
  state = cmi5Reducer(state, action);
  switch (action.type) {
    case MENTOR_DATA_REQUESTED:
      return onMentorDataRequested(state, action as MentorDataRequestedAction);
    case MENTOR_DATA_RESULT:
      return onMentorDataResult(state, action as MentorDataResultAction);
    case MENTOR_SELECTED:
      return mentorSelected(state, action);
    case MENTOR_FAVED:
      return {
        ...state,
        faved_mentor: state.faved_mentor === action.id ? "" : action.id,
      };
    case MENTOR_NEXT:
      return {
        ...state,
        next_mentor: action.mentor,
      };
    case QUESTION_SENT:
      return {
        ...state,
        current_question: action.question,
        questions: [
          ...state.questions,
          newQuestionState(action.question, state),
        ],
        questions_asked: Array.from(
          new Set([...state.questions_asked, normalizeString(action.question)])
        ),
      };
    case QUESTION_ANSWERED: {
      const response = action.mentor as QuestionResponse;
      const history =
        state.mentors_by_id[response.id].topic_questions.History || [];
      if (!history.includes(response.question)) {
        history.push(response.question);
      }
      const mentor: MentorData = {
        ...state.mentors_by_id[response.id],
        answer_id: response.answer_id,
        answer_text: response.answer_text,
        classifier: response.classifier,
        confidence: response.confidence,
        is_off_topic: response.is_off_topic,
        question: response.question,
        status: MentorQuestionStatus.READY,
        topic_questions: {
          ...state.mentors_by_id[response.id].topic_questions,
          History: history,
        },
      };
      return {
        ...state,
        isIdle: false,
        mentors_by_id: {
          ...state.mentors_by_id,
          [response.id]: mentor,
        },
        questions: updateActive(
          state.questions,
          (b: QuestionState): QuestionState => {
            const mentorAnswerBefore = b.answersByMentor[response.id];
            const mentorAnswerAfter: QuestionMentorAnswerState = {
              ...mentorAnswerBefore,
              answeredAt: new Date(Date.now()),
              answerId: response.answer_id,
              answerText: response.answer_text,
              classifier: response.classifier,
              confidence: response.confidence,
              isOffTopic: response.is_off_topic,
              responseTimeSecs:
                (Date.now() - mentorAnswerBefore.askedAt.getTime()) / 1000,
              status: MentorQuestionStatus.ANSWERED,
            };
            return {
              ...b,
              answersByMentor: {
                ...b.answersByMentor,
                [response.id]: mentorAnswerAfter,
              },
            };
          }
        ),
      };
    }
    case QUESTION_ERROR:
      return {
        ...state,
        mentors_by_id: {
          ...state.mentors_by_id,
          [action.mentor]: {
            ...state.mentors_by_id[action.mentor],
            question: action.question,
            status: MentorQuestionStatus.ERROR,
          },
        },
        questions: updateActive(
          state.questions,
          (b: QuestionState): QuestionState => {
            const mentorAnswerBefore = b.answersByMentor[action.mentor];
            const mentorAnswerAfter: QuestionMentorAnswerState = {
              ...mentorAnswerBefore,
              answeredAt: new Date(Date.now()),
              responseTimeSecs:
                (Date.now() - mentorAnswerBefore.askedAt.getTime()) / 1000,
              status: MentorQuestionStatus.ERROR,
            };
            return {
              ...b,
              answersByMentor: {
                ...b.answersByMentor,
                [action.mentor]: mentorAnswerAfter,
              },
            };
          }
        ),
      };
    case ANSWER_FINISHED:
      return {
        ...state,
        isIdle: true,
      };
    case TOPIC_SELECTED:
      return {
        ...state,
        current_topic: action.topic,
      };
    default:
      return state;
  }
}
