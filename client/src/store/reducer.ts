/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { normalizeString } from "utils";
import {
  ANSWER_FINISHED,
  VIDEO_FINISHED,
  FEEDBACK_SEND_SUCCEEDED,
  FEEDBACK_SENT,
  MENTOR_FAVED,
  MENTOR_ANSWER_PLAYBACK_STARTED,
  MENTOR_NEXT,
  MENTOR_SELECTED,
  QUESTION_ANSWERED,
  QUESTION_ERROR,
  QUESTION_INPUT_CHANGED,
  QUESTION_SENT,
  TOPIC_SELECTED,
  MentorClientAction,
  MentorSelectedAction,
  MentorAnswerPlaybackStartedAction,
  QuestionSentAction,
  GUEST_NAME_SET,
  ConfigLoadSucceededAction,
  CONFIG_LOAD_FAILED,
  CONFIG_LOAD_STARTED,
  CONFIG_LOAD_SUCCEEDED,
  MentorsLoadRequestedAction,
  MENTORS_LOAD_REQUESTED,
  QuestionInputChangedAction,
  NextMentorAction,
  MentorFavedAction,
  MentorsLoadResultAction,
  TopicSelectedAction,
  MENTORS_LOAD_RESULT,
  QuestionAnsweredAction,
  FeedbackSentAction,
  FEEDBACK_SEND_FAILED,
  FeedbackSendSucceededAction,
  FeedbackSendFailedAction,
  REPLAY_VIDEO,
  ReplayVideoAction,
  VideoFinishedAction,
  HISTORY_TOGGLE_VISIBILITY,
  CMI5_INIT,
  SET_CHAT_SESSION_ID,
} from "./actions";
import {
  MentorState,
  MentorQuestionSource,
  MentorQuestionStatus,
  State,
  MentorSelectReason,
  LoadStatus,
  Feedback,
  AskLink,
  LINK_TYPE_ASK,
  UtteranceName,
  WebLink,
  LINK_TYPE_WEB,
} from "types";
import { getUtterance } from "api";
import { v4 as uuid } from "uuid";

export const initialState: State = {
  chat: {
    messages: [],
    questionSent: false,
    lastQuestionCounter: 0,
  },
  config: {
    cmi5Enabled: false,
    cmi5Endpoint: process.env.CMI5_ENDPOINT || "/lrs/xapi",
    cmi5Fetch: process.env.CMI5_FETCH || "/lrs/auth/guesttoken",
    mentorsDefault: [],
    urlGraphql: process.env.MENTOR_GRAPHQL_URL || "/graphql",
    classifierLambdaEndpoint: process.env.CLASSIFIER_LAMBDA_ENDPOINT || "",
    urlVideo: process.env.MENTOR_VIDEO_URL || "/videos",
    styleHeaderLogo: process.env.HEADER_LOGO || "",
    styleHeaderColor: process.env.HEADER_COLOR || "",
    styleHeaderTextColor: process.env.HEADER_TEXT_COLOR || "",
    filterEmailMentorAddress: process.env.FILTER_EMAIL_MENTOR_ADDRESS || "",
    disclaimerTitle: process.env.DISCLAIMER_TITLE || "",
    disclaimerText: process.env.DISCLAIMER_TEXT || "",
    disclaimerDisabled:
      process.env.DISCLAIMER_DISABLED?.toLowerCase() === "true" || true,
    displayGuestPrompt: false,
    defaultVirtualBackground: "",
  },
  mentorAnswersLoadStatus: LoadStatus.NONE,
  mentorsInitialLoadStatus: LoadStatus.NONE,
  configLoadStatus: LoadStatus.NONE,
  guestName: "",
  curMentor: "", // id of selected mentor
  curMentorReason: MentorSelectReason.NONE,
  curQuestion: "", // question that was last asked
  curQuestionSource: MentorQuestionSource.NONE,
  curTopic: "", // topic to show questions for
  mentorFaved: "", // id of the preferred mentor
  isIdle: false,
  isCmi5Init: false,
  mentorsById: {},
  mentorNext: "", // id of the next mentor to speak after the current finishes
  recommendedQuestions: [],
  questionsAsked: [],
  questionInput: {
    question: "",
    source: MentorQuestionSource.NONE,
  },
  visibilityShowAllPref: false,
  replayMessageCount: 0,
  chatSessionId: "",
};

