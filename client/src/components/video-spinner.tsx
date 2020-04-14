import React from "react";
import { useSelector } from "react-redux";
import { CircularProgress } from "@material-ui/core";
import { State } from "store/types";

const LoadingSpinner = (args: {
  mentor: string;
  width: number;
  height: number;
}) => {
  const { mentor, width, height } = args;
  const isMentorQuestionDifferent = useSelector<State, boolean>(state => {
    const m = state.mentorsById[mentor];
    return Boolean(m && state.curQuestion && state.curQuestion !== m.question);
  });
  const offset_width = 0.5 * width - 15;
  const offset_height = 0.5 * height - 15;
  return isMentorQuestionDifferent ? (
    <CircularProgress
      className="spinner"
      style={{ top: `${offset_height}px`, left: `${offset_width}px` }}
    />
  ) : (
    <div />
  );
};

export default LoadingSpinner;
