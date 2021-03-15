/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Paper } from "@material-ui/core";
import { History, Whatshot } from "@material-ui/icons";
import { normalizeString } from "utils";
import { selectTopic } from "store/actions";
import { MentorData, State, TopicData } from "store/types";
import withLocation from "wrap-with-location";

function Topics(args: {
  onSelected: (topic: string) => void;
  search: {
    subject?: string;
  };
}) {
  const { onSelected } = args;
  const dispatch = useDispatch();
  const mentor = useSelector<State, MentorData>(
    state => state.mentorsById[state.curMentor]
  );
  const curTopic = useSelector<State, string>(state => state.curTopic);
  const questionsAsked = useSelector<State, string[]>(
    state => state.questionsAsked
  );

  if (!mentor) {
    return <div />;
  }

  const topics: TopicData[] = [];
  if (mentor.recommended_questions.length > 0) {
    topics.push({
      id: "recommended",
      name: "Recommended",
      questions: [],
    });
  }
  if (args.search.subject) {
    topics.push(
      ...(mentor.mentor.subjects_by_id.find(s => s.id === args.search.subject)
        ?.topics || [])
    );
  } else {
    topics.push(...mentor.mentor.topics_by_id);
  }
  if (mentor.question_history.length > 0) {
    topics.push({
      id: "history",
      name: "History",
      questions: [],
    });
  }

  function onTopicSelected(topic: string) {
    if (curTopic === topic) {
      dispatch(selectTopic(""));
      return;
    }
    dispatch(selectTopic(topic));
    const top_question = topics
      .find(t => t.id === topic)
      ?.questions.find(
        q => !questionsAsked.includes(normalizeString(q.question_text))
      )?.question_text;
    if (top_question) {
      onSelected(top_question);
    }
  }

  return (
    <Paper elevation={2} square>
      <div id="topics" className="carousel">
        {topics.map((topic, i) => {
          return (
            <div id={`topic-${i}`} className="slide topic-slide" key={i}>
              <Button
                className={curTopic === topic.id ? "topic-selected" : ""}
                variant="contained"
                color={curTopic === topic.id ? "primary" : "default"}
                onClick={() => onTopicSelected(topic.id)}
              >
                {topic.id === "history" ? (
                  <History style={{ marginRight: "5px" }} />
                ) : (
                  undefined
                )}
                {topic.id === "recommended" ? (
                  <Whatshot style={{ marginRight: "5px" }} />
                ) : (
                  undefined
                )}
                {topic.name}
              </Button>
            </div>
          );
        })}
      </div>
    </Paper>
  );
}

export default withLocation(Topics);
