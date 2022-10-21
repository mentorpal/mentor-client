/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
/* eslint-disable */
import Cmi5 from "@kycarr/cmi5";
import { Statement } from "@kycarr/cmi5/node_modules/@xapi/xapi/dist/types/interfaces/Statement";
import { ActionCreator, AnyAction, Dispatch } from "redux";
import { ThunkAction, ThunkDispatch } from "redux-thunk";
import * as uuid from "uuid";

import {
  fetchConfig,
  fetchMentor,
  getUtterance,
  giveFeedback,
  queryMentor,
} from "api";
import { getCmiParams } from "cmiutils";
import {
  MentorsLoadRequest,
  MentorsLoadResult,
  MentorQuestionStatus,
  MentorSelection,
  MentorSelectReason,
  QuestionResponse,
  QuestionResult,
  ResultStatus,
  MentorState,
  MentorQuestionSource,
  State,
  XapiResultExt,
  XapiResultAnswerStatusByMentorId,
  Config,
  UtteranceName,
  MentorClientData,
  QuestionInput,
  MentorDataResult,
  Feedback,
  TopicQuestions,
  Media,
} from "../types";
import {
  getLocalStorage,
  getRecommendedTopics,
  getRegistrationId,
  mergeRecommendedTopicsQuestions,
} from "utils";

const RESPONSE_CUTOFF = -100;
export const REPLAY_VIDEO = "REPLAY_VIDEO";
export const PLAY_IDLE_AFTER_REPLAY_VIDEO = "PLAY_IDLE_AFTER_REPLAY_VIDEO";
export const ANSWER_FINISHED = "ANSWER_FINISHED"; // mentor video has finished playing
export const VIDEO_FINISHED = "VIDEO_FINISHED"; // mentor video has finished playing
export const CONFIG_LOAD_FAILED = "CONFIG_LOAD_FAILED";
export const CONFIG_LOAD_STARTED = "CONFIG_LOAD_STARTED";
export const CONFIG_LOAD_SUCCEEDED = "CONFIG_LOAD_SUCCEEDED";
export const FEEDBACK_SENT = "FEEDBACK_SENT"; // mentor video has finished playing
export const FEEDBACK_SEND_FAILED = "FEEDBACK_SEND_FAILED"; // mentor video has finished playing
export const FEEDBACK_SEND_SUCCEEDED = "FEEDBACK_SEND_SUCCEEDED"; // mentor video has finished playing
export const MENTOR_ANSWER_PLAYBACK_STARTED = "MENTOR_ANSWER_PLAYBACK_STARTED";
export const MENTORS_LOAD_REQUESTED = "MENTORS_LOAD_REQUESTED";
export const MENTORS_LOAD_RESULT = "MENTORS_LOAD_RESULT";
export const MENTOR_FAVED = "MENTOR_FAVED"; // mentor was favorited
export const MENTOR_NEXT = "MENTOR_NEXT"; // set next mentor to play after current
export const MENTOR_SELECTED = "MENTOR_SELECTED"; // mentor video was selected
export const QUESTION_ANSWERED = "QUESTION_ANSWERED"; // question was answered by mentor
export const QUESTION_ERROR = "QUESTION_ERROR"; // question could not be answered by mentor
export const QUESTION_INPUT_CHANGED = "QUESTION_INPUT_CHANGED";
export const QUESTION_RESULT = "QUESTION_RESULT";
export const QUESTION_SENT = "QUESTION_SENT"; // question input was sent
export const TOPIC_SELECTED = "TOPIC_SELECTED";
export const GUEST_NAME_SET = "GUEST_NAME_SET";
export const CMI5_INIT_STARTED = "CMI5_INIT_STARTED";
export const CMI5_INIT_SUCCEEDED = "CMI5_INIT_SUCCEEDED";
export const CMI5_INIT_FAILED = "CMI5_INIT_FAILED";
export const HISTORY_TOGGLE_VISIBILITY = "HISTORY_TOGGLE_VISIBILITY";

export interface Cmi5InitStartedAction {
  type: typeof CMI5_INIT_STARTED;
}
export interface Cmi5InitFailedAction {
  type: typeof CMI5_INIT_FAILED;
  errors: string[];
}
export interface Cmi5InitSucceededAction {
  type: typeof CMI5_INIT_SUCCEEDED;
  payload: Cmi5;
}
export type Cmi5InitAction =
  | Cmi5InitStartedAction
  | Cmi5InitFailedAction
  | Cmi5InitSucceededAction;

