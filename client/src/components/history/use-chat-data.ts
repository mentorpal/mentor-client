import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { ChatMsg, State } from "types";

export interface UseWithChatData {
  visibiltityPrefByChatMessageId: Record<number, ItemVisibilityPrefs>;
  toggleQuestionVisibilityPref: (questionId: number) => void;
  getItemVisibilityPref: (
    chatMsgId: number,
    dft: ItemVisibilityPrefs
  ) => ItemVisibilityPrefs;
  updateNewMessages: (messages: ChatMsg[]) => void;
  lastChatAnswerId: number;
}

export enum ItemVisibilityPrefs {
  NONE = "NONE",
  VISIBLE = "VISIBLE",
  INVISIBLE = "INVISIBLE",
}

export function useWithChatData(): UseWithChatData {
  const [visibiltityPrefByChatMessageId, setVisibiltityPrefByChatMessageId] =
    useState<Record<number, ItemVisibilityPrefs>>({});
  const hideAllPref = useSelector<State, boolean>((s) => s.chat.hideAllAnswers);
  const numMentors = useSelector<State, number>(
    (s) => Object.keys(s.mentorsById).length
  );
  const lastChatAnswerId = useSelector<State, number>(
    (s) =>
      s.questionsAsked.length - 2 + numMentors * (s.questionsAsked.length - 1)
  );

  useEffect(() => {
    clearUserPrefs();
  }, [hideAllPref]);

  function toggleQuestionVisibilityPref(questionId: number): void {
    const tempChatMap = JSON.parse(
      JSON.stringify(visibiltityPrefByChatMessageId)
    );
    for (let x = questionId; x <= questionId + numMentors; x++) {
      if (x > lastChatAnswerId && tempChatMap[x] === ItemVisibilityPrefs.NONE) {
        tempChatMap[x] = ItemVisibilityPrefs.INVISIBLE;
        continue;
      }
      switch (tempChatMap[x]) {
        case ItemVisibilityPrefs.NONE:
          tempChatMap[x] = ItemVisibilityPrefs.VISIBLE;
          break;
        case ItemVisibilityPrefs.VISIBLE:
          tempChatMap[x] = ItemVisibilityPrefs.INVISIBLE;
          break;
        case ItemVisibilityPrefs.INVISIBLE:
          tempChatMap[x] = ItemVisibilityPrefs.VISIBLE;
          break;
      }
    }
    setVisibiltityPrefByChatMessageId(tempChatMap);
  }

  function clearUserPrefs() {
    const tempChatMap = JSON.parse(
      JSON.stringify(visibiltityPrefByChatMessageId)
    );
    for (let i = 0; i < Object.keys(tempChatMap).length; i++) {
      if (!hideAllPref || i > lastChatAnswerId)
        tempChatMap[i] = ItemVisibilityPrefs.VISIBLE;
      else tempChatMap[i] = ItemVisibilityPrefs.INVISIBLE;
    }
    setVisibiltityPrefByChatMessageId(tempChatMap);
  }

  function getItemVisibilityPref(
    chatMsgId: number,
    dft: ItemVisibilityPrefs
  ): ItemVisibilityPrefs {
    return chatMsgId in visibiltityPrefByChatMessageId
      ? visibiltityPrefByChatMessageId[chatMsgId]
      : dft;
  }

  function updateNewMessages(messages: ChatMsg[]) {
    const tempChatMap = JSON.parse(
      JSON.stringify(visibiltityPrefByChatMessageId)
    );
    messages.map((m: ChatMsg, i: number) => {
      tempChatMap[i] = getItemVisibilityPref(i, ItemVisibilityPrefs.NONE);
    });
    setVisibiltityPrefByChatMessageId(tempChatMap);
  }

  return {
    visibiltityPrefByChatMessageId,
    toggleQuestionVisibilityPref,
    getItemVisibilityPref,
    updateNewMessages,
    lastChatAnswerId,
  };
}
