/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import axios, { AxiosResponse } from "axios";
import {
  Answer,
  Config,
  Mentor,
  QuestionApiData,
  Status,
  UtteranceName,
} from "types";

export async function fetchConfig(graphqlUrl = "/graphql"): Promise<Config> {
  // return await axios.get<Config>(process.env.CONFIG || withPrefix("config"));
  const gqlRes = await axios.post<GraphQLReponse<{ config: Config }>>(
    graphqlUrl,
    {
      query: `
      query {
        config {
          cmi5Enabled
          cmi5Endpoint
          cmi5Fetch
          mentorsDefault
          urlClassifier
          urlGraphql
          urlVideo
        }
      }
    `,
    }
  );
  if (gqlRes.status !== 200) {
    throw new Error(`config load failed: ${gqlRes.statusText}}`);
  }
  if (gqlRes.data.errors) {
    throw new Error(
      `errors reponse to config query: ${JSON.stringify(gqlRes.data.errors)}`
    );
  }
  if (!gqlRes.data.data) {
    throw new Error(
      `no data in non-error reponse: ${JSON.stringify(gqlRes.data)}`
    );
  }
  return gqlRes.data.data.config;
}

export function getUtterance(
  mentor: Mentor,
  utterance: UtteranceName
): Answer | undefined {
  if (!(mentor && Array.isArray(mentor.utterances))) {
    return undefined;
  }
  return mentor.utterances.find((a) => a.question.name === utterance);
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

interface MentorQueryData {
  mentor: Mentor;
}

interface GraphQLReponse<T> {
  errors?: { message: string }[];
  data?: T;
}

export async function fetchMentor(
  config: Config,
  mentorId: string
): Promise<AxiosResponse<GraphQLReponse<MentorQueryData>>> {
  return await axios.post<GraphQLReponse<MentorQueryData>>(config.urlGraphql, {
    query: `
      query {
        mentor(id: "${mentorId}") {
          _id
          name
          firstName
          title
          mentorType
          defaultSubject {
            _id
          }
          subjects {
            _id
            topics {
              id
              name
            }
            questions {
              topics {
                id
              }
              question {
                question
                type
              }
            }
          }
          topics {
            id
            name
          }
          questions {
            topics {
              id
            }
            question {
              question
              type
            }
          }
          utterances(status: "${Status.COMPLETE}") {
            _id
            transcript
            question {
              name
            }
          }
        }
      }
    `,
  });
}

interface GiveFeedbackResult {
  userQuestionSetFeedback: {
    _id: string;
  };
}

export async function giveFeedback(
  feedbackId: string,
  feedback: string,
  config: Config
): Promise<AxiosResponse<GraphQLReponse<GiveFeedbackResult>>> {
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
