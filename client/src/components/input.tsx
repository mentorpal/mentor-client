/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Divider, Paper, InputBase, Collapse } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import Topics from "components/topics/topics";
import Questions from "components/questions";
import { sendQuestion, userInputChanged } from "store/actions";
import { Config, MentorQuestionSource, QuestionInput, State } from "types";
import { isMobile } from "react-device-detect";
import SendRoundedIcon from "@material-ui/icons/SendRounded";

import "styles/layout.css";

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    alignItems: "center",
    boxShadow: "0 -3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)",
  },
  inputField: {
    flex: 1,
    margin: "2px 4px",
    paddingLeft: "8px",
    borderStyle: "solid",
    borderWidth: "1px",
    borderRadius: "5px",
    borderColor: "rgba(0, 0, 0, 0.20)",
  },
  button: {
    color: "#7d7d7d !important",
    margin: "10px",
    height: "50px",
    width: "20px",
    borderRadius: "50%",
  },
  divider: {
    width: 1,
    height: 28,
    marginLeft: 10,
  },
}));

function Input(props: { showHistoryTab: boolean }): JSX.Element {
  const { showHistoryTab } = props;
  const dispatch = useDispatch();
  const classes = useStyles();
  const config = useSelector<State, Config>((s) => s.config);
  const curTopic = useSelector<State, string>((s) => s.curTopic);
  const curQuestion = useSelector<State, string>((s) => s.curQuestion);
  const questionInput = useSelector<State, QuestionInput>(
    (s) => s.questionInput
  );

  const [animatingInputField, setAnimatingInputField] =
    useState<boolean>(false);

  useEffect(() => {
    questionInput.source !== "CHAT_LINK"
      ? setAnimatingInputField(false)
      : setAnimatingInputField(true);
  }, [questionInput]);

  function handleQuestionChanged(
    question: string,
    source: MentorQuestionSource
  ) {
    dispatch(userInputChanged({ question, source }));
  }

  function handleQuestionSend(question: string, source: MentorQuestionSource) {
    if (!question) {
      return;
    }
    dispatch(sendQuestion({ question, source, config }));
    window.focus();
  }

  // Input is being sent (user hit send button or recommended question button)
  function onQuestionInputSend() {
    handleQuestionSend(questionInput.question, questionInput.source);
  }

  function onQuestionSelected(question: string) {
    handleQuestionSend(question, MentorQuestionSource.TOPIC_LIST);
  }

  // Input field should be updated (user typed a question or selected a topic)
  function onQuestionInputChanged(question: string) {
    handleQuestionChanged(question, MentorQuestionSource.USER);
  }

  // Input field was clicked on
  function onQuestionInputSelected(): void {
    handleQuestionChanged(questionInput.question, questionInput.source);
  }

  function onTopicSelected(question: string) {
    handleQuestionChanged(question, MentorQuestionSource.TOPIC_LIST);
  }

  // Input field key was entered (check if user hit enter)
  function onKeyPress(ev: React.KeyboardEvent<HTMLInputElement>): void {
    if (ev.key !== "Enter") {
      return;
    }
    ev.preventDefault();
    onQuestionInputSend();
  }

  // Input field keyboard was lowered
  const onBlur = () => {
    if (isMobile) {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
    }
  };

  return (
    <div data-cy="input-field-wrapper" data-topic={curTopic}>
      <Paper
        className={[classes.root, "input-wrapper"].join(" ")}
        square
        style={{ height: 60, padding: 10 }}
      >
        <InputBase
          id="input-field"
          data-cy="input-field"
          className={[
            classes.inputField,
            animatingInputField ? "input-field-animation" : "",
          ].join(" ")}
          value={questionInput.question}
          multiline
          rows={2}
          rowsMax={2}
          placeholder={curQuestion || "Ask a question"}
          onChange={(e) => {
            onQuestionInputChanged(e.target.value);
          }}
          onClick={onQuestionInputSelected}
          onBlur={onBlur}
          onKeyPress={onKeyPress}
        />
        <Divider className={classes.divider} />
        <Button
          data-cy="input-send"
          className={classes.button}
          onClick={() => onQuestionInputSend()}
          disabled={!questionInput.question}
          variant="contained"
          color="primary"
        >
          <SendRoundedIcon style={{ fontSize: 25, marginLeft: 5 }} />
        </Button>
      </Paper>
      <Topics onSelected={onTopicSelected} showHistoryTab={showHistoryTab} />
      <Collapse in={Boolean(curTopic)} timeout="auto" unmountOnExit>
        <Questions onSelected={onQuestionSelected} />
      </Collapse>
    </div>
  );
}

export default Input;
