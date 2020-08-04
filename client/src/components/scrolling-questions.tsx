/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect } from "react";
import { List, ListItem, ListItemText, ListItemIcon } from "@material-ui/core";
import { Whatshot } from "@material-ui/icons";
import smoothscroll from "smoothscroll-polyfill";

import { normalizeString } from "funcs/funcs";

interface OnQuestionSelected {
  (question?: string): undefined;
}

interface ScrollingQuestionsParams {
  height: number;
  id: string;
  questions: string[];
  questionsAsked: string[];
  recommended: string[];
  onQuestionSelected: OnQuestionSelected;
}

const ScrollingQuestions = (args: ScrollingQuestionsParams) => {
  const {
    height,
    questions,
    questionsAsked,
    recommended,
    onQuestionSelected,
  } = args;
  useEffect(() => {
    smoothscroll.polyfill();
  }, []);

  useEffect(() => {
    const topQuestion = questions.find(q => {
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
      id="scrolling-questions-list"
      className="scroll"
      style={{ maxHeight: height }}
      disablePadding
    >
      {questions.map((question: string, i: number) => (
        <ListItem
          key={i}
          id={question}
          onClick={() => onQuestionSelected(question)}
        >
          {recommended.includes(question) ? (
            <ListItemIcon>
              <Whatshot
                className="recommended-question-icon"
                style={{ height: 25, width: 25 }}
              />
            </ListItemIcon>
          ) : (
            undefined
          )}
          <ListItemText
            primary={question}
            style={{
              color: questionsAsked.includes(normalizeString(question))
                ? "gray"
                : "black",
            }}
          />
        </ListItem>
      ))}
    </List>
  );
};

export default ScrollingQuestions;