function mentorSelected(state: State, action: MentorSelectedAction): State {
  const mentorId = action.payload.id;

  return onMentorNext({
    ...(action.payload.setFav
      ? mentorFaved(state, { type: MENTOR_FAVED, id: action.payload.id })
      : state),

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
  });
}

function mentorFaved(state: State, action: MentorFavedAction): State {
  return {
    ...state,
    mentorFaved: state.mentorFaved === action.id ? "" : action.id,
  };
}

function feedbackUpdate(
  state: State,
  feedbackId: string,
  feedback: Feedback,
  inProgress: boolean
): State {
  return {
    ...state,
    chat: {
      ...state.chat,
      messages: state.chat.messages.map((m) => {
        return m.feedbackId === feedbackId
          ? {
              ...m,
              isFeedbackSendInProgress: inProgress,
              feedback: feedback,
            }
          : m;
      }),
    },
  };
}

function onFeedbackSent(state: State, action: FeedbackSentAction): State {
  return feedbackUpdate(
    state,
    action.payload.feedbackId,
    action.payload.feedback,
    true
  );
}

function onFeedbackSendSucceeded(
  state: State,
  action: FeedbackSendSucceededAction
): State {
  return feedbackUpdate(
    state,
    action.payload.feedbackId,
    action.payload.feedback,
    true
  );
}

