/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Divider, Paper, InputBase } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";

import { sendQuestion, onInput } from "store/actions";

import Topics from "components/topics";
import Questions from "components/questions";
import { MentorQuestionSource } from "store/types";

const Input = ({ height, ...props }) => {
  const dispatch = useDispatch();
  const questionState = useSelector(state => state.curQuestion);
  const [questionInput, setQuestionInput] = useState({
    question: "",
    source: MentorQuestionSource.NONE,
  });
  const { classes } = props;

  function handleQuestionChanged(question, source) {
    setQuestionInput({
      question: question || "",
      source: source || MentorQuestionSource.NONE,
    });
    dispatch(onInput());
  }

  function handleQuestionSend(question, source) {
    if (!question) {
      return;
    }
    dispatch(sendQuestion({ question, source }));
    setQuestionInput({ question: "", source: MentorQuestionSource.NONE });
    window.focus();
  }

  // Input is being sent (user hit send button or recommended question button)
  const onQuestionInputSend = () => {
    handleQuestionSend(questionInput.question, questionInput.source);
  };

  function onQuestionSelected(question) {
    handleQuestionChanged(question, MentorQuestionSource.TOPIC_LIST);
    handleQuestionSend(question, MentorQuestionSource.TOPIC_LIST);
  }

  // Input field should be updated (user typed a question or selected a topic)
  function onQuestionInputChanged(question) {
    handleQuestionChanged(question, MentorQuestionSource.USER);
  }

  // Input field was clicked on
  const onQuestionInputSelected = () => {
    handleQuestionChanged(questionInput.question, questionInput.source);
  };

  function onTopicSelected(question) {
    handleQuestionChanged(question, MentorQuestionSource.TOPIC_LIST);
  }

  // Input field key was entered (check if user hit enter)
  const onKeyPress = ev => {
    if (ev.key !== "Enter") {
      return;
    }
    ev.preventDefault();
    onQuestionInputSend();
  };

  // Input field keyboard was lowered
  const onBlur = () => {
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
  };

  return (
    <div id="input" className="flex" style={{ height }}>
      <div className="content" style={{ height: "60px" }}>
        <Paper className={classes.root} square>
          <InputBase
            id="input-field"
            className={classes.inputField}
            value={questionInput.question}
            multiline
            rows={2}
            rowsMax={2}
            placeholder={questionState || "Ask a question"}
            onChange={e => {
              onQuestionInputChanged(e.target.value);
            }}
            onClick={onQuestionInputSelected}
            onBlur={onBlur}
            onKeyPress={onKeyPress}
          />
          <Divider className={classes.divider} />
          <Button
            id="input-send"
            className={classes.button}
            onClick={() => onQuestionInputSend()}
            disabled={!questionInput.question}
            variant="contained"
            color="primary"
          >
            {" "}
            Send{" "}
          </Button>
        </Paper>
      </div>
      <div className="content" style={{ height: "60px" }}>
        <Topics onSelected={onTopicSelected} />
      </div>
      <div className="expand">
        <Questions height={height - 120} onSelected={onQuestionSelected} />
      </div>
    </div>
  );
};

const styles = {
  root: {
    padding: "2px 4px",
    display: "flex",
    alignItems: "center",
    boxShadow: "0 -3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)",
  },
  inputField: {
    flex: 1,
    paddingLeft: "8px",
    borderStyle: "solid",
    borderWidth: "1px",
    borderRadius: "5px",
    borderColor: "rgba(0, 0, 0, 0.20)",
  },
  button: {
    margin: 10,
  },
  divider: {
    width: 1,
    height: 28,
    marginLeft: 10,
  },
};

export default withStyles(styles)(Input);