export interface AnswerFinishedAction {
  type: typeof ANSWER_FINISHED;
}

export interface ConfigLoadFailedAction {
  type: typeof CONFIG_LOAD_FAILED;
  errors: string[];
}

export interface ConfigLoadStartedAction {
  type: typeof CONFIG_LOAD_STARTED;
}

export interface ConfigLoadSucceededAction {
  type: typeof CONFIG_LOAD_SUCCEEDED;
  payload: Config;
}

export interface FeedbackSendFailedAction {
  type: typeof FEEDBACK_SEND_FAILED;
  payload: {
    errors: string[];
    feedbackId: string;
    feedback: Feedback;
  };
}

export interface FeedbackSendSucceededAction {
  type: typeof FEEDBACK_SEND_SUCCEEDED;
  payload: {
    feedbackId: string;
    feedback: Feedback;
  };
}

export interface FeedbackSentAction {
  type: typeof FEEDBACK_SENT;
  payload: {
    feedbackId: string;
    feedback: Feedback;
  };
}

export type FeedbackAction =
  | FeedbackSendFailedAction
  | FeedbackSendSucceededAction
  | FeedbackSentAction;

export type ConfigLoadAction =
  | ConfigLoadFailedAction
  | ConfigLoadStartedAction
  | ConfigLoadSucceededAction;

export interface MentorAnswerPlaybackStartedAction {
  type: typeof MENTOR_ANSWER_PLAYBACK_STARTED;
  payload: {
    mentor: string;
    duration: number;
  };
}

export interface MentorsLoadRequestedAction {
  type: typeof MENTORS_LOAD_REQUESTED;
  payload: MentorsLoadRequest;
}

export interface MentorsLoadResultAction {
  type: typeof MENTORS_LOAD_RESULT;
  payload: MentorsLoadResult;
}

export type MentorDataAction =
  | MentorsLoadRequestedAction
  | MentorsLoadResultAction;

export interface MentorFavedAction {
  type: typeof MENTOR_FAVED;
  id: string;
}

export interface MentorSelectedAction {
  type: typeof MENTOR_SELECTED;
  payload: MentorSelection;
}

export interface NextMentorAction {
  type: typeof MENTOR_NEXT;
  mentor: string;
}

export interface ToggleHistoryVisibilityAction {
  type: typeof HISTORY_TOGGLE_VISIBILITY;
}

export type MentorAction =
  | AnswerFinishedAction
  | MentorAnswerPlaybackStartedAction
  | MentorFavedAction
  | MentorSelectedAction
  | NextMentorAction;

export interface QuestionAnsweredAction {
  type: typeof QUESTION_ANSWERED;
  payload: QuestionResponse[];
}

export interface VideoFinishedAction {
  type: typeof VIDEO_FINISHED;
  payload: {
    isVideoInProgress: boolean;
    curMentor: string;
    lastQuestion: number;
    timestampAnswered: number;
  };
}

export interface QuestionErrorAction {
  type: typeof QUESTION_ERROR;
  mentor: string;
  question: string;
}

export interface QuestionResultAction {
  type: typeof QUESTION_RESULT;
  payload: QuestionResult;
}

export interface QuestionSentAction {
  type: typeof QUESTION_SENT;
  payload: {
    question: string;
    questionId: string;
    source: MentorQuestionSource;
  };
}

export interface ReplayVideoAction {
  type: typeof REPLAY_VIDEO;
  payload: {
    messageId: string;
  };
}

export type QuestionAction =
  | QuestionAnsweredAction
  | QuestionErrorAction
  | QuestionResultAction
  | QuestionSentAction
  | VideoFinishedAction;

export interface GuestNameSetAction {
  type: typeof GUEST_NAME_SET;
  name: string;
}

export interface TopicSelectedAction {
  type: typeof TOPIC_SELECTED;
  topic: string;
}

export interface QuestionInputChangedAction {
  type: typeof QUESTION_INPUT_CHANGED;
  payload: QuestionInput;
}

export type MentorClientAction =
  | Cmi5InitAction
  | ConfigLoadAction
  | FeedbackAction
  | GuestNameSetAction
  | MentorDataAction
  | MentorAction
  | QuestionAction
  | TopicSelectedAction
  | QuestionInputChangedAction
  | ReplayVideoAction
  | ToggleHistoryVisibilityAction;

export const MENTOR_SELECTION_TRIGGER_AUTO = "auto";
export const MENTOR_SELECTION_TRIGGER_USER = "user";

