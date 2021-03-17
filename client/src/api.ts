/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import axios, { AxiosResponse } from "axios";
import { withPrefix } from "gatsby";
import {
  Answer,
  Config,
  Mentor,
  QuestionApiData,
  Status,
  UtteranceName,
} from "types";

export async function fetchConfig(): Promise<AxiosResponse<Config>> {
  return await axios.get<Config>(process.env.CONFIG || withPrefix("config"));
}

export function getUtterance(
  mentor: Mentor,
  utterance: UtteranceName
): Answer | undefined {
  return mentor.utterances.find(a => a.question.name === utterance);
}

export function videoUrl(
  mentorId: string,
  answerId: string,
  config: Config
): string {
  return `${config.urlVideo}/mentors/${mentorId}/${answerId}.mp4`;
}

export function idleUrl(mentor: Mentor, config: Config): string {
  const idle = getUtterance(mentor, UtteranceName.IDLE);
  return idle ? videoUrl(mentor._id, idle._id, config) : "";
}

export function subtitleUrl(
  mentorId: string,
  answerId: string,
  config: Config
): string {
  return `${config.urlClassifier}/mentors/${mentorId}/tracks/${answerId}.vtt`;
}

export async function fetchMentor(
  config: Config,
  mentorId: string,
  subject?: string,
  topic?: string
) {
  return await axios.post(config.urlGraphql, {
    query: `
      query {
        mentor(id: "${mentorId}") {
          _id
          name
          firstName
          title
          mentorType
          topics(subject: "${subject || ""}") {
            _id
            name
          }
          utterances(status: "${Status.COMPLETE}") {
            _id
            transcript
            question {
              question
              name
            }
          }
          answers(subject: "${subject || ""}", topic: "${topic ||
      ""}", status: "${Status.COMPLETE}") {
            _id
            transcript
            question {
              question
            }
          }
        }
      }
    `,
  });
}

export async function giveFeedback(
  feedbackId: string,
  feedback: string,
  config: Config
) {
  return await axios.post(config.urlGraphql, {
    query: `
      mutation {
        userQuestionSetFeedback(id: "${feedbackId}", feedback: "${feedback}") {
          _id
        }
      }
    `,
  });
}

export async function queryMentor(
  mentorId: string,
  question: string,
  config: Config
): Promise<AxiosResponse<QuestionApiData>> {
  return await axios.get(`${config.urlClassifier}/questions/`, {
    params: {
      mentor: mentorId,
      query: question,
    },
  });
}
