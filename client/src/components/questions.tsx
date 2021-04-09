/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { useSelector } from "react-redux";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import ScrollingQuestions from "components/scrolling-questions";
import { State, MentorData } from "types";
import withLocation from "wrap-with-location";

const theme = createMuiTheme({
  palette: {
    primary: { main: "#1B6A9C" },
  },
  // eslint-disable-next-line
  // typography: { useNextVariants: true },
});

function Questions(props: {
  onSelected: (question: string) => void;
  search: {
    subject?: string;
  };
}) {
  const mentorId = useSelector<State, string>((state) => state.curMentor);
  const mentor = useSelector<State, MentorData>(
    (state) => state.mentorsById[state.curMentor]
  );
  const curTopic = useSelector<State, string>((state) => state.curTopic);
  const questionsAsked = useSelector<State, string[]>(
    (state) => state.questionsAsked
  );
  const recommendedQuestions = useSelector<State, string[]>(
    (state) => state.recommendedQuestions
  );

  const questions =
    mentor.topic_questions.find((tq) => tq.topic === curTopic)?.questions || [];
  const orderedQuestions = questions.slice();
  if (curTopic === "History") {
    orderedQuestions.reverse();
  } else {
    orderedQuestions.sort((a: string, b: string) => {
      if (
        recommendedQuestions.includes(a) &&
        recommendedQuestions.includes(b)
      ) {
        return orderedQuestions.indexOf(a) - orderedQuestions.indexOf(b);
      }
      if (recommendedQuestions.includes(a)) {
        return -1;
      }
      if (recommendedQuestions.includes(b)) {
        return 1;
      }
      return 0;
    });
  }

  return (
    <MuiThemeProvider theme={theme}>
      <ScrollingQuestions
        id="questions"
        questions={orderedQuestions}
        questionsAsked={questionsAsked}
        recommended={recommendedQuestions}
        onQuestionSelected={props.onSelected}
        mentor={mentorId}
        topic={curTopic}
      />
    </MuiThemeProvider>
  );
}

export default withLocation(Questions);
