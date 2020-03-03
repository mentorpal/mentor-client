/* eslint-disable */
import { actions as cmi5Actions } from "redux-cmi5";
import { ActionCreator, AnyAction, Dispatch } from "redux";
import { ThunkAction, ThunkDispatch } from "redux-thunk";

import { fetchMentorData, MentorApiData, queryMentor } from "@/api/api";
import {
  MentorDataResult,
  MentorQuestionStatus,
  MentorSelection,
  MentorSelectReason,
  QuestionResponse,
  QuestionResult,
  ResultStatus,
  MentorData,
  MentorQuestionSource,
  State,
  XapiResultExt,
  XapiResultAnswerStatusByMentorId,
} from "./types";

const RESPONSE_CUTOFF = -100;

export const ANSWER_FINISHED = "ANSWER_FINISHED"; // mentor video has finished playing
export const MENTOR_ANSWER_PLAYBACK_STARTED = "MENTOR_ANSWER_PLAYBACK_STARTED";
export const MENTOR_DATA_REQUESTED = "MENTOR_DATA_REQUESTED";
export const MENTOR_DATA_RESULT = "MENTOR_DATA_RESULT";
export const MENTOR_DATA_REQUEST_DONE = "MENTOR_DATA_REQUEST_DONE";
export const MENTOR_FAVED = "MENTOR_FAVED"; // mentor was favorited
export const MENTOR_NEXT = "MENTOR_NEXT"; // set next mentor to play after current
export const MENTOR_LOADED = "MENTOR_LOADED"; // mentor info was loaded
export const MENTOR_SELECTED = "MENTOR_SELECTED"; // mentor video was selected
export const MENTOR_TOPIC_QUESTIONS_LOADED = "MENTOR_TOPIC_QUESTIONS_LOADED";
export const QUESTION_ANSWERED = "QUESTION_ANSWERED"; // question was answered by mentor
export const QUESTION_ERROR = "QUESTION_ERROR"; // question could not be answered by mentor
export const QUESTION_RESULT = "QUESTION_RESULT";
export const QUESTION_SENT = "QUESTION_SENT"; // question input was sent
export const TOPIC_SELECTED = "TOPIC_SELECTED";

export interface MentorAnswerPlaybackStartedAction {
  type: typeof MENTOR_ANSWER_PLAYBACK_STARTED;
  payload: {
    mentor: string;
    duration: number;
  };
}

export interface MentorDataRequestedAction {
  type: typeof MENTOR_DATA_REQUESTED;
  payload: string[];
}

export interface MentorDataResultAction {
  type: typeof MENTOR_DATA_RESULT;
  payload: MentorDataResult;
}

export interface MentorDataRequestDoneAction {
  type: typeof MENTOR_DATA_REQUEST_DONE;
}

export interface MentorSelectedAction {
  type: typeof MENTOR_SELECTED;
  payload: MentorSelection;
}

export interface QuestionResultAction {
  type: typeof QUESTION_RESULT;
  payload: QuestionResult;
}

export interface QuestionSentAction {
  type: typeof QUESTION_SENT;
  payload: {
    question: string;
    source: MentorQuestionSource;
  };
}

export interface NextMentorAction {
  type: typeof MENTOR_NEXT;
  mentor: string;
}

export const MENTOR_SELECTION_TRIGGER_AUTO = "auto";
export const MENTOR_SELECTION_TRIGGER_USER = "user";

function findIntro(mentorData: MentorApiData): string {
  try {
    return mentorData.utterances_by_type._INTRO_[0][0];
  } catch (err) {
    console.error("no _INTRO_ in mentor data: ", mentorData);
  }
  const allIds = Object.getOwnPropertyNames(mentorData.questions_by_id);
  if (allIds.length > 0) {
    return allIds[0];
  }
  return "intro";
}

