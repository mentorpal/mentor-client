/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { animateScroll } from "react-scroll";
import { List, ListItem, ListItemText } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import { State } from "store/types";
import withLocation from "wrap-with-location";
import "styles/chat-override-theme";

const useStyles = makeStyles(theme => ({
  root: {
    width: "auto",
  },
  chat: {
    paddingTop: 1,
    width: "100%",
  },
  list: {
    padding: 10,
  },
  avatar: {
    color: "#fff",
    width: theme.spacing(4),
    height: theme.spacing(4),
  },
  icon: {
    position: "absolute",
    right: -40,
  },
}));

interface ChatMsg {
  isUser: boolean;
  text: string;
}

function ChatThread(props: { styles: any; messages: ChatMsg[] }): JSX.Element {
  const { styles, messages } = props;

  useEffect(() => {
    animateScroll.scrollToBottom({
      containerId: "thread",
    });
  }, [messages]);

  return (
    <List id="thread" className={styles.list} disablePadding={true}>
      {messages.map((message, i) => {
        return (
          <ListItem
            id={`chat-msg-${i}`}
            key={`chat-msg-${i}`}
            disableGutters={false}
            className={message.isUser ? "user" : "system"}
            classes={{
              root: styles.root,
            }}
            style={{ paddingRight: 16, maxWidth: 750 }}
          >
            <ListItemText primary={message.text} />
          </ListItem>
        );
      })}
    </List>
  );
}

function Chat(props: { height: number; search: any }): JSX.Element {
  const styles = useStyles();
  const state = useSelector<State, State>(state => state);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [lastQuestionAt, setLastQuestionAt] = useState<Date>();
  const [lastAnswerAt, setLastAnswerAt] = useState<Date>();

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
        },
      ]);
      setLastAnswerAt(mentor.answerReceivedAt);
    }
  }, [state]);

  return (
    <div
      id="chat-thread"
      className={styles.root}
      style={{
        height: props.height,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div className={styles.chat} style={{ height: props.height - 22 }}>
        <ChatThread styles={styles} messages={messages} />
      </div>
    </div>
  );
}

export default withLocation(Chat);
