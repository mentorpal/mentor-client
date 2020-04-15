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