function toXapiResultExt(mentorData: MentorData, state: State): XapiResultExt {
  return {
    answerClassifier: mentorData.classifier || "",
    answerConfidence: Number(mentorData.confidence),
    answerDuration: Number(mentorData.answerDuration),
    answerId: mentorData.answer_id || "",
    answerIsOffTopic: Boolean(mentorData.is_off_topic),
    answerResponseTimeSecs: Number(mentorData.response_time) / 1000,
    answerStatusByMentor: Object.getOwnPropertyNames(state.mentorsById).reduce(
      (
        acc: XapiResultAnswerStatusByMentorId,
        cur: string
      ): XapiResultAnswerStatusByMentorId => {
        acc[cur] = {
          answerId: state.mentorsById[cur].answer_id || "",
          confidence: Number(state.mentorsById[cur].confidence),
          isOffTopic: Boolean(state.mentorsById[cur].is_off_topic),
          mentor: state.mentorsById[cur].id,
          status: state.mentorsById[cur].status,
          responseTimeSecs: Number(mentorData.response_time) / 1000,
        };
        return acc;
      },
      {}
    ),
    answerText: mentorData.answer_text || "",
    mentorCur: mentorData.id,
    mentorCurReason: state.curMentorReason,
    mentorCurStatus: mentorData.status,
    mentorCurIsFav: state.mentorFaved === mentorData.id,
    mentorFaved: state.mentorFaved,
    mentorNext: state.mentorNext,
    mentorTopicDisplayed: state.curTopic,
    questionsAsked: state.questionsAsked,
    question: state.curQuestion,
    questionSource: state.curQuestionSource,
    questionIndex: currentQuestionIndex(state),
    timestampAnswered: new Date(state.curQuestionUpdatedAt),
    timestampAsked: new Date(mentorData.answerReceivedAt),
  };
}

export const loadMentor: ActionCreator<ThunkAction<
  Promise<MentorDataRequestDoneAction>, // The type of the last action to be dispatched - will always be promise<T> for async actions
  State, // The type for the data within the last action
  string, // The type of the parameter for the nested function
  MentorDataRequestDoneAction // The type of the last action to be dispatched
>> = (
  mentors: string | string[],
  {
    recommendedQuestions,
  }: {
    recommendedQuestions?: string[] | string | undefined;
  } = {}
) => async (
  dispatch: ThunkDispatch<State, void, AnyAction>,
  getState: () => State
) => {
  try {
    const mentorList = Array.isArray(mentors)
      ? (mentors as Array<string>)
      : [mentors as string];
    const recommendedQuestionList: string[] | undefined =
      Array.isArray(recommendedQuestions) && recommendedQuestions.length > 0
        ? (recommendedQuestions as string[])
        : typeof recommendedQuestions === "string"
        ? [recommendedQuestions as string]
        : undefined;

    dispatch<MentorDataRequestedAction>({
      type: MENTOR_DATA_REQUESTED,
      payload: mentorList,
    });
    const dataPromises = Promise.all(
      mentorList.map(mentorId => {
        return new Promise<void>((resolve, reject) => {
          fetchMentorData(mentorId)
            .then(result => {
              if (result.status == 200) {
                const apiData = result.data;
                const mentorData: MentorData = {
                  ...apiData,
                  answer_id: findIntro(apiData),
                  answerDuration: Number.NaN,
                  answerReceivedAt: Number.NaN,
                  status: MentorQuestionStatus.ANSWERED, // move this out of mentor data
                  topic_questions: Object.getOwnPropertyNames(
                    apiData.topics_by_id
                  ).reduce<{ [typeName: string]: string[] }>(
                    (topicQs, topicId) => {
                      const topicData = apiData.topics_by_id[topicId];
                      topicQs[topicData.name] = topicData.questions.map(
                        t => apiData.questions_by_id[t].question_text
                      );
                      return topicQs;
                    },
                    Array.isArray(recommendedQuestionList)
                      ? { Recommended: recommendedQuestionList }
                      : {}
                  ),
                };
                dispatch<MentorDataResultAction>({
                  type: MENTOR_DATA_RESULT,
                  payload: {
                    data: mentorData,
                    status: ResultStatus.SUCCEEDED,
                  },
                });
                return resolve();
              } else {
                return reject();
              }
            })
            .catch(err => {
              dispatch<MentorDataResultAction>({
                type: MENTOR_DATA_RESULT,
                payload: {
                  data: undefined,
                  status: ResultStatus.FAILED,
                },
              });
              return reject(err);
            });
        });
      })
    );
    await dataPromises;
    const mentorsById = getState().mentorsById;
    // find the first of the requested mentors that loaded successfully
    // and select that mentor
    const firstMentor = mentorList.find(
      id => mentorsById[id].status === MentorQuestionStatus.READY
    );
    if (firstMentor) {
      dispatch(selectMentor(firstMentor, MentorSelectReason.NEXT_READY));
    }
  } catch (err) {
    console.error(`Failed to load mentor data for id ${mentors}`, err);
  }
  return dispatch<MentorDataRequestDoneAction>({
    type: MENTOR_DATA_REQUEST_DONE,
  });
};

