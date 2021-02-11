/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import "styles/chat.css";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { animateScroll } from "react-scroll";
import { List, ListItem, ListItemText } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import { MentorData, State } from "store/types";

const useStyles = makeStyles(theme => ({
  root: {
    width: "auto",
    paddingTop: 0,
    paddingBottom: 0,
  },
  body: {
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

export default function Chat(props: { height: number }): JSX.Element {
  const styles = useStyles();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const intro = useSelector<State, string | undefined>(state => {
    try {
      const m = state.mentorsById[state.curMentor];
      return m.utterances_by_type["_INTRO_"][0][1];
    } catch (err) {
      return undefined;
    }
  });
  const question = useSelector<State, string>(state => state.curQuestion);
  const answer = useSelector<State, string | undefined>(state => {
    const m = state.mentorsById[state.curMentor];
    return m ? m.answer_text : undefined;
  });

  useEffect(() => {
    if (!intro) {
      return;
    }
    setMessages([
      ...messages,
      {
        isUser: false,
        text: `${intro}\nWhat would you like to ask me?`,
      },
    ]);
  }, [intro]);

  useEffect(() => {
    if (!question) {
      return;
    }
    setMessages([
      ...messages,
      {
        isUser: true,
        text: question,
      },
    ]);
  }, [question]);

  useEffect(() => {
    if (!answer) {
      return;
    }
    setMessages([
      ...messages,
      {
        isUser: false,
        text: answer,
      },
    ]);
  }, [answer]);

  useEffect(() => {
    animateScroll.scrollToBottom({
      containerId: "thread",
    });
  });

  return (
    <div
      id="chat-thread"
      className={styles.body}
      style={{ height: props.height - 20 }}
    >
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
              style={{ paddingRight: 16 }}
            >
              <ListItemText primary={message.text} />
            </ListItem>
          );
        })}
      </List>
    </div>
  );
}
