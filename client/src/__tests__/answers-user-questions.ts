/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { createStore, applyMiddleware, Store, AnyAction } from "redux";
import thunk, { ThunkDispatch } from "redux-thunk";

import { sendQuestion } from "store/actions";
import reducer, { initialState } from "store/reducer";
import { MentorQuestionSource, State } from "store/types";

// This sets the mock adapter on the default instance
const mockAxios = new MockAdapter(axios);

describe("load mentor data", () => {
  let store: Store<State, AnyAction>;
  let dispatch: ThunkDispatch<{}, {}, any>;

  beforeEach(() => {
    store = createStore(reducer, initialState, applyMiddleware(thunk));
    dispatch = store.dispatch;
  });

  afterEach(() => {
    mockAxios.reset();
  });

  it("answers user questions", async () => {
    const question = "what is your name?";
    // mockAxios.onGet(`/mentor-api/mentors/${mentorId}/data`).replyOnce(200, expectedApiResponse);
    await dispatch(
      sendQuestion({ question, source: MentorQuestionSource.USER })
    );
    const state = store.getState();
    expect(state.curQuestion).toEqual(question);
    // expect(state.mentorsById).toEqual({
    //   [mentorId]: expectedMentorData
    // });
  });
});
