/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect } from "react";
import { List, ListItem, ListItemText, ListItemIcon } from "@material-ui/core";
import { Whatshot, PlayCircleOutline } from "@material-ui/icons";
import smoothscroll from "smoothscroll-polyfill";
import { normalizeString } from "utils";
import "styles/history-chat-responsive.css";

interface OnQuestionSelected {
  (question: string): void;
}

interface ScrollingQuestionsParams {
  questions: string[];
  questionsAsked: string[];
  recommended: string[];
  onQuestionSelected: OnQuestionSelected;
  topic: string;
  mentor: string;
}

function ScrollingQuestions(args: ScrollingQuestionsParams): JSX.Element {
  const {
    questions,
    questionsAsked,
    recommended,
    onQuestionSelected,
    mentor,
    topic,
  } = args;
  useEffect(() => {
    smoothscroll.polyfill();
  }, []);

  useEffect(() => {
    const topQuestion = questions.find((q) => {
      return !questionsAsked.includes(normalizeString(q));
    });

    const parent = document.getElementById("scrolling-questions-list");
    const node = document.getElementById(`${topQuestion}`);
    if (!(parent && node)) {
      return;
    }
    parent.scrollTo({
      behavior: "smooth",
      top: node.offsetTop,
      left: 0,
    });
  }, [questions, questionsAsked]);

  return (
    <List
      data-cy="scrolling-questions-list"
      data-topic={topic}
      data-mentor={mentor}
      className="scroll scrolling-questions-container"
      disablePadding
    >
      {questions.map((question: string, i: number) => (
        <div key={i} className="listed-question">
          <ListItem
            key={i}
            data-cy={question}
            onClick={() => onQuestionSelected(question)}
          >
            {recommended.includes(question) ? (
              <ListItemIcon>
                <Whatshot
                  className="recommended-question-icon"
                  style={{ height: 25, width: 25 }}
                />
              </ListItemIcon>
            ) : undefined}
            <div
              data-cy="listed-question-content-container"
              style={{
                display: "flex",
                alignItems: "center",
                color: questionsAsked.includes(normalizeString(question))
                  ? "gray"
                  : "black",
              }}
            >
              <PlayCircleOutline style={{ margin: "5px" }} />
              <ListItemText primary={question} />
            </div>
          </ListItem>
        </div>
      ))}
    </List>
  );
}

export default ScrollingQuestions;
