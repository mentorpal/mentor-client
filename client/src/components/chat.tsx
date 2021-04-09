/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useSelector } from "react-redux";
import { animateScroll } from "react-scroll";
import {
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  Popover,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ThumbUpIcon from "@material-ui/icons/ThumbUp";
import ThumbDownIcon from "@material-ui/icons/ThumbDown";
import ThumbsUpDownIcon from "@material-ui/icons/ThumbsUpDown";

import { giveFeedback, getUtterance } from "api";
import { Config, Feedback, MentorData, State, UtteranceName } from "types";
import "styles/chat-override-theme";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "auto",
  },
  list: {
    marginTop: 1,
    padding: 10,
  },
  avatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
  },
  GOOD: {
    backgroundColor: "#0084ff",
  },
  BAD: {
    backgroundColor: "#E63535",
  },
  icon: {
    position: "absolute",
    right: -40,
  },
}));

interface ChatMsg {
  isUser: boolean;
  text: string;
  feedback?: Feedback;
  feedbackId?: string;
}

function ChatItem(props: {
  message: ChatMsg;
  i: number;
  styles: any;
  onSendFeedback: (id: string, feedback: Feedback) => void;
}): JSX.Element {
  const { message, i, styles, onSendFeedback } = props;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const config = useSelector<State, Config>((s) => s.config);

  function handleFeedbackClick(event: any) {
    setAnchorEl(event.currentTarget);
  }

  function handleFeedbackClose() {
    setAnchorEl(null);
  }

  function handleSelectFeedback(id: string, feedback: Feedback) {
    giveFeedback(id, feedback, config);
    setAnchorEl(null);
    onSendFeedback(id, feedback);
  }

  function LinkRenderer(props: any) {
    return (
      <a href={props.href} target="_blank" rel="noreferrer">
        {props.children}
      </a>
    );
  }

  return (
    <ListItem
      id={`chat-msg-${i}`}
      disableGutters={false}
      className={message.isUser ? "user" : "system"}
      classes={{ root: styles.root }}
      style={{
        paddingRight: 16,
        maxWidth: 750,
        marginRight: message.feedbackId ? 10 : 0,
      }}
    >
      <ReactMarkdown source={message.text} renderers={{ link: LinkRenderer }} />
      {message.feedbackId ? (
        <div
          id="feedback-btn"
          className={styles.icon}
          onClick={handleFeedbackClick}
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
                <ThumbUpIcon id="good" />
              ) : message.feedback === Feedback.BAD ? (
                <ThumbDownIcon id="bad" />
              ) : (
                <ThumbsUpDownIcon id="neutral" />
              )}
            </Avatar>
          </ListItemAvatar>
        </div>
      ) : undefined}
      <Popover
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
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography>Did this answer your question?</Typography>
          <div style={{ display: "flex", flexDirection: "row" }}>
            <div
              id="click-good"
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
              id="click-neutral"
              onClick={() => {
                if (message.feedbackId) {
                  handleSelectFeedback(message.feedbackId, Feedback.NEUTRAL);
                }
              }}
            >
              <ListItemAvatar>
                <Avatar className={styles.avatar}>
                  <ThumbsUpDownIcon />
                </Avatar>
              </ListItemAvatar>
            </div>
            <div
              id="click-bad"
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

function Chat(props: { height: number }): JSX.Element {
  const styles = useStyles();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [lastQuestionAt, setLastQuestionAt] = useState<Date>();
  const [lastAnswerAt, setLastAnswerAt] = useState<Date>();
  const mentor = useSelector<State, MentorData>(
    (state) => state.mentorsById[state.curMentor]
  );
  const curQuestion = useSelector<State, string>((state) => state.curQuestion);
  const curQuestionUpdatedAt = useSelector<State, Date | undefined>(
    (state) => state.curQuestionUpdatedAt
  );

  useEffect(() => {
    const _messages = [...messages];
    let updated = false;
    if (lastQuestionAt !== curQuestionUpdatedAt) {
      updated = true;
      _messages.push({
        isUser: true,
        text: curQuestion,
      });
      setLastQuestionAt(curQuestionUpdatedAt);
    }
    if (mentor) {
      if (messages.length === 0) {
        updated = true;
        _messages.push({
          isUser: false,
          text:
            getUtterance(mentor.mentor, UtteranceName.INTRO)?.transcript || "",
        });
      }
      if (lastAnswerAt !== mentor.answerReceivedAt) {
        updated = true;
        _messages.push({
          isUser: false,
          text: mentor.answer_text || "",
          feedbackId: mentor.answerFeedbackId,
        });
        setLastAnswerAt(mentor.answerReceivedAt);
      }
    }
    if (updated) {
      setMessages(_messages);
    }
  }, [mentor, curQuestionUpdatedAt]);

  useEffect(() => {
    animateScroll.scrollToBottom({
      containerId: "chat-thread",
    });
  }, [messages]);

  function onSendFeedback(id: string, feedback: Feedback) {
    const idx = messages.findIndex((f) => f.feedbackId === id);
    if (idx !== -1) {
      messages[idx].feedback = feedback;
    }
    setMessages(messages);
  }

  return (
    <List
      id="chat-thread"
      className={styles.list}
      style={{ height: props.height }}
      disablePadding={true}
    >
      {messages.map((message, i) => {
        return (
          <ChatItem
            key={`chat-msg-${i}`}
            message={message}
            i={i}
            styles={styles}
            onSendFeedback={onSendFeedback}
          />
        );
      })}
    </List>
  );
}

export default Chat;