function onFeedbackSendFailed(
  state: State,
  action: FeedbackSendFailedAction
): State {
  return feedbackUpdate(
    state,
    action.payload.feedbackId,
    action.payload.feedback,
    false
  );
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

function onMentorsLoadRequested(
  state: State,
  action: MentorsLoadRequestedAction
): State {
  return {
    ...state,
    mentorsInitialLoadStatus: LoadStatus.LOAD_IN_PROGRESS,
    mentorAnswersLoadStatus: LoadStatus.LOAD_IN_PROGRESS,
    recommendedQuestions: action.payload.recommendedQuestions || [],
  };
}

function onMentorLoadResults(
  state: State,
  action: MentorsLoadResultAction
): State {
  const firstActiveMentorId = action?.payload?.firstActiveMentorId;
  const mentorsToAddToState = Object.keys(action.payload.mentorsById);

  let stateCopy: State = JSON.parse(JSON.stringify(state));

  for (const mentor of mentorsToAddToState) {
    const mentorToAddToState = mentor;
    const curMentorData =
      action?.payload?.mentorsById[mentorToAddToState || ""]?.data?.mentor;
    const mentorName =
      action?.payload?.mentorsById[mentorToAddToState || ""]?.data?.mentor.name;
    const curMentorIntroTranscript = curMentorData
      ? getUtterance(curMentorData, UtteranceName.INTRO)?.transcript
      : "";

    const curMentorIntroAnswerId = curMentorData
      ? getUtterance(curMentorData, UtteranceName.INTRO)?._id
      : "";

    const curMentorIntroAnswerMedia = curMentorData
      ? getUtterance(curMentorData, UtteranceName.INTRO)?.media
      : [];
    const utterances = curMentorData?.utterances || [];
    stateCopy = {
      ...stateCopy,
      chat: {
        ...stateCopy.chat,
        messages: [
          ...stateCopy.chat.messages,
          {
            id: uuid(),
            name: mentorName || "name",
            color: "#fff",
            mentorId: mentorToAddToState || "",
            isIntro: true,
            isUser: false,
            text: curMentorIntroTranscript || "",
            questionId: "",
            feedback: Feedback.NONE,
            feedbackId: "",
            answerId: curMentorIntroAnswerId,
            answerMedia: curMentorIntroAnswerMedia,
            isFeedbackSendInProgress: false,
            utterances,
            isVideoInProgress: true,
            askLinks: findAskLinks(curMentorIntroTranscript || ""),
            webLinks: findWebLinks(
              curMentorIntroTranscript || "",
              curMentorIntroAnswerId || ""
            ),
          },
        ],
      },
    };
  }

  stateCopy.mentorsById = Object.getOwnPropertyNames(
    action.payload.mentorsById
  ).reduce((acc: Record<string, MentorState>, mid: string) => {
    acc[mid] = {
      ...stateCopy.mentorsById[mid],
      ...(action.payload.mentorsById[mid]?.data || {}),
      status: MentorQuestionStatus.READY,
    };
    return acc;
  }, {} as Record<string, MentorState>);

  if (firstActiveMentorId) {
    stateCopy = mentorSelected(stateCopy, {
      type: MENTOR_SELECTED,
      payload: {
        id: firstActiveMentorId,
        reason: MentorSelectReason.NEXT_READY,
      },
    });
  }
  if (action.payload.topic) {
    stateCopy = topicSelected(stateCopy, {
      type: TOPIC_SELECTED,
      topic: action.payload.topic,
    });
  }

  return {
    ...stateCopy,
    mentorsInitialLoadStatus: LoadStatus.LOADED,
    mentorAnswersLoadStatus: LoadStatus.LOADED,
  };
}

function onQuestionSent(state: State, action: QuestionSentAction): State {
  return scrapCurrentAnswers(
    onMentorNext(
      onQuestionInputChanged(
        {
          ...state,
          mentorAnswersLoadStatus: LoadStatus.LOAD_IN_PROGRESS,
          chat: {
            ...state.chat,
            messages: [
              ...state.chat.messages,
              {
                id: uuid(),
                name: "",
                color: "",
                mentorId: "",
                isIntro: false,
                isUser: true,
                text: action.payload.question,
                questionId: action.payload.questionId,
                feedback: Feedback.NONE,
                feedbackId: "",
                isFeedbackSendInProgress: false,
                questionCounter: state.questionsAsked.length + 1,
              },
            ],
            questionSent: true,
            lastQuestionCounter: state.questionsAsked.length + 1,
          },
          curQuestion: action.payload.question,
          curQuestionSource: action.payload.source,
          curQuestionUpdatedAt: Date.now(),
          questionsAsked: [
            ...state.questionsAsked,
            normalizeString(action.payload.question),
          ],
        },
        {
          type: QUESTION_INPUT_CHANGED,
          payload: {
            question: "",
            source: MentorQuestionSource.NONE,
          },
        }
      )
    )
  );
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

function onMentorNext(
  state: State,
  action: NextMentorAction | undefined = undefined
): State {
  return {
    ...state,
    mentorNext: action ? action.mentor : "",
  };
}

function scrapCurrentAnswers(state: State): State {
  const mentorIds = Object.keys(state.mentorsById);
  const stateCopy: State = JSON.parse(JSON.stringify(state));
  for (const mentorId of mentorIds) {
    stateCopy.mentorsById[mentorId] = {
      ...stateCopy.mentorsById[mentorId],
      status: MentorQuestionStatus.ANSWERED,
    };
  }
  return stateCopy;
}

function onToggleHistoryVisibility(state: State): State {
  return {
    ...state,
    visibilityShowAllPref: !state.visibilityShowAllPref,
  };
}

function onQuestionInputChanged(
  state: State,
  action: QuestionInputChangedAction
): State {
  // TODO: This used to be wrapped in nextMentor, why?
  return {
    ...state,
    questionInput: action.payload,
  };
}

function findWebLinks(text: string, answerId: string): WebLink[] {
  const REGEX_WEB_LINKS_ALL =
    /(https?:\/\/(?:www.|(?!www))[^\s.]+\.[^\s]{2,}|www.[^\s]+.[^\s]{2,})/gi;

  const webLinks: WebLink[] = (
    (text || "").match(REGEX_WEB_LINKS_ALL) || []
  ).map((wl) => {
    const link = wl.replace(")", "");
    return {
      type: LINK_TYPE_WEB,
      href: link,
      answerId: answerId,
    };
  });

  return webLinks;
}

function findAskLinks(text: string): AskLink[] {
  const REGEX_ASK_LINKS_ALL = /\(ask:\/\/([^)]*)\)/g;
  const REGEX_ASK_LINK = /ask:\/\/([^)]*)/;
  const askLinks: AskLink[] = (
    (text || "").match(REGEX_ASK_LINKS_ALL) || []
  ).map((linkWParens, i) => {
    const qmatch = linkWParens.match(REGEX_ASK_LINK);
    const question = qmatch && qmatch.length > 1 ? qmatch[1] : "";
    return {
      type: LINK_TYPE_ASK,
      href: `ask://${question}`,
      question: decodeURIComponent(question).replace(/\+/g, " "),
      askLinkIndex: i,
    };
  });

  return askLinks;
}

