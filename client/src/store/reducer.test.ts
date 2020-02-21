import reducer from "./reducer";

describe("reducer", () => {
  it("should return the initial state", () => {
    expect(reducer(undefined, {})).toEqual({
      curMentor: "", // id of selected mentor
      curQuestion: "", // question that was last asked
      curTopic: "", // topic to show questions for
      mentorFaved: "", // id of the preferred mentor
      isIdle: false,
      mentorsById: {},
      mentorNext: "", // id of the next mentor to speak after the current finishes,
      questions: [],
      questionsAsked: [],
    });
  });
});
