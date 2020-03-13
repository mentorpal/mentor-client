import reducer from "./reducer";
import { MentorSelectReason, MentorQuestionSource } from "./types";

describe("reducer", () => {
  it("should return the initial state", () => {
    const initial = reducer(undefined, {});
    delete initial.curQuestionUpdatedAt;
    expect(reducer(undefined, {})).toEqual({
      curMentor: "", // id of selected mentor
      curMentorReason: MentorSelectReason.NONE,
      curQuestion: "", // question that was last asked
      curQuestionSource: MentorQuestionSource.NONE,
      curTopic: "", // topic to show questions for
      mentorFaved: "", // id of the preferred mentor
      isIdle: false,
      mentorsById: {},
      mentorNext: "", // id of the next mentor to speak after the current finishes,
      questionsAsked: [],
      guestName: "",
    });
  });
});