function onMentorDisplayAnswer(
  state: State,
  action: VideoFinishedAction
): State {
  return {
    ...state,
    chat: {
      ...state.chat,
      messages: state.chat.messages.map((m) => {
        return m.isVideoInProgress !== action.payload.isVideoInProgress &&
          m.mentorId === action.payload.curMentor
          ? {
              ...m,
              isVideoInProgress: action.payload.isVideoInProgress,
              timestampAnswered: action.payload.timestampAnswered,
            }
          : m;
      }),
    },
  };
}

function onQuestionAnswered(
  state: State,
  action: QuestionAnsweredAction
): State {
  // NOTE: about answerFeedbackId
  // It seems like the answerFeedbackId should be
  // associated to the chat message
  let stateCopy: State = JSON.parse(JSON.stringify(state));

  const responses = action.payload;
  for (const response of responses) {
    const mentor: MentorState = {
      ...stateCopy.mentorsById[response.mentor],
      // we need chat messages to live up here
      answer_id: response.answerId,
      answer_text: response.answerText,
      answer_media: response.answerMedia,
      answer_utterance_type: response.answerUtteranceType,
      answerReceivedAt: Date.now(),
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

    stateCopy = {
      ...stateCopy,
      chat: {
        ...stateCopy.chat,
        messages: [
          ...stateCopy.chat.messages,
          {
            id: uuid(),
            name: "",
            color: "",
            mentorId: response.mentor,
            isIntro: false,
            isUser: false,
            questionId: response.questionId,
            text: response.answerText,
            feedback: Feedback.NONE,
            feedbackId: response.answerFeedbackId,
            isFeedbackSendInProgress: false,
            isVideoInProgress: true,
            askLinks: findAskLinks(response.answerText),
            webLinks: findWebLinks(
              response.answerText,
              mentor?.answer_id || ""
            ),
            answerMedia: mentor.answer_media,
            answerId: mentor.answer_id,
            confidence: mentor.confidence,
            questionCounter: stateCopy.questionsAsked.length,
          },
        ],
        questionSent: false,
      },
      mentorsById: {
        ...stateCopy.mentorsById,
        [response.mentor]: mentor,
      },
    };
  }
  return { ...stateCopy, mentorAnswersLoadStatus: LoadStatus.LOADED };
}

function topicSelected(state: State, action: TopicSelectedAction): State {
  return {
    ...state,
    curTopic: action.topic,
  };
}

function onReplayVideo(state: State, action: ReplayVideoAction): State {
  const messageId = action.payload.messageId;
  const messageToReplay = state.chat.messages.find(
    (message) => message.id === messageId
  );
  if (!messageToReplay) {
    console.error(`could not find message with id ${messageId} to replay`);
    return state;
  }
  const mentorToReplay = messageToReplay.mentorId;
  const mediaToReplay = messageToReplay.answerMedia;
  if (!mediaToReplay) {
    console.error("No media to replay for message:", messageToReplay);
    return state;
  }

  // set all mentors answer status to NONE, to effectively cancel all other messages
  const stateCopy: State = JSON.parse(JSON.stringify(state));
  const mentorIds = Object.keys(stateCopy.mentorsById);
  mentorIds.forEach((mentorId) => {
    stateCopy.mentorsById[mentorId] = {
      ...stateCopy.mentorsById[mentorId],
      status: MentorQuestionStatus.ANSWERED,
    };
  });

  // update new curMentor with answer media
  stateCopy.mentorsById[mentorToReplay] = {
    ...stateCopy.mentorsById[mentorToReplay],
    answer_media: mediaToReplay,
    answer_text: messageToReplay.text,
    answer_id: messageToReplay.answerId,
  };

  // add web links
  stateCopy.chat.messages = stateCopy.chat.messages.map((message) => {
    return message.id === messageToReplay.id
      ? {
          ...message,
          askLinks: findAskLinks(messageToReplay.text),
          webLinks: findWebLinks(
            messageToReplay.text,
            messageToReplay.answerId || ""
          ),
        }
      : message;
  });

  stateCopy.replayMessageCount += 1;

  return mentorSelected(stateCopy, {
    type: MENTOR_SELECTED,
    payload: {
      id: messageToReplay.mentorId,
      reason: MentorSelectReason.REPLAY,
    },
  });
}

function onCmi5Init(state: State): State {
  return {
    ...state,
    isCmi5Init: true,
  };
}

export default function reducer(
  state = initialState,
  action: MentorClientAction
): State {
  switch (action.type) {
    case CONFIG_LOAD_FAILED:
      return onConfigLoadFailed(state);
    case CONFIG_LOAD_STARTED:
      return onConfigLoadStarted(state);
    case CONFIG_LOAD_SUCCEEDED:
      return onConfigLoadSucceeded(state, action);
    case FEEDBACK_SEND_FAILED:
      return onFeedbackSendFailed(state, action);
    case FEEDBACK_SEND_SUCCEEDED:
      return onFeedbackSendSucceeded(state, action);
    case FEEDBACK_SENT:
      return onFeedbackSent(state, action);
    case MENTOR_ANSWER_PLAYBACK_STARTED:
      return onMentorAnswerPlaybackStarted(state, action);
    case MENTORS_LOAD_REQUESTED:
      return onMentorsLoadRequested(state, action);
    case MENTORS_LOAD_RESULT:
      return onMentorLoadResults(state, action);
    case MENTOR_SELECTED:
      return mentorSelected(state, action);
    case MENTOR_FAVED:
      return mentorFaved(state, action);
    case MENTOR_NEXT:
      return onMentorNext(state, action);
    case HISTORY_TOGGLE_VISIBILITY:
      return onToggleHistoryVisibility(state);
    case QUESTION_SENT:
      return onQuestionSent(state, action);
    case QUESTION_ANSWERED:
      return onQuestionAnswered(state, action);
    case REPLAY_VIDEO:
      return onReplayVideo(state, action);
    case VIDEO_FINISHED:
      return onMentorDisplayAnswer(state, action);
    case QUESTION_ERROR:
      return {
        ...state,
        mentorsById: {
          ...state.mentorsById,
          [action.mentor]: {
            ...state.mentorsById[action.mentor],
            answerReceivedAt: Date.now(),
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
      return topicSelected(state, action);
    case GUEST_NAME_SET:
      return {
        ...state,
        guestName: action.name,
      };
    case SET_CHAT_SESSION_ID:
      return {
        ...state,
        chatSessionId: action.id,
      };
    case QUESTION_INPUT_CHANGED:
      return onQuestionInputChanged(state, action);
    case CMI5_INIT:
      return onCmi5Init(state);
    default:
      return state;
  }
}
