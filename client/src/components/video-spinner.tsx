/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
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