const { sendStatement: sendXapiStatement } = cmi5Actions;

export function mentorAnswerPlaybackStarted(video: {
  mentor: string;
  duration: number;
}) {
  return (
    dispatch: ThunkDispatch<State, void, AnyAction>,
    getState: () => State
  ) => {
    dispatch(onMentorAnswerPlaybackStarted(video.mentor, video.duration)); // must go first to apply duration to mentordata in state
    const curState = getState();
    const mentorData = curState.mentorsById[video.mentor];
    if (!mentorData) {
      console.warn(
        `on mentorAnswerPlaybackStarted no mentor found for id '${video.mentor}`
      );
      return;
    }
    dispatch(
      sendXapiStatement({
        verb: "https://mentorpal.org/xapi/verb/answer-playback-started",
        result: {
          extensions: {
            "https://mentorpal.org/xapi/verb/answer-playback-started": toXapiResultExt(
              mentorData,
              curState
            ),
          },
        },
      })
    );
  };
}

export const selectMentor = (mentor: string, reason: MentorSelectReason) => (
  dispatch: ThunkDispatch<State, void, AnyAction>
) => {
  dispatch(onInput());
  return dispatch({
    payload: {
      id: mentor,
      reason,
    },
    type: MENTOR_SELECTED,
  });
};

export const selectTopic = (topic: any) => ({
  topic,
  type: TOPIC_SELECTED,
});

export const faveMentor = (mentor_id: any) => ({
  id: mentor_id,
  type: MENTOR_FAVED,
});

const currentQuestionIndex = (state: { questionsAsked: { length: any } }) =>
  Array.isArray(state.questionsAsked) ? state.questionsAsked.length : -1;

export const sendQuestion = (q: {
  question: string;
  source: MentorQuestionSource;
}) => async (
  dispatch: ThunkDispatch<State, void, AnyAction>,
  getState: () => State
) => {
  dispatch(
    sendXapiStatement({
      result: {
        extensions: {
          "https://mentorpal.org/xapi/verb/asked": {
            questionIndex: currentQuestionIndex(getState()) + 1,
            text: q.question,
            source: q.source,
          },
        },
      },
      verb: "https://mentorpal.org/xapi/verb/asked",
    })
  );
  dispatch(onInput());
  dispatch(onQuestionSent(q));
  const state = getState();
  const mentorIds = Object.keys(state.mentorsById);
  const tick = Date.now();
  // query all the mentors without waiting for the answers one by one
  const promises = mentorIds.map(mentor => {
    return new Promise<QuestionResponse>((resolve, reject) => {
      queryMentor(mentor, q.question)
        .then(r => {
          const { data } = r;
          const response: QuestionResponse = {
            answerId: data.answer_id,
            answerText: data.answer_text,
            answerClassifier: data.classifier,
            answerConfidence: data.confidence,
            answerIsOffTopic: data.confidence <= RESPONSE_CUTOFF,
            answerResponseTimeSecs: Number(Date.now() - tick) / 1000,
            mentor,
            question: q.question,
            questionSource: q.source,
            status: MentorQuestionStatus.ANSWERED,
          };
          dispatch(
            sendXapiStatement({
              result: {
                extensions: {
                  "https://mentorpal.org/xapi/verb/answered": {
                    ...response,
                    questionIndex: currentQuestionIndex(getState()),
                  },
                },
              },
              verb: "https://mentorpal.org/xapi/verb/answered",
            })
          );
          dispatch(onQuestionAnswered(response));
          resolve(response);
        })
        .catch((err: any) => {
          dispatch(onQuestionError(mentor, q.question));
          reject(err);
        });
    });
  });
  // ...but still don't move forward till we have all the answers,
  // because we will prefer the user's fav and then highest confidence
  const responses = (
    await Promise.all<QuestionResponse>(promises.map(p => p.catch(e => e)))
  ).filter(r => !(r instanceof Error));
  if (responses.length === 0) {
    return;
  }
  // Play favored mentor if an answer exists
  if (state.mentorFaved) {
    const fave_response = responses.find(response => {
      return response.mentor === state.mentorFaved;
    });
    if (!fave_response.answerIsOffTopic) {
      dispatch(selectMentor(state.mentorFaved, MentorSelectReason.USER_FAV));
      return;
    }
  }
  // Otherwise play mentor with highest confidence answer
  responses.sort((a, b) => (a.answerConfidence > b.answerConfidence ? -1 : 1));
  if (responses[0].answerIsOffTopic) {
    dispatch(
      selectMentor(
        state.mentorFaved ? state.mentorFaved : state.curMentor,
        state.mentorFaved
          ? MentorSelectReason.OFF_TOPIC_FAV
          : MentorSelectReason.OFF_TOPIC_CUR
      )
    );
    return;
  }
  dispatch(
    selectMentor(responses[0].mentor, MentorSelectReason.HIGHEST_CONFIDENCE)
  );
};

