/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

export interface PlayerState {
  status: PlayerStatus;
  // error?: LoadingError;
}

//TODO: This is going to determine what is occuring in the video-player
export enum PlayerStatus {
  INTRO_LOADING = "INTRO_LOADING",
  INTRO_PLAYING = "INTRO_PLAYING",
  INTRO_COMPLETE = "INTRO_COMPLETE",
  FADING_TO_IDLE = "FADING_TO_IDLE",
  SHOWING_IDLE = "SHOWING_IDLE",
  FADING_TO_ANSWER = "FADING_TO_ANSWER",
  SHOWING_ANSWER = "SHOWING_ANSWER",
}

export interface PlayerAction {
  type: PlayerActionType;
  // payload?: LoadingError;
}

export enum PlayerActionType {
  INTRO_FINISHED_LOADING = "INTRO_FINISHED_LOADING",
  INTRO_FINISHED = "INTRO_FINISHED",
  ANSWER_FINISHED_LOADING = "ANSWER_FINISHED_LOADING",
  ANSWER_FINISHED = "ANSWER_FINISHED",
  QUESTION_ASKED = "QUESTION_ASKED",
}

//   TODO: need to move necessary video-player state into here, I think really just the stylings, so this will mainly be a video-player-styling-reducer to help manage the fadings and what player is visible
// export function PlayerReducer(
//   state: PlayerState,
//   action: PlayerAction
// ): PlayerState {
//   const { type } = action; // , payload
//   switch (type) {
//     case LoadingActionType.LOADING_STARTED:
//       return { status: LoadingStatusType.LOADING };
//     case LoadingActionType.SAVING_STARTED:
//       return { status: LoadingStatusType.SAVING };
//     case LoadingActionType.LOADING_SUCCEEDED:
//     case LoadingActionType.SAVING_SUCCEEDED:
//       return { status: LoadingStatusType.SUCCESS };
//     case LoadingActionType.LOADING_FAILED:
//     case LoadingActionType.SAVING_FAILED:
//       return { status: LoadingStatusType.ERROR, error: payload };
//     default:
//       return { status: LoadingStatusType.NONE };
//   }
// }
