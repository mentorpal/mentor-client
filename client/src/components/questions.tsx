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

const theme = createMuiTheme({
  palette: {
    primary: { main: "#1B6A9C" },
  },
  // @ts-ignore
  typography: { useNextVariants: true },
});

interface Props {
  height: number;
  onSelected: () => undefined;
}
const Questions = ({ height, onSelected }: Props) => {
  const mentor = useSelector<State, MentorData>(
    state => state.mentorsById[state.curMentor]
  );
  const curTopic = useSelector<State, string>(state => state.curTopic);
  const questionsAsked = useSelector<State, string[]>(
    state => state.questionsAsked
  );

  if (!(mentor && curTopic && mentor.topic_questions)) {
    return <div id="questions" />;
  }

  const questions = mentor.topic_questions[curTopic] || [];
  const recommended = mentor.topic_questions.Recommended || [];

  const ordered_questions = questions.slice();
  if (curTopic === "History") {
    ordered_questions.reverse();
  } else {
    ordered_questions.sort((a, b) => {
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
        height={height}
        questions={ordered_questions}
        questionsAsked={questionsAsked}
        recommended={recommended}
        onQuestionSelected={onSelected}
      />
    </MuiThemeProvider>
  );
};

export default Questions;