function stripNonAsciiCharacters(input: string): string {
  const regex = new RegExp("[^\x00-\x7F]+");
  return input.replace(regex, "");
}

export const initCmi5 =
  (userID: string, userEmail: string, homePage: string, config: Config) =>
  async (dispatch: ThunkDispatch<State, void, Cmi5InitAction>) => {
    dispatch({
      type: CMI5_INIT_STARTED,
    });
    if (!userID && !userEmail) {
      return dispatch({
        type: CMI5_INIT_FAILED,
        errors: ["No user id or user email passed in"],
      });
    }
    const launchParams = getCmiParams(userID, userEmail, homePage, config);
    try {
      const cmi5 = new Cmi5(launchParams);
      await cmi5.initialize();
      return dispatch({
        type: CMI5_INIT_SUCCEEDED,
        payload: cmi5,
      });
    } catch (err) {
      console.error(
        err,
        `Failed to init cmi5 with params ${launchParams}, cleaning email of non-ascii domain if none exists`
      );
      if (launchParams.actor.mbox) {
        launchParams.actor.mbox = stripNonAsciiCharacters(
          launchParams.actor.mbox
        );
        // Append email domain if one does not exist
        if (!launchParams.actor.mbox.includes("@")) {
          launchParams.actor.mbox += "@mentorpal.org";
        }
      }
      try {
        const cmi5_recovery_1 = new Cmi5(launchParams);
        await cmi5_recovery_1.initialize();
        return dispatch({
          type: CMI5_INIT_SUCCEEDED,
          payload: cmi5_recovery_1,
        });
      } catch (err) {
        console.error(
          err,
          `Failed to init cmi5 with cleaned mbox ${launchParams.actor.mbox}, going with default`
        );
        if (launchParams.actor.mbox) {
          launchParams.actor.mbox = `${userID}.guest@mentorpal.org`;
        }
        try {
          const cmi5_recovery_2 = new Cmi5(launchParams);
          await cmi5_recovery_2.initialize();
          return dispatch({
            type: CMI5_INIT_SUCCEEDED,
            payload: cmi5_recovery_2,
          });
        } catch (err) {
          if (err instanceof Error) {
            return dispatch({
              type: CMI5_INIT_FAILED,
              errors: [err.message],
            });
          }
        }
      }
    }
  };

export const onMentorDisplayAnswer =
  (
    isVideoInProgress: boolean,
    curMentor: string,
    lastQuestion: number,
    timestampAnswered: number
  ) =>
  async (dispatch: ThunkDispatch<State, void, VideoFinishedAction>) => {
    dispatch({
      type: VIDEO_FINISHED,
      payload: {
        isVideoInProgress,
        curMentor,
        lastQuestion,
        timestampAnswered,
      },
    });
  };

export const feedbackSend =
  (feedbackId: string, feedback: Feedback) =>
  async (
    dispatch: ThunkDispatch<State, void, FeedbackAction>,
    getState: () => State
  ) => {
    dispatch({
      type: FEEDBACK_SENT,
      payload: {
        feedback,
        feedbackId,
      },
    });
    try {
      await giveFeedback(feedbackId, feedback);
      return dispatch({
        type: FEEDBACK_SEND_SUCCEEDED,
        payload: {
          feedback,
          feedbackId,
        },
      });
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        return dispatch({
          type: FEEDBACK_SEND_FAILED,
          payload: {
            errors: [err.message],
            feedback,
            feedbackId,
          },
        });
      }
    }
  };

export const loadConfig =
  () => async (dispatch: ThunkDispatch<State, void, ConfigLoadAction>) => {
    dispatch({
      type: CONFIG_LOAD_STARTED,
    });
    try {
      const config = await fetchConfig();
      return dispatch({
        type: CONFIG_LOAD_SUCCEEDED,
        payload: config,
      });
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        return dispatch({
          type: CONFIG_LOAD_FAILED,
          errors: [err.message],
        });
      }
    }
  };

export const loadMentors: ActionCreator<
  ThunkAction<
    Promise<void>, // The type of the last action to be dispatched - will always be promise<T> for async actions
    State, // The type for the data within the last action
    void, // The type of the parameter for the nested function
    MentorsLoadResultAction // The type of the last action to be dispatched
  >
