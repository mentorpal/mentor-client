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
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ThumbUpIcon from "@material-ui/icons/ThumbUp";
import ThumbDownIcon from "@material-ui/icons/ThumbDown";
import ThumbsUpDownIcon from "@material-ui/icons/ThumbsUpDown";

import { giveFeedback } from "api";
import { Config, Feedback, State } from "store/types";
import "styles/chat-override-theme";

const useStyles = makeStyles(theme => ({
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
  popover: {
    width: theme.spacing(8),
  },
}));

interface ChatMsg {
  isUser: boolean;
  text: string;
  feedback?: Feedback;
  feedbackId?: string;
}

function Chat(): JSX.Element {
  const styles = useStyles();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [lastQuestionAt, setLastQuestionAt] = useState<Date>();
  const [lastAnswerAt, setLastAnswerAt] = useState<Date>();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const state = useSelector<State, State>(state => state);
  const config = useSelector<State, Config>(s => s.config);

  useEffect(() => {
    if (lastQuestionAt !== state.curQuestionUpdatedAt) {
      setMessages([
        ...messages,
        {
          isUser: true,
          text: state.curQuestion,
        },
      ]);
      setLastQuestionAt(state.curQuestionUpdatedAt);
    }
    const mentor = state.mentorsById[state.curMentor];
    if (!mentor) {
      return;
    }
    if (messages.length === 0) {
      setMessages([
        ...messages,
        {
          isUser: false,
          text: mentor.utterances_by_type["_INTRO_"][0][1],
        },
      ]);
    }
    if (lastAnswerAt !== mentor.answerReceivedAt) {
      setMessages([
        ...messages,
        {
          isUser: false,
          text: mentor.answer_text || "",
          feedbackId: mentor.answerFeedbackId,
        },
      ]);
      setLastAnswerAt(mentor.answerReceivedAt);
    }
  }, [state]);

  useEffect(() => {
    animateScroll.scrollToBottom({
      containerId: "chat-thread",
    });
  }, [messages]);

  function handleFeedbackClick(event: any) {
    setAnchorEl(event.currentTarget);
  }

  function handleFeedbackClose() {
    setAnchorEl(null);
  }

  function handleSelectFeedback(idx: number, id: string, feedback: Feedback) {
    giveFeedback(id, feedback, config);
    setAnchorEl(null);
    messages[idx].feedback = feedback;
    setMessages(messages);
  }

  function LinkRenderer(props: any) {
    return (
      <a href={props.href} target="_blank" rel="noreferrer">
        {props.children}
      </a>
    );
  }

  return (
    <List id="chat-thread" className={styles.list} disablePadding={true}>
      {messages.map((message, i) => {
        return (
          <ListItem
            id={`chat-msg-${i}`}
            key={`chat-msg-${i}`}
            disableGutters={false}
            className={message.isUser ? "user" : "system"}
            classes={{ root: styles.root }}
            style={{
              paddingRight: 16,
              maxWidth: 750,
              marginRight: message.feedbackId ? 10 : 0,
            }}
          >
            <ReactMarkdown
              source={message.text}
              renderers={{ link: LinkRenderer }}
            />
            {message.feedbackId ? (
              <div className={styles.icon} onClick={handleFeedbackClick}>
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
                      <ThumbUpIcon />
                    ) : message.feedback === Feedback.BAD ? (
                      <ThumbDownIcon />
                    ) : (
                      <ThumbsUpDownIcon />
                    )}
                  </Avatar>
                </ListItemAvatar>
              </div>
            ) : (
              undefined
            )}
            <Popover
              className={styles.popover}
              open={Boolean(anchorEl)}
              anchorEl={anchorEl}
              onClose={handleFeedbackClose}
              anchorOrigin={{
                vertical: "center",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "center",
                horizontal: "left",
              }}
              elevation={0}
            >
              <div
                onClick={() => {
                  if (message.feedbackId) {
                    handleSelectFeedback(i, message.feedbackId, Feedback.GOOD);
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
                onClick={() => {
                  if (message.feedbackId) {
                    handleSelectFeedback(i, message.feedbackId, Feedback.BAD);
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar className={[styles.avatar, styles.BAD].join(" ")}>
                    <ThumbDownIcon />
                  </Avatar>
                </ListItemAvatar>
              </div>
            </Popover>
          </ListItem>
        );
      })}
    </List>
  );
}

export default Chat;
