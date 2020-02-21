import React, { useEffect } from "react";
import { List, ListItem, ListItemText } from "@material-ui/core";
import { Whatshot } from "@material-ui/icons";
import smoothscroll from "smoothscroll-polyfill";

import { normalizeString } from "funcs/funcs";

const ScrollingQuestions = ({
  height,
  questions,
  questionsAsked,
  recommended,
  onQuestionSelected,
}) => {
  useEffect(() => {
    smoothscroll.polyfill();
  }, []);

  useEffect(() => {
    const top_question = questions.find(q => {
      return !questionsAsked.includes(normalizeString(q));
    });
    const parent = document.getElementById("scrolling-questions-list");
    const node = document.getElementById(top_question);
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
      {questions.map((question, i) => (
        <ListItem
          key={i}
          id={question}
          onClick={() => onQuestionSelected(question)}
        >
          <ListItemText
            style={{
              paddingLeft: 0,
              color: questionsAsked.includes(normalizeString(question))
                ? "gray"
                : "black",
            }}
          >
            {recommended.includes(question) ? (
              <Whatshot style={{ marginRight: "5px" }} fontSize="small" />
            ) : (
              undefined
            )}
            {question}
          </ListItemText>
        </ListItem>
      ))}
    </List>
  );
};

export default ScrollingQuestions;
