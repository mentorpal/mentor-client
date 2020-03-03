import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Paper } from "@material-ui/core";
import { History, Whatshot } from "@material-ui/icons";

import { selectTopic } from "store/actions";
import { normalizeString } from "funcs/funcs";

const Topics = ({ onSelected }) => {
  const dispatch = useDispatch();
  const mentor = useSelector(state => state.mentorsById[state.curMentor]);
  const curTopic = useSelector(state => state.curTopic);
  const questionsAsked = useSelector(state => state.questionsAsked);

  if (!(mentor && mentor.topic_questions)) {
    return <div />;
  }

  const { topic_questions } = mentor;
  const onTopicSelected = topic => {
    dispatch(selectTopic(topic));
    const top_question = topic_questions[topic].find(q => {
      return !questionsAsked.includes(normalizeString(q));
    });
    onSelected(top_question || "");
  };

  if (!curTopic) {
    const first_topic = Object.keys(topic_questions)[0];
    if (first_topic === "Recommended") {
      onTopicSelected(first_topic);
    } else {
      dispatch(selectTopic(first_topic));
    }
  }

  return (
    <Paper elevation={2} square>
      <div id="topics" className="carousel">
        {Object.keys(topic_questions).map((topic, i) => (
          <div id={`topic-${i}`} className="slide topic-slide" key={i}>
            <Button
              className={current_topic === topic ? "topic-selected" : ""}
              variant="contained"
              color={curTopic === topic ? "primary" : "default"}
              onClick={() => onTopicSelected(topic)}
            >
              {topic === "History" ? (
                <History style={{ marginRight: "5px" }} />
              ) : (
                undefined
              )}
              {topic === "Recommended" ? (
                <Whatshot style={{ marginRight: "5px" }} />
              ) : (
                undefined
              )}
              {topic}
            </Button>
          </div>
        ))}
      </div>
    </Paper>
  );
};

export default Topics;
