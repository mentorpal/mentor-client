/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

export interface PlayerState {
  status: PlayerStatus;
  urlToPlay?: string;
  newUrl?: string;
  // error?: LoadingError;
}

//TODO: This is going to determine what is occuring in the video-player
export enum PlayerStatus {
  INTRO_LOADING = "INTRO_LOADING",
  INTRO_PLAYING = "INTRO_PLAYING",
  INTRO_COMPLETE = "INTRO_COMPLETE",
  FADING_TO_IDLE = "FADING_TO_IDLE",
  IDLING_FOR_NEXT_READY_ANSWER = "IDLING_FOR_NEXT_READY_ANSWER",
  FADING_TO_ANSWER = "FADING_TO_ANSWER",
  ANSWER_PLAYING = "ANSWER_PLAYING",
}

export interface PlayerAction {
  type: PlayerActionType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any;
}

export enum PlayerActionType {
  INTRO_URL_ARRIVED = "INTRO_URL_ARRIVED",
  INTRO_FINISHED_LOADING = "INTRO_FINISHED_LOADING",
  INTRO_FINISHED = "INTRO_FINISHED",
  FINISHED_FADING_TO_IDLE = "FINISHED_FADING_TO_IDLE",
  FINISHED_FADING_TO_ANSWER = "FINISHED_FADING_TO_ANSWER",
  ANSWER_FINISHED_LOADING = "ANSWER_FINISHED_LOADING",
  ANSWER_FINISHED = "ANSWER_FINISHED",
  NEW_QUESTION_DURING_ANSWER = "NEW_QUESTION_DURING_ANSWER",
  NEW_URL_ARRIVED = "NEW_URL_ARRIVED",
}

export function PlayerReducer(
  state: PlayerState,
  action: PlayerAction
): PlayerState {
  const { type, payload } = action;
  switch (type) {
    case PlayerActionType.INTRO_URL_ARRIVED:
      return {
        ...state,
        status: PlayerStatus.INTRO_LOADING,
        urlToPlay: payload.introUrl,
      };

    case PlayerActionType.INTRO_FINISHED_LOADING:
      return { ...state, status: PlayerStatus.INTRO_PLAYING };

    case PlayerActionType.ANSWER_FINISHED_LOADING:
      if (state.status !== PlayerStatus.ANSWER_PLAYING)
        return { ...state, status: PlayerStatus.FADING_TO_ANSWER };
      else return state;
    case PlayerActionType.INTRO_FINISHED:
    case PlayerActionType.ANSWER_FINISHED:
      return { ...state, status: PlayerStatus.FADING_TO_IDLE };

    case PlayerActionType.NEW_URL_ARRIVED:
      if (
        state.status === PlayerStatus.ANSWER_PLAYING ||
        state.status === PlayerStatus.INTRO_PLAYING
      ) {
        console.log("answer arrived while answer playing");
        return {
          ...state,
          status: PlayerStatus.FADING_TO_IDLE,
          newUrl: payload.newUrl,
        };
      } else {
        console.log("answer arrived, updating urlToPlay");
        return {
          ...state,
          status: PlayerStatus.IDLING_FOR_NEXT_READY_ANSWER,
          urlToPlay: payload.newUrl,
          newUrl: "",
        };
      }

    case PlayerActionType.FINISHED_FADING_TO_IDLE:
      if (state.newUrl) {
        const urlCopy = JSON.parse(JSON.stringify(state.newUrl));
        return {
          status: PlayerStatus.IDLING_FOR_NEXT_READY_ANSWER,
          urlToPlay: urlCopy,
          newUrl: "",
        };
      } else {
        return { ...state, status: PlayerStatus.IDLING_FOR_NEXT_READY_ANSWER };
      }

    case PlayerActionType.FINISHED_FADING_TO_ANSWER:
      return { ...state, status: PlayerStatus.ANSWER_PLAYING };

    default:
      return { ...state, status: PlayerStatus.IDLING_FOR_NEXT_READY_ANSWER };
  }
}
