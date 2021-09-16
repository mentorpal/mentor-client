import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { rePlayAnswer } from "store/actions";

import {
  ChatLink,
  ChatMsg,
  LINK_TYPE_WEB,
  MentorSelectReason,
  MentorType,
  State,
} from "types";

export interface UseWithChatData {
  mentorType: string;
  lastQuestionId: string;
  visibilityShowAllPref: boolean;
  getQuestionVisibilityPref: (questionId: string) => ItemVisibilityPrefs;
  setQuestionVisibilityPref: (questionId: string, show: boolean) => void;
  setVisibilityShowAllPref: (show: boolean) => void;
  mentorNameForChatMsg: (chatMsg: ChatMsg) => string;
  rePlayQuestionVideo: (
    mId: string,
    answerId: string,
    answerText: string
  ) => void;
}

export enum ItemVisibilityPrefs {
  NONE = "NONE",
  VISIBLE = "VISIBLE",
  INVISIBLE = "INVISIBLE",
}

/**
 * Given an href return either an AskLink or a WebLink
 * depending on the scheme of the href (ask:// vs https://)
 */
export function hrefToChatLink(href: string, chatMsg: ChatMsg): ChatLink {
  return (
    chatMsg.askLinks?.find((x) => x.href === href) || {
      type: LINK_TYPE_WEB,
      href,
      answerId: chatMsg.answerId || "",
    }
  );
}

export function useWithChatData(): UseWithChatData {
  const mentorType = useSelector<State, MentorType>((state) => {
    if (!state.curMentor) {
      return MentorType.VIDEO;
    }
    return (
      state.mentorsById[state.curMentor]?.mentor?.mentorType || MentorType.VIDEO
    );
  });
  const [visibiltityPrefByQuestionId, setVisibiltityPrefByQuestionId] =
    useState<Record<string, ItemVisibilityPrefs>>({});
  const [visibilityShowAllPref, setVisibilityShowAllPref] = useState<boolean>(
    mentorType === "CHAT" ? true : false
  );
  const dispatch = useDispatch();

  const lastQuestionId = useSelector<State, string>((s) => {
    return s.chat.messages.length > 0
      ? s.chat.messages[s.chat.messages.length - 1].questionId
      : "";
  });

  useEffect(() => {
    // when the user toggle's their show-all pref,
    // it clears all their question-specific prefs,
    // but actually visibility can otherwise be calculated on the fly
    clearUserPrefs();
  }, [visibilityShowAllPref]);

  function setQuestionVisibilityPref(questionId: string, show: boolean): void {
    setVisibiltityPrefByQuestionId({
      ...visibiltityPrefByQuestionId,
      [questionId]: show
        ? ItemVisibilityPrefs.VISIBLE
        : ItemVisibilityPrefs.INVISIBLE,
    });
  }

  function clearUserPrefs() {
    setVisibiltityPrefByQuestionId({});
  }

  function getQuestionVisibilityPref(questionId: string): ItemVisibilityPrefs {
    return questionId in visibiltityPrefByQuestionId
      ? visibiltityPrefByQuestionId[questionId]
      : ItemVisibilityPrefs.NONE;
  }

  const mentorNameById = useSelector<State, Record<string, string>>((s) => {
    const mentorIds = Object.getOwnPropertyNames(s.mentorsById);
    mentorIds.sort();

    return mentorIds.reduce<Record<string, string>>((acc, cur) => {
      acc[cur] = s.mentorsById[cur].mentor.name;
      return acc;
    }, {});
  });

  function mentorNameForChatMsg(chatMsg: ChatMsg): string {
    if (!(chatMsg && chatMsg.mentorId)) {
      return "";
    }
    return mentorNameById[chatMsg.mentorId] || "";
  }

  function rePlayQuestionVideo(
    mId: string,
    answerId: string,
    answerText: string
  ) {
    dispatch(
      rePlayAnswer(mId, answerId, MentorSelectReason.REPLAY, answerText)
    );
  }

  return {
    mentorType,
    lastQuestionId,
    visibilityShowAllPref,
    getQuestionVisibilityPref,
    setQuestionVisibilityPref,
    setVisibilityShowAllPref,
    mentorNameForChatMsg,
    rePlayQuestionVideo,
  };
}