> =
  (args: {
    config: Config;
    mentors: string[];
    subject?: string;
    intro?: string;
    recommendedQuestions?: string[];
  }) =>
  async (
    dispatch: ThunkDispatch<State, void, AnyAction>,
    getState: () => State
  ) => {
    const { intro, mentors, subject, recommendedQuestions } = args;
    dispatch<MentorsLoadRequestedAction>({
      type: MENTORS_LOAD_REQUESTED,
      payload: {
        mentors,
        recommendedQuestions: recommendedQuestions || [],
      },
    });
    const mentorLoadResult: MentorsLoadResult = {
      mentorsById: mentors.reduce(
        (acc: Record<string, MentorDataResult>, cur: string) => {
          acc[cur] = {
            status: ResultStatus.FAILED,
          };
          return acc;
        },
        {}
      ),
    };
    const mentorRequests = mentors.map(async (mentorId) => {
      try {
        const mentor: MentorClientData = await fetchMentor(mentorId, subject);
        const topicQuestions: TopicQuestions[] = [];
        const recommendedQuestions = [...getState().recommendedQuestions];
        topicQuestions.push(...mentor.topicQuestions);
        const recommendedTopics = getRecommendedTopics(topicQuestions);

        // RECOMMENDED QUESTIONS AND TOPICS
        if (recommendedTopics && recommendedQuestions.length > 0) {
          const recommendedQuestionsTopics = mergeRecommendedTopicsQuestions(
            recommendedTopics.questions,
            recommendedQuestions
          );
          topicQuestions.unshift(recommendedQuestionsTopics);
        }

        // RECOMMENDED QUESTIONS ONLY
        if (recommendedQuestions.length > 0 && !recommendedTopics) {
          topicQuestions.unshift({
            topic: "Recommended",
            questions: recommendedQuestions,
          });
        }

        // RECOMMENDED TOPICS ONLY
        if (recommendedTopics && recommendedQuestions.length === 0) {
          // add recommended topics with questions to mentor topics
          topicQuestions.unshift(recommendedTopics);
        }

        topicQuestions.push({ topic: "History", questions: [] });

        const introUtterance = getUtterance(mentor, UtteranceName.INTRO);
        if (intro && introUtterance) {
          introUtterance.transcript = intro;
        }
        const mentorData: MentorState = {
          mentor: mentor,
          topic_questions: topicQuestions,
          status: MentorQuestionStatus.ANSWERED, // move this out of mentor data
          answer_id: introUtterance?._id,
          answer_media: introUtterance?.media || [],
          answer_utterance_type: UtteranceName.INTRO,
          utterances: mentor.utterances,
          answerDuration: Number.NaN,
        };
        mentorLoadResult.mentorsById[mentorId] = {
          data: mentorData,
          status: ResultStatus.SUCCEEDED,
        };
      } catch (mentorErr) {
        console.error(mentorErr);
      }
    });
    await Promise.all(mentorRequests); //requests all mentors in parallel
    mentorLoadResult.firstActiveMentorId = mentors.find(
      (id) => mentorLoadResult.mentorsById[id].status === ResultStatus.SUCCEEDED
    );
    if (mentorLoadResult.firstActiveMentorId) {
      const tqs =
        mentorLoadResult.mentorsById[mentorLoadResult.firstActiveMentorId]?.data
          ?.topic_questions;
      if (tqs && tqs.length > 0) {
        const recommendedQuestions = getState().recommendedQuestions;
        let mentorType: string | undefined = "";
        for (const mentor in mentorLoadResult.mentorsById) {
          mentorType =
            mentorLoadResult?.mentorsById[mentor]?.data?.mentor.mentorType;
        }
        mentorLoadResult.topic =
          recommendedQuestions?.length > 0 || mentorType === "CHAT"
            ? tqs[0].topic
            : tqs[tqs.length - 1].topic;
      }
    }
    const curState = getState();
    if (
      curState.chat.messages.length <
      Object.keys(mentorLoadResult.mentorsById).length
    ) {
      dispatch<MentorsLoadResultAction>({
        type: MENTORS_LOAD_RESULT,
        payload: mentorLoadResult,
      });
    }

    return;
  };

export function sendCmi5Statement(
  statement: Partial<Statement>,
  cmi5?: Cmi5
): void {
  if (!cmi5 && !Cmi5.isCmiAvailable) {
    return;
  }
  try {
    const cmi = cmi5 || Cmi5.instance;
    const statementData = {
      ...statement,
      context: { registration: getRegistrationId() },
    };
    cmi
      .sendCmi5AllowedStatement(statementData)
      .catch((err: Error) => console.error(JSON.stringify(err, null, " ")));
  } catch (err2) {
    console.error(JSON.stringify(err2));
  }
}

