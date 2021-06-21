/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { useDispatch, useSelector } from "react-redux";
import {
  Avatar,
  ListItem,
  ListItemAvatar,
  Popover,
  Typography,
} from "@material-ui/core";
// import { makeStyles } from "@material-ui/core/styles";
import ThumbUpIcon from "@material-ui/icons/ThumbUp";
import ThumbDownIcon from "@material-ui/icons/ThumbDown";
import ThumbsUpDownIcon from "@material-ui/icons/ThumbsUpDown";
import Visibility from "@material-ui/icons/Visibility";

import CloseIcon from "@material-ui/icons/Close";

import {
  ChatMsg,
  Config,
  Feedback,
  State,
} from "types";
import "styles/history-chat.css";
import { feedbackSend } from "store/actions";

export function ChatItem(props: {
  message: ChatMsg;
  i: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  styles: any;
  answersVisibility: boolean;
  setAnswerIndex: (idx: number) => void;
  // answerIndex: number;
  onSendFeedback: (id: string, feedback: Feedback) => void;
}): JSX.Element {
  const { message, i, styles, answersVisibility, setAnswerIndex, onSendFeedback } =
    props;
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
  const dispatch = useDispatch()
  // const config = useSelector<State, Config>((s) => s.config);
  // const [eyeClick, setEyeClick] = useState<boolean>(false)

  function handleFeedbackClick(event: React.MouseEvent<HTMLDivElement>) {
    setAnchorEl(event.currentTarget);
  }

  function handleFeedbackClose() {
    setAnchorEl(null);
  }

  function handleSelectFeedback(id: string, feedback: Feedback) {
    // giveFeedback(id, feedback, config);
    setAnchorEl(null);
    // onSendFeedback(id, feedback);
    dispatch(feedbackSend(message.feedbackId, feedback))
  }

  function LinkRenderer(props: { href: string; children: React.ReactNode }) {
    return (
      <h3>
        <a href={props.href} target="_blank" rel="noreferrer">
          {props.children}
        </a>
      </h3>
    );
  }
 const [a, setA] = useState<boolean>(false)
  
  return (
    <ListItem
      data-cy={`chat-msg-${i}`}
      id={`chat-msg-${i}`}
      disableGutters={false}
      className={[message.isUser ? "user" : "system", answersVisibility && message.isUser === false && i !== 0 ? 'hidden' : 'visible'].join(' ')}
      classes={{ root: styles.root }}
      style={{
        paddingRight: 16,
        maxWidth: 750,
        marginLeft: message.feedbackId ? 50 : 0,
      }}
    >
      {message.isUser ? <Visibility onClick={() => {setAnswerIndex(i+1), setA((prev) => !prev)}}/> : null}
      <ReactMarkdown
        source={message.text}
        renderers={{ link: LinkRenderer }}
      />
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
                <ThumbUpIcon data-cy="good" />
              ) : message.feedback === Feedback.BAD ? (
                <ThumbDownIcon data-cy="bad" />
              ) : (
                <ThumbsUpDownIcon data-cy="neutral" />
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
  );
}
export default ChatItem;
