/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { useSelector } from "react-redux";
import { List } from "@mui/material";
import { makeStyles } from "tss-react/mui";

import { ChatData, ChatMsg, MentorType, State } from "types";
import "styles/history-chat.css";
import "styles/history-chat-responsive.css";
import ChatItem, { ChatItemData } from "./chat-item";
import { ItemVisibilityPrefs, useWithChatData } from "./use-chat-data";

const MENTOR_COLORS = [
  "#d4e8d9", // light green
  "#ffb8f0", // light purple
  "#ffebcf", // light orange
  "#f5cccd", // light red
  "#aaffc3", // mint
  "#ffffd6", // light yellow
  "#ffd6fd", // light pink
  "#b8bfff", // light blue
  "#d6ffec", // seafoam green
  "#ffd8b1", // apricot
];

function Chat(props: {
  isMobile: boolean;
  height?: number;
  windowHeight?: number;
  width?: string;
  bubbleColor?: string;
}): JSX.Element {
  const { width, bubbleColor, isMobile } = props;
  const useStyles = makeStyles({ name: { Chat } })((theme) => ({
    root: {
      width: "auto",
    },
    list: {
      marginTop: 1,
      padding: isMobile ? 0 : 10,
      borderRadius: 10,
    },
    avatar: {
      width: theme.spacing(4),
      height: theme.spacing(4),
      backgroundColor: "#88929e",
    },
    GOOD: {
      backgroundColor: "#00bf00",
    },
    BAD: {
      backgroundColor: "#E63535",
    },
    icon: {
      position: "absolute",
      right: -40,
    },
    feedbackPopup: {
      borderRadius: "30px",
    },
    chat_container: {
      margin: "1rem",
      marginTop: 0,
      borderRadius: 10,
    },
    chat_container_mobile: {
      border: 0,
    },
    introMsg: {
      marginLeft: "0rem !important",
    },
    visibilityBtn: {
      marginLeft: "5px",
    },
  }));
  const { classes: styles } = useStyles();
  const {
    mentorType,
    lastQuestionId,
    visibilityShowAllPref,
    getQuestionVisibilityPref,
    setQuestionVisibilityPref,
    mentorNameForChatMsg,
    rePlayQuestionVideo,
    mentorNameById,
  } = useWithChatData();

  const numMentors = Object.keys(mentorNameById).length;

  const colorByMentorId = useSelector<State, Record<string, string>>((s) => {
    const mentorIds = Object.getOwnPropertyNames(s.mentorsById);
    mentorIds.sort();
    return mentorIds.reduce<Record<string, string>>((acc, cur, i) => {
      acc[cur] = MENTOR_COLORS[i % MENTOR_COLORS.length];
      return acc;
    }, {});
  });

  const lastQuestionCounter = useSelector<State, number>(
    (s) => s.chat.lastQuestionCounter || s.questionsAsked.length + 1
  );

  const chatData = useSelector<State, ChatData>((s) => s.chat);
  function isQuestionsAnswersVisible(
    questionId: string,
    isIntro: boolean
  ): boolean {
    if (isIntro) {
      return true;
    }
    const userPref = getQuestionVisibilityPref(questionId);
    /**
     * RULE #1: if this is the most recent question,
     * it will be visible REGARDLESS of the user's SHOW ALL pref
     * UNLESS the user explicitly seleced to hide the answers
     */

    if (questionId === lastQuestionId) {
      return Boolean(userPref !== ItemVisibilityPrefs.INVISIBLE);
    }
    return visibilityShowAllPref
      ? /**
         * RULE #2: if the user set SHOW ALL,
         * then only hide answers if the user explicitly hid them
         */

        Boolean(userPref !== ItemVisibilityPrefs.INVISIBLE)
      : /**
         * RULE #3: if the user did NOT set SHOW ALL toggle,
         * then only SHOW answers if the user explicitly asked to SHOW them
         */

        Boolean(userPref === ItemVisibilityPrefs.VISIBLE);
  }

  if (mentorType !== "CHAT") {
    // get last answers
    const lastAnswers = chatData.messages.filter((m) => {
      return m.questionCounter === lastQuestionCounter && !m.isUser;
    });

    // sort last answers by timestampAnswered
    const answersSorted = lastAnswers.sort((a, b) =>
      String(a.timestampAnswered).localeCompare(String(b.timestampAnswered))
    );

    // remove unsorted answers
    chatData.messages.splice(
      chatData.messages.length - Object.keys(answersSorted).length,
      chatData.messages.length
    );

    // add sorted answers to chat
    chatData.messages.push(...answersSorted);
  }

  return (
    <div
      data-cy="history-chat"
      id="history-chat"
      data-topic="History"
      className={
        !isMobile ? styles.chat_container : styles.chat_container_mobile
      }
    >
      <List
        data-cy="chat-thread"
        className={
          mentorType === MentorType.CHAT
            ? ["chat-thread", "chat-only"].join(" ")
            : "chat-thread"
        }
        style={{
          width: isMobile ? "100%" : width ? width : "40vw",
          padding: isMobile ? 0 : 10,
        }}
        disablePadding={true}
        id="chat-thread"
      >
        {chatData.messages.map((m: ChatMsg, i: number) => {
          const itemData: ChatItemData = {
            ...m,
            color: m.mentorId ? colorByMentorId[m.mentorId] : bubbleColor || "",
            name: m.isIntro ? m.name : mentorNameForChatMsg(m),
          };
          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                marginRight: "2rem",
                marginLeft: "1rem",
                position: "relative",
              }}
            >
              <ChatItem
                key={`chat-msg-${i}`}
                message={itemData}
                i={i}
                styles={styles}
                setAnswerVisibility={(show: boolean) => {
                  setQuestionVisibilityPref(m.questionId, show);
                }}
                visibility={isQuestionsAnswersVisible(m.questionId, m.isIntro)}
                rePlayQuestionVideo={rePlayQuestionVideo}
                mentorType={mentorType}
                mostRecentMsg={i >= chatData.messages.length - numMentors}
              />
            </div>
          );
        })}
      </List>
    </div>
  );
}

export default Chat;