function toXapiResultExt(mentorData: MentorState, state: State): XapiResultExt {
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
          mentor: state.mentorsById[cur].mentor._id,
          status: state.mentorsById[cur].status,
          responseTimeSecs: Number(mentorData.response_time) / 1000,
        };
        return acc;
      },
      {}
    ),
    answerText: mentorData.answer_text || "",
    mentorCur: mentorData.mentor._id,
    mentorCurReason: state.curMentorReason,
    mentorCurStatus: mentorData.status,
    mentorCurIsFav: state.mentorFaved === mentorData.mentor._id,
    mentorFaved: state.mentorFaved,
    mentorNext: state.mentorNext,
    mentorTopicDisplayed: state.curTopic,
    questionsAsked: state.questionsAsked,
    question: state.curQuestion,
    questionSource: state.curQuestionSource,
    questionIndex: currentQuestionIndex(state),
    timestampAnswered: state.curQuestionUpdatedAt,
    timestampAsked: mentorData.answerReceivedAt,
  };
}

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
    sendCmi5Statement(
      {
        verb: {
          id: "https://mentorpal.org/xapi/verb/answer-playback-started",
          display: {
            "en-US": "answer-playback-started",
          },
        },
        result: {
          extensions: {
            "https://mentorpal.org/xapi/verb/answer-playback-started":
              toXapiResultExt(mentorData, curState),
          },
        },
        object: {
          id: `${window.location.protocol}//${window.location.host}`,
          objectType: "Activity",
        },
      },
      curState.cmi5
    );
  };
}

export const rePlayAnswer =
  (messageId: string) =>
  async (
    dispatch: ThunkDispatch<State, void, AnyAction>,
    getState: () => State
  ) => {
    return dispatch({
      payload: {
        messageId,
      },
      type: REPLAY_VIDEO,
    });
  };

