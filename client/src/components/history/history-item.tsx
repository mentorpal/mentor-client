/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import ReactMarkdown from "react-markdown";
import { useDispatch, useSelector } from "react-redux";
import {
  Avatar,
  ListItem,
  ListItemAvatar,
  Popover,
  Typography,
} from "@material-ui/core";

import ThumbUpIcon from "@material-ui/icons/ThumbUp";
import ThumbDownIcon from "@material-ui/icons/ThumbDown";
import ThumbsUpDownIcon from "@material-ui/icons/ThumbsUpDown";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import RecordVoiceOverIcon from "@material-ui/icons/RecordVoiceOver";

import CloseIcon from "@material-ui/icons/Close";

import { ChatMsg, Config, Feedback, MentorQuestionSource, State } from "types";
import "styles/history-chat.css";
import { feedbackSend, sendQuestion, userInputChanged } from "store/actions";

type StyleProps = {
  root: string;
  list: string;
  icon: string;
  avatar: string;
  GOOD: string;
  BAD: string;
  feedbackPopup: string;
  chat_container: string;
  introMsg: string;
  visibilityBtn: string;
};

export interface ChatItemData extends ChatMsg {
  name: string;
  color: string;
}
export function ChatItem(props: {
  message: ChatItemData;
  i: number;
  styles: StyleProps;
  setAnswerVisibility: (show: boolean) => void;
  visibility: boolean;
}): JSX.Element {
  const { message, i, styles, setAnswerVisibility, visibility } = props;
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
  const dispatch = useDispatch();
  const config = useSelector<State, Config>((s) => s.config);

  const isUser = !message.mentorId;

  const mentorColor = message.color || "#88929e";
  const prefix = "ask://";
  const isVisible = visibility;

  function handleFeedbackClick(event: React.MouseEvent<HTMLDivElement>) {
    setAnchorEl(event.currentTarget);
  }

  function handleFeedbackClose() {
    setAnchorEl(null);
  }

  function handleSelectFeedback(id: string, feedback: Feedback) {
    setAnchorEl(null);
    dispatch(feedbackSend(message.feedbackId, feedback));
  }

  function LinkRenderer(props: { href: string; children: React.ReactNode }) {
    const linkAnswer =
      props.href.length > 30 ? props.href.slice(0, 30) : props.href;
    return message.text.includes(prefix) ? (
      <a
        href="#"
        rel="noreferrer"
        onClick={sentQuestion}
        data-cy={`question-link-${i}`}
      >
        {props.children}
      </a>
    ) : (
      <a
        href={props.href}
        target="_blank"
        rel="noreferrer"
        onClick={sentQuestion}
      >
        {linkAnswer}
      </a>
    );
  }

  async function sentQuestion() {
    const REGEX_ASK_LINK = /ask:\/\/display=(.*)/;
    const answerArray = REGEX_ASK_LINK.exec(message.text);
    if (answerArray) {
      const questionSplit = answerArray ? answerArray[1].replace(")", "") : "";
      const question = questionSplit.split("+").join(" ");
      await handleAskLinkClicked(question, MentorQuestionSource.USER);
    }
    return;
  }

  const addDelay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  function handleQuestionChanged(
    question: string,
    source: MentorQuestionSource
  ) {
    dispatch(userInputChanged({ question, source }));
    return new Promise((res) => {
      setTimeout(res, 1000);
    });
  }

  async function handleQuestionSend(
    question: string,
    source: MentorQuestionSource
  ) {
    if (!question) {
      return;
    }
    // add animation when question is asked
    const inputField = document.querySelector("#input-field");
    inputField?.classList.add("input-field-animation");
    await addDelay(1000);
    dispatch(sendQuestion({ question, source, config }));
    inputField?.classList.remove("input-field-animation");
    window.focus();
  }

  async function handleAskLinkClicked(
    question: string,
    source: MentorQuestionSource
  ) {
    await Promise.all([
      handleQuestionChanged(question, source),
      handleQuestionSend(question, source),
    ]);
  }

  function onClickVSBY() {
    setAnswerVisibility(!isVisible);
  }

  const visibilityIcon =
    isUser && isVisible === false ? (
      <VisibilityOff
        data-cy={`vsbyIcon-${i}`}
        onClick={onClickVSBY}
        style={{ marginRight: 7 }}
      />
    ) : isUser && isVisible ? (
      <Visibility
        onClick={onClickVSBY}
        data-cy={`vsbyIcon-${i}`}
        style={{ marginRight: 7 }}
      />
    ) : null;

  const askQuestionIcon = !isUser ? (
    <RecordVoiceOverIcon
      data-cy={`aks-icon-${i}`}
      style={{
        paddingLeft: 10,
        maxWidth: 750,
        backgroundColor: mentorColor,
        color: "#88929e",
      }}
    />
  ) : null;

  const REGEX_HAS_ASK_LINK = new RegExp("(ask://.+)");

  return (
    <div>
      <p
        style={{
          margin: "0px",
          display: "inline-block",
          float: "left",
          marginTop: isUser ? 6 : 3,
          marginLeft: 62,
          color: "#000",
          fontSize: 15,
        }}
      >
        {!isUser && isVisible ? message.name : null}
      </p>
      <ListItem
        data-cy={`chat-msg-${i}`}
        id={`chat-msg-${i}`}
        disableGutters={false}
        className={[
          isUser ? "user" : "system",
          isVisible ? "visible" : "hidden",
        ].join(" ")}
        classes={{ root: styles.root }}
        style={{
          paddingRight: 16,
          maxWidth: 750,
          marginLeft: isUser ? 0 : 50,
          backgroundColor: mentorColor,
        }}
      >
        {visibilityIcon}
        <ReactMarkdown
          source={message.text}
          renderers={{ link: LinkRenderer }}
        />
        {REGEX_HAS_ASK_LINK.test(message.text) ? askQuestionIcon : null}

        {message.feedbackId ? (
          <div
            data-cy="feedback-btn"
            className={styles.icon}
            onClick={handleFeedbackClick}
            style={{ zIndex: 2 }}
          >
            <ListItemAvatar>
              <Avatar
                className={[
                  styles.avatar,
                  message.feedback === Feedback.GOOD
                    ? styles.GOOD
                    : message.feedback === Feedback.BAD
                    ? styles.BAD
                    : undefined,
                ].join(" ")}
              >
                {message.feedback === Feedback.GOOD ? (
                  <ThumbUpIcon data-cy="selected-good" />
                ) : message.feedback === Feedback.BAD ? (
                  <ThumbDownIcon data-cy="selected-bad" />
                ) : (
                  <ThumbsUpDownIcon data-cy="selected-none" />
                )}
              </Avatar>
            </ListItemAvatar>
          </div>
        ) : undefined}
        <Popover
          id="feedback-popup"
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={handleFeedbackClose}
          anchorOrigin={{
            vertical: "center",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "center",
            horizontal: "center",
          }}
          elevation={0}
          className={styles.feedbackPopup}
        >
          <div
            id="feedback-popup-child"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              backgroundColor: "#88929e",
              borderRadius: "30px",
              padding: 10,
              color: "#FFFFFF",
            }}
          >
            <Typography>Did this answer your question?</Typography>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <div
                data-cy="click-good"
                data-test-in-progress={message.isFeedbackSendInProgress}
                onClick={() => {
                  if (message.feedbackId) {
                    handleSelectFeedback(message.feedbackId, Feedback.GOOD);
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar className={[styles.avatar, styles.GOOD].join(" ")}>
                    <ThumbUpIcon />
                  </Avatar>
                </ListItemAvatar>
              </div>
              <div
                data-cy="click-neutral"
                onClick={() => {
                  if (message.feedbackId) {
                    handleSelectFeedback(message.feedbackId, Feedback.NEUTRAL);
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar className={styles.avatar}>
                    <CloseIcon />
                  </Avatar>
                </ListItemAvatar>
              </div>
              <div
                data-cy="click-bad"
                onClick={() => {
                  if (message.feedbackId) {
                    handleSelectFeedback(message.feedbackId, Feedback.BAD);
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar className={[styles.avatar, styles.BAD].join(" ")}>
                    <ThumbDownIcon />
                  </Avatar>
                </ListItemAvatar>
              </div>
            </div>
          </div>
        </Popover>
      </ListItem>
    </div>
  );
}
export default ChatItem;