const NEXT_MENTOR_DELAY = 3000;
let timer: NodeJS.Timer | null;
export const answerFinished = () => (
  dispatch: ThunkDispatch<State, void, AnyAction>,
  getState: () => State
) => {
  dispatch(onIdle());
  // order mentors by highest answer confidence
  const state = getState();
  const mentors = state.mentorsById;
  const responses: {
    confidence: number;
    id: string;
    is_off_topic: boolean;
    status: MentorQuestionStatus;
  }[] = [];
  Object.keys(mentors).forEach(id => {
    responses.push({
      confidence: mentors[id].confidence || -1.0,
      id: mentors[id].id,
      is_off_topic: mentors[id].is_off_topic || false,
      status: mentors[id].status,
    });
  });
  responses.sort((a, b) => (a.confidence > b.confidence ? -1 : 1));
  // get the most confident answer that has not been given
  const mentorNext = responses.find(response => {
    return (
      response.status === MentorQuestionStatus.READY && !response.is_off_topic
    );
  });
  // set the next mentor to start playing, if there is one
  if (!mentorNext) {
    return;
  }
  dispatch(nextMentor(mentorNext.id));
  // play the next mentor after the timeout
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  timer = setTimeout(() => {
    dispatch(selectMentor(mentorNext.id, MentorSelectReason.NEXT_READY));
  }, NEXT_MENTOR_DELAY);
};

export const onInput: ActionCreator<ThunkAction<
  AnyAction,
  State,
  void,
  NextMentorAction
>> = () => (dispatch: Dispatch) => {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  return dispatch(nextMentor(""));
};

const onMentorAnswerPlaybackStarted = (
  mentor: string,
  duration: number
): MentorAnswerPlaybackStartedAction => ({
  type: MENTOR_ANSWER_PLAYBACK_STARTED,
  payload: {
    mentor,
    duration,
  },
});

const onQuestionSent = (payload: {
  question: string;
  source: MentorQuestionSource;
}): QuestionSentAction => ({
  payload,
  type: QUESTION_SENT,
});

function onQuestionAnswered(response: QuestionResponse) {
  return {
    mentor: response,
    type: QUESTION_ANSWERED,
  };
}

const onQuestionError = (id: string, question: string) => ({
  mentor: id,
  question,
  type: QUESTION_ERROR,
});

const onIdle = () => ({
  type: ANSWER_FINISHED,
});

const nextMentor = (id: string): NextMentorAction => ({
  mentor: id,
  type: MENTOR_NEXT,
});
