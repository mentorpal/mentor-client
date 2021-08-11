/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { useSelector } from "react-redux";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import ScrollingQuestions from "components/scrolling-questions";
import { ChatProps, State } from "types";
import withLocation from "wrap-with-location";
import Chat from "./chat";
import { shouldDisplayPortrait } from "pages";

const theme = createMuiTheme({
  palette: {
    primary: { main: "#1B6A9C" },
  },
});

function Questions(props: {
  onSelected: (question: string) => void;
  search: {
    subject?: string;
  };
}) {
  const mentorId = useSelector<State, string>((state) => state.curMentor);
  const curTopic = useSelector<State, string>((state) => state.curTopic);
  const questionsAsked = useSelector<State, string[]>(
    (state) => state.questionsAsked
  );
  const recommendedQuestions = useSelector<State, string[]>(
    (state) => state.recommendedQuestions
  );
  const questions = useSelector<State, string[]>((state) => {
    if (!state.curMentor) {
      return [] as string[];
    }
    const m = state.mentorsById[state.curMentor];
    const qlist =
      (m?.topic_questions || []).find((tq) => tq.topic === curTopic)
        ?.questions || [];
    const orderedQuestions = qlist.slice();
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
    return orderedQuestions;
  });

  const videoChatProps: ChatProps = {
    displayMentorNames: true,
    height: 500,
    width: "",
    bubbleColor: "",
  };
  const historyComponent = shouldDisplayPortrait() ? (
    <Chat height={500} chatProps={videoChatProps} />
  ) : null;
  const content =
    curTopic === "History" ? (
      historyComponent
    ) : (
      <ScrollingQuestions
        questions={questions}
        questionsAsked={questionsAsked}
        recommended={recommendedQuestions}
        onQuestionSelected={props.onSelected}
        mentor={mentorId}
        topic={curTopic}
      />
    );

  return <MuiThemeProvider theme={theme}>{content}</MuiThemeProvider>;
}

export default withLocation(Questions);
