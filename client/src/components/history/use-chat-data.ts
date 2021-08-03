import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { State } from "types";

export interface UseWithChatData {
  lastQuestionId: string;
  visibilityShowAllPref: boolean;
  getQuestionVisibilityPref: (questionId: string) => ItemVisibilityPrefs;
  setQuestionVisibilityPref: (questionId: string, show: boolean) => void;
  setVisibilityShowAllPref: (show: boolean) => void;
  mentorNameForChatMsg: Record<string, string>;
}

export enum ItemVisibilityPrefs {
  NONE = "NONE",
  VISIBLE = "VISIBLE",
  INVISIBLE = "INVISIBLE",
}

export function useWithChatData(): UseWithChatData {
  const [visibiltityPrefByQuestionId, setVisibiltityPrefByQuestionId] =
    useState<Record<string, ItemVisibilityPrefs>>({});
  const [visibilityShowAllPref, setVisibilityShowAllPref] =
    useState<boolean>(false);
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

  const mentorNameForChatMsg = useSelector<State, Record<string, string>>(
    (s) => {
      const mentorIds = Object.getOwnPropertyNames(s.mentorsById);
      mentorIds.sort();
      return mentorIds.reduce<Record<string, string>>((acc, cur) => {
        acc[cur] = s.mentorsById[cur].mentor.name;
        return acc;
      }, {});
    }
  );

  return {
    lastQuestionId,
    visibilityShowAllPref,
    getQuestionVisibilityPref,
    setQuestionVisibilityPref,
    setVisibilityShowAllPref,
    mentorNameForChatMsg,
  };
}
