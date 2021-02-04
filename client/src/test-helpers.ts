/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Store, AnyAction } from "redux";

export interface ExpectedState {
  isMet?: boolean;
  testExpectations: () => void;
  unmetMessage: string;
}

export class ExpectIntermediateStates<StoreType> {
  private expectedStates: ExpectedState[];
  private store: Store<StoreType, AnyAction>;

  public constructor(store: Store<StoreType>, expectedStates: ExpectedState[]) {
    this.expectedStates = expectedStates;
    this.store = store;
  }

  public subscribe() {
    this.store.subscribe(() => {
      const nextUnmet = this.expectedStates.find((x) => !x.isMet);
      if (!nextUnmet) {
        return;
      }
      nextUnmet.testExpectations();
      nextUnmet.isMet = true;
    });
  }

  public testExpectations() {
    this.expectedStates.forEach((inState) => {
      expect({ message: inState.unmetMessage, isMet: inState.isMet }).toEqual({
        message: inState.unmetMessage,
        isMet: true,
      });
    });
  }
}
