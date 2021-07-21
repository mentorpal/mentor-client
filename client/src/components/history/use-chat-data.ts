import { useState } from "react";
import { useSelector } from "react-redux";
import { ChatMsg, State } from "types";

export interface UseWithChatData {
  hideAllPref: boolean;
  visibiltityPrefByChatMessageId: Record<number, boolean>;
  toggleQuestionVisibilityPref: (questionId: number) => void;
  getItemVisibilityPref: (chatMsgId: number, dft: boolean) => boolean;
  updateNewMessages: (messages: ChatMsg[]) => void;
}

export function useWithChatData(): UseWithChatData {
  const [visibiltityPrefByChatMessageId, setVisibiltityPrefByChatMessageId] =
    useState<Record<number, boolean>>({});

  const hideAllPref = useSelector<State, boolean>((s) => s.chat.showAllAnswers);
  const numMentors = useSelector<State, number>(
    (s) => Object.keys(s.mentorsById).length
  );
  //const chatData = useSelector<State, ChatData>((s) => s.chat);

  function toggleQuestionVisibilityPref(questionId: number): void {
    const tempChatMap = JSON.parse(
      JSON.stringify(visibiltityPrefByChatMessageId)
    );
    for (let x = questionId; x <= questionId + numMentors; x++) {
      tempChatMap[x] = !tempChatMap[x];
    }
    setVisibiltityPrefByChatMessageId(tempChatMap);
  }

  function getItemVisibilityPref(chatMsgId: number, dft: boolean): boolean {
    return chatMsgId in visibiltityPrefByChatMessageId
      ? visibiltityPrefByChatMessageId[chatMsgId]
      : dft;
  }

  function updateNewMessages(messages: ChatMsg[]) {
    const tempChatMap = JSON.parse(
      JSON.stringify(visibiltityPrefByChatMessageId)
    );
    messages.map((m: ChatMsg, i: number) => {
      tempChatMap[i] = getItemVisibilityPref(i, false);
    });
    setVisibiltityPrefByChatMessageId(tempChatMap);
  }

  return {
    hideAllPref,
    visibiltityPrefByChatMessageId,
    toggleQuestionVisibilityPref,
    getItemVisibilityPref,
    updateNewMessages,
  };
}