export const selectMentor =
  (mentor: string, reason: MentorSelectReason, setFav = false) =>
  (dispatch: ThunkDispatch<State, void, MentorSelectedAction>) => {
    clearNextMentorTimer();
    return dispatch({
      payload: {
        id: mentor,
        reason,
        setFav,
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

export const setGuestName = (name: string) => ({
  name,
  type: GUEST_NAME_SET,
});

const currentQuestionIndex = (state: { questionsAsked: { length: any } }) =>
  Array.isArray(state.questionsAsked) ? state.questionsAsked.length : -1;

export const sendQuestion =
  (q: { question: string; source: MentorQuestionSource; config: Config }) =>
  async (
    dispatch: ThunkDispatch<State, void, AnyAction>,
    getState: () => State
  ) => {
    const localData = getLocalStorage("userData");
    const userEmail = JSON.parse(localData ? localData : "{}").userEmail;
    const curState = getState();

    sendCmi5Statement(
      {
        verb: {
          id: "https://mentorpal.org/xapi/verb/asked",
          display: {
            "en-US": "asked",
          },
        },
        result: {
          extensions: {
            "https://mentorpal.org/xapi/verb/asked": {
              questionIndex: currentQuestionIndex(getState()) + 1,
              text: q.question,
              source: q.source,
              userEmail: userEmail,
            },
          },
        },
        object: {
          id: `${window.location.protocol}//${window.location.host}`,
          objectType: "Activity",
        },
      },
      curState.cmi5
    );
    const questionId = uuid.v4();
    clearNextMentorTimer();
    dispatch(onQuestionSent({ ...q, questionId }));
    const state = getState();
    const mentorIds = Object.keys(state.mentorsById);
    const tick = Date.now();
    // query all the mentors without waiting for the answers one by one
    const promises = mentorIds.map((mentor) => {
      return new Promise<QuestionResponse>((resolve, reject) => {
        queryMentor(mentor, q.question, q.config)
          .then((r) => {
            const { data } = r;
            const answer_media: Media[] = [];
            const { web_media, mobile_media, vtt_media } = data.answer_media;
            if (web_media) {
              answer_media.push(web_media);
            }
            if (mobile_media) {
              answer_media.push(mobile_media);
            }
            if (vtt_media) {
              answer_media.push(vtt_media);
            }
            const response: QuestionResponse = {
              answerId: data.answer_id,
              answerText: data.answer_markdown_text,
              answerMedia: answer_media,
              answerClassifier: data.classifier,
              answerConfidence: data.confidence,
              answerIsOffTopic: data.confidence <= RESPONSE_CUTOFF,
              answerFeedbackId: data.feedback_id,
              answerUtteranceType: "", //TODO: need to update classifier to also respond with utterance type
              answerResponseTimeSecs: Number(Date.now() - tick) / 1000,
              mentor,
              question: q.question,
              questionId,
              questionSource: q.source,
              status: MentorQuestionStatus.ANSWERED,
            };
            sendCmi5Statement(
              {
                verb: {
                  id: "https://mentorpal.org/xapi/verb/answered",
                  display: {
                    "en-US": "answered",
                  },
                },
                result: {
                  extensions: {
                    "https://mentorpal.org/xapi/verb/answered": {
                      ...response,
                      questionIndex: currentQuestionIndex(getState()),
                    },
                  },
                },
                object: {
                  id: `${window.location.protocol}//${window.location.host}`,
                  objectType: "Activity",
                },
              },
              state.cmi5
            );
            resolve(response);
          })
          .catch((err: any) => {
            console.error(err);
            const mentorState = state.mentorsById[mentor];
            const offTopicUtterance = mentorState.utterances.find(
              (u) => u.name === UtteranceName.OFF_TOPIC
            );
            const response: QuestionResponse = {
              answerId: offTopicUtterance?._id || "",
              answerText: offTopicUtterance?.transcript || "",
              answerMedia: offTopicUtterance?.media || [],
              answerClassifier: "",
              answerConfidence: 0,
              answerIsOffTopic: false,
              answerFeedbackId: "",
              answerUtteranceType: "",
              answerResponseTimeSecs: Number(Date.now() - tick) / 1000,
              mentor,
              question: q.question,
              questionId,
              questionSource: q.source,
              status: MentorQuestionStatus.ERROR,
            };
            resolve(response);
          });
      });
    });
    // ...but still don't move forward till we have all the answers,
    // because we will prefer the user's fav and then highest confidence
    const responses = (
      await Promise.all<QuestionResponse>(
        promises.map((p) => p.catch((e) => e))
      )
    ).filter((r) => !(r instanceof Error));
    dispatch(onQuestionAnswered(responses));
    if (responses.length === 0) {
      return;
    }
    // Play favored mentor if an answer exists
    if (state.mentorFaved) {
      const favResponse = responses.find((response) => {
        return response.mentor === state.mentorFaved;
      });
      if (favResponse && !favResponse.answerIsOffTopic) {
        dispatch(selectMentor(state.mentorFaved, MentorSelectReason.USER_FAV));
        return;
      }
    }
    // Otherwise play mentor with highest confidence answer
    responses.sort((a, b) =>
      a.answerConfidence > b.answerConfidence ? -1 : 1
    );
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

const NEXT_MENTOR_DELAY = 1000;
let timer: NodeJS.Timer | null;
export const answerFinished =
  () =>
  (dispatch: ThunkDispatch<State, void, AnyAction>, getState: () => State) => {
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
    Object.keys(mentors).forEach((id) => {
      responses.push({
        confidence: mentors[id].confidence || -1.0,
        id: mentors[id].mentor._id,
        is_off_topic: mentors[id].is_off_topic || false,
        status: mentors[id].status,
      });
    });
    responses.sort((a, b) => (a.confidence > b.confidence ? -1 : 1));
    // get the most confident answer that has not been given
    const mentorNext = responses.find((response) => {
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
    clearNextMentorTimer();
    timer = setTimeout(() => {
      dispatch(selectMentor(mentorNext.id, MentorSelectReason.NEXT_READY));
    }, NEXT_MENTOR_DELAY);
  };

function clearNextMentorTimer(): void {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}

export const userInputChanged: ActionCreator<
  ThunkAction<AnyAction, State, void, QuestionInputChangedAction>
> = (userInput: String) => (dispatch: Dispatch) => {
  clearNextMentorTimer();
  return dispatch({
    type: QUESTION_INPUT_CHANGED,
    payload: userInput,
  });
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

export const onQuestionSent = (payload: {
  question: string;
  questionId: string;
  source: MentorQuestionSource;
}): QuestionSentAction => ({
  payload,
  type: QUESTION_SENT,
});

export function onQuestionAnswered(responses: QuestionResponse[]) {
  return {
    payload: responses,
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

export const toggleHistoryVisibility = (): ToggleHistoryVisibilityAction => ({
  type: HISTORY_TOGGLE_VISIBILITY,
});
