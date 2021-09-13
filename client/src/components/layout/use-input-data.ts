/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useDispatch, useSelector } from "react-redux";
import { sendQuestion, userInputChanged } from "store/actions";
import { Config, MentorQuestionSource, State } from "types";

export interface UseWitInputtData {
  handleQuestionChanged: (
    question: string,
    source: MentorQuestionSource
  ) => void;
  handleQuestionSend: (question: string, source: MentorQuestionSource) => void;
  onTopicSelected: (question: string) => void;
  onQuestionSelected: (question: string) => void;
}

export function UseWitInputtData(): UseWitInputtData {
  const dispatch = useDispatch();
  const config = useSelector<State, Config>((s) => s.config);

  function handleQuestionChanged(
    question: string,
    source: MentorQuestionSource
  ): void {
    dispatch(userInputChanged({ question, source }));
  }

  function handleQuestionSend(
    question: string,
    source: MentorQuestionSource
  ): void {
    if (!question) {
      return;
    }
    dispatch(sendQuestion({ question, source, config }));
    window.focus();
  }

  function onTopicSelected(question: string): void {
    handleQuestionChanged(question, MentorQuestionSource.TOPIC_LIST);
  }

  function onQuestionSelected(question: string): void {
    handleQuestionSend(question, MentorQuestionSource.TOPIC_LIST);
  }

  return {
    handleQuestionChanged,
    handleQuestionSend,
    onTopicSelected,
    onQuestionSelected,
  };
}
