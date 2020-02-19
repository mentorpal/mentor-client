import { actions as cmi5Actions } from "redux-cmi5";


// export function sendStatement({
//     contextExtensions: sessionStateExt(getState()),
//     result: {
//       extensions: {
//         "https://mentorpal.org/xapi/activity/extensions/actor-question": {
//           question_index: currentQuestionIndex(getState()) + 1,
//           text: question,
//         },
//       },
//     },
//     verb: "https://mentorpal.org/xapi/verb/asked",
//   })