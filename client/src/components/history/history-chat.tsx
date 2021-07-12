/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { animateScroll } from "react-scroll";
import { List } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { visibilitySwitch } from "store/actions";

import { FormGroup, FormControlLabel, Switch } from "@material-ui/core";

import { ChatData, ChatMsg, State } from "types";
import "styles/history-chat.css";
import ChatItem, { ChatItemData } from "./history-item";
// import { DialpadRounded } from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "auto",
  },
  list: {
    marginTop: 1,
    padding: 10,
    maxHeight: "20vh",
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
  questionHistory: string[];
}

function bubbleMentorColor() {
  return (
    "rgb(" +
    (Math.floor(Math.random() * 56) + 200) +
    ", " +
    (Math.floor(Math.random() * 56) + 200) +
    ", " +
    (Math.floor(Math.random() * 56) + 200) +
    ")"
  );
}

const MENTOR_COLORS = [
  bubbleMentorColor(),
  bubbleMentorColor(),
  bubbleMentorColor(),
  bubbleMentorColor(),
];

export function HistoryChat(args: ScrollingQuestionsParams): JSX.Element {
  const { height } = args;
  const styles = useStyles();
  const colorByMentorId = useSelector<State, Record<string, string>>((s) => {
    const mentorIds = Object.getOwnPropertyNames(s.mentorsById);
    mentorIds.sort();
    return mentorIds.reduce<Record<string, string>>((acc, cur, i) => {
      acc[cur] = MENTOR_COLORS[i % MENTOR_COLORS.length];
      return acc;
    }, {});
  });
  const namesByMentorId = useSelector<State, Record<string, string>>((s) => {
    const mentorIds = Object.getOwnPropertyNames(s.mentorsById);
    mentorIds.sort();
    return mentorIds.reduce<Record<string, string>>((acc, cur, i) => {
      acc[cur] = s.mentorsById[cur].mentor.name;
      return acc;
    }, {});
  });
  const chatData = useSelector<State, ChatData>((s) => s.chat);
  const dispatch = useDispatch();

  const [checked, toggleChecked] = useState<boolean>(true);

  useEffect(() => {
    animateScroll.scrollToBottom({
      containerId: "chat-thread",
    });
  }, [chatData.messages]);

  const toggleAnswers = (
    <div>
      <FormGroup className="togglePos">
        <FormControlLabel
          control={
            <Switch
              size="medium"
              checked={checked}
              onChange={() => toggleChecked((prev) => !prev)}
              data-cy="visibility-switch"
            />
          }
          label="hide/show answers"
        />
      </FormGroup>
    </div>
  );

  // type MentorBubble = {
  //   name: string;
  //   color: string;
  // };

  // const [mentorBubbleProps, setmentorBubbleProps] = useState<MentorBubble[]>(
  //   []
  // );

  // function onMentorChange(mentorName: string) {
  //   if (mentorName.length > 0) {
  //     const pos = mentorBubbleProps
  //       .map((item) => item.name)
  //       .indexOf(mentorName);
  //     pos === -1
  //       ? setmentorBubbleProps([
  //           ...mentorBubbleProps,
  //           { name: mentorName, color: bubbleMentorColor() },
  //         ])
  //       : "";
  //   }
  // }

  // useEffect(() => {
  //   chatData.messages.map((m) => {
  //     m.isUser === false ? onMentorChange(m.name) : null;
  //   });
  // }, [chatData.messages]);

  useEffect(() => {
    dispatch(visibilitySwitch(chatData.messages.length, checked));
  }, [checked]);

  return (
    <div
      data-cy="history-chat"
      data-topic="History"
      className={styles.chat_container}
    >
      <List
        data-cy="chat-thread"
        className={styles.list}
        style={{ height: height }}
        disablePadding={true}
        id="chat-thread"
      >
        {toggleAnswers}
        {chatData.messages.map((m: ChatMsg, i: number) => {
          const itemData: ChatItemData = {
            ...m,
            color: colorByMentorId[m.mentorId] || "",
            name: namesByMentorId[m.mentorId] || "",
            isVisible: true,
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
                // mentorBuubleProps={mentorBubbleProps}
              />
            </div>
          );
        })}
      </List>
    </div>
  );
}

export default HistoryChat;
