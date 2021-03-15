/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { useSelector } from "react-redux";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import ScrollingQuestions from "components/scrolling-questions";
import { State, MentorData } from "store/types";
import withLocation from "wrap-with-location";

const theme = createMuiTheme({
  palette: {
    primary: { main: "#1B6A9C" },
  },
  // @ts-ignore
  typography: { useNextVariants: true },
});

function Questions(props: {
  onSelected: (question: string) => void;
  search: {
    subject?: string;
  };
}) {
  const mentor = useSelector<State, MentorData>(
    state => state.mentorsById[state.curMentor]
  );
  const curTopic = useSelector<State, string>(state => state.curTopic);
  const questionsAsked = useSelector<State, string[]>(
    state => state.questionsAsked
  );
  const { onSelected } = props;

  if (!(mentor && curTopic)) {
    return <div id="questions" />;
  }

  let questions: string[] = [];
  if (curTopic === "history") {
    questions = mentor.question_history;
  } else if (curTopic === "recommended") {
    questions = mentor.recommended_questions;
  } else {
    const topic = props.search.subject
      ? mentor.mentor.subjects_by_id
          .find(s => s.id === props.search.subject)
          ?.topics.find(t => t.id === curTopic)
      : mentor.mentor.topics_by_id.find(t => t.id === curTopic);
    questions.push(...(topic?.questions.map(q => q.question_text) || []));
  }
  const recommended = mentor.recommended_questions;

  const ordered_questions = questions.slice();
  if (curTopic === "History") {
    ordered_questions.reverse();
  } else {
    ordered_questions.sort((a: string, b: string) => {
      if (recommended.includes(a) && recommended.includes(b)) {
        return ordered_questions.indexOf(a) - ordered_questions.indexOf(b);
      }
      if (recommended.includes(a)) {
        return -1;
      }
      if (recommended.includes(b)) {
        return 1;
      }
      return 0;
    });
  }

  return (
    <MuiThemeProvider theme={theme}>
      <ScrollingQuestions
        id="questions"
        questions={ordered_questions}
        questionsAsked={questionsAsked}
        recommended={recommended}
        onQuestionSelected={onSelected}
      />
    </MuiThemeProvider>
  );
}

export default withLocation(Questions);
