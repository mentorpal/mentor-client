/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { animateScroll } from "react-scroll";
import { List } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import { FormGroup, FormControlLabel, Switch } from "@material-ui/core";

import { ChatData, ChatMsg, State } from "types";
import "styles/history-chat.css";
import ChatItem, { ChatItemData } from "./history-item";
import { ItemVisibilityPrefs, useWithChatData } from "./use-chat-data";
import { shouldDisplayPortrait } from "pages";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "auto",
  },
  list: {
    marginTop: 1,
    padding: shouldDisplayPortrait() ? 0 : 10,
    width: shouldDisplayPortrait() ? "100%" : "40vw",
    backgroundColor: "#fff",
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
    backgroundColor: "#fff",
    margin: "1rem",
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

interface ScrollingQuestionsParams {
  height: number;
}

const MENTOR_COLORS = ["#d8e7f8", "#d4e8d9", "#ffebcf", "#f5cccd"];

export function HistoryChat(args: ScrollingQuestionsParams): JSX.Element {
  const { height } = args;
  const styles = useStyles();
  const {
    lastQuestionId,
    visibilityShowAllPref,
    getQuestionVisibilityPref,
    setQuestionVisibilityPref,
    setVisibilityShowAllPref,
    mentorNameForChatMsg,
  } = useWithChatData();

  const colorByMentorId = useSelector<State, Record<string, string>>((s) => {
    const mentorIds = Object.getOwnPropertyNames(s.mentorsById);
    mentorIds.sort();
    return mentorIds.reduce<Record<string, string>>((acc, cur, i) => {
      acc[cur] = MENTOR_COLORS[i % MENTOR_COLORS.length];
      return acc;
    }, {});
  });

  const chatData = useSelector<State, ChatData>((s) => s.chat);

  useEffect(() => {
    animateScroll.scrollToBottom({
      containerId: "chat-thread",
    });
  }, [chatData.messages.length]);

  function isQuestionsAnswersVisible(questionId: string): boolean {
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

  const toggleAnswers = (
    <div>
      <FormGroup className="togglePos">
        <FormControlLabel
          control={
            <Switch
              size="medium"
              checked={visibilityShowAllPref}
              onChange={(_, checked: boolean) => {
                setVisibilityShowAllPref(checked);
              }}
              data-cy="visibility-switch"
            />
          }
          label="hide/show answers"
        />
      </FormGroup>
    </div>
  );

  useEffect(() => {
    setVisibilityShowAllPref(visibilityShowAllPref);
  }, [visibilityShowAllPref]);

  return (
    <div
      data-cy="history-chat"
      data-topic="History"
      className={
        !shouldDisplayPortrait()
          ? styles.chat_container
          : styles.chat_container_mobile
      }
    >
      <List
        data-cy="chat-thread"
        className={styles.list}
        style={{
          height: shouldDisplayPortrait() ? "200px" : height,
        }}
        disablePadding={true}
        id="chat-thread"
      >
        {toggleAnswers}
        {chatData.messages.map((m: ChatMsg, i: number) => {
          const itemData: ChatItemData = {
            ...m,
            color: colorByMentorId[m.mentorId] || "",
            name: mentorNameForChatMsg(m) || "",
          };
          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
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
                visibility={isQuestionsAnswersVisible(m.questionId)}
              />
            </div>
          );
        })}
      </List>
    </div>
  );
}

export default HistoryChat;
