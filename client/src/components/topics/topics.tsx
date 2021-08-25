/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Paper } from "@material-ui/core";
import { normalizeString } from "utils";
import { selectTopic } from "store/actions";
import { State, TopicQuestions } from "types";
import withLocation from "wrap-with-location";

import "styles/layout.css";
import TopicTabs from "./topic-tabs";

function Topics(args: {
  onSelected: (question: string) => void;
  search: {
    subject?: string;
  };
  showHistoryTab: boolean;
}) {
  const { onSelected, showHistoryTab } = args;
  const dispatch = useDispatch();
  const topicQuestions = useSelector<State, TopicQuestions[]>((state) => {
    if (!state.curMentor) {
      return [];
    }
    return state.mentorsById[state.curMentor]?.topic_questions || [];
  });
  const curTopic = useSelector<State, string>((state) => state.curTopic);
  const questionsAsked = useSelector<State, string[]>(
    (state) => state.questionsAsked || []
  );

  async function onTopicSelected(topic: string) {
    if (curTopic === topic) {
      dispatch(selectTopic(""));
      return;
    }
    dispatch(selectTopic(topic));
    const topQ = (
      topicQuestions.find((tq) => tq.topic === topic)?.questions || []
    ).find((q) => !questionsAsked.includes(normalizeString(q)));
    if (topQ) {
      onSelected(topQ);
    }
  }

  const tabsContainer = (
    <TopicTabs
      topicQuestions={topicQuestions}
      onTopicSelected={onTopicSelected}
      showHistoryTab={showHistoryTab}
    />
  );

  return (
    <Paper elevation={2} square className="topics-wrapper">
      {tabsContainer}
    </Paper>
  );
}

export default withLocation(Topics);
