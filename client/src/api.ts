/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import axios, { AxiosResponse } from "axios";
import {
  Utterance,
  Config,
  Media,
  MentorClientData,
  QuestionApiData,
  UtteranceName,
  MentorState,
} from "types";
import { convertMentorClientDataGQL, MentorQueryDataGQL } from "types-gql";

export const GATSBY_GRAPHQL_ENDPOINT =
  process.env.GATSBY_GRAPHQL_ENDPOINT || "/graphql";
export async function fetchConfig(): Promise<Config> {
  const gqlRes = await axios.post<GraphQLResponse<{ config: Config }>>(
    GATSBY_GRAPHQL_ENDPOINT,
    {
      query: `
      query FetchConfig {
        config {
          cmi5Enabled
          cmi5Endpoint
          cmi5Fetch
          mentorsDefault
          classifierLambdaEndpoint
          urlGraphql
          urlVideo
          filterEmailMentorAddress
          disclaimerTitle
          disclaimerText
          disclaimerDisabled
          styleHeaderColor
          styleHeaderTextColor
          styleHeaderLogo
          displayGuestPrompt
          defaultVirtualBackground
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
  mentor: MentorClientData | MentorState,
  utterance: UtteranceName
): Utterance | undefined {
  if (!(mentor && Array.isArray(mentor.utterances))) {
    return undefined;
  }
  return mentor.utterances.find((a) => a.name === utterance);
}

export function videoUrl(
  media: Media[],
  tag?: string,
  useVbg?: boolean
): string {
  if (!media) {
    return "";
  }
  const foundMedia = media.find(
    (m) => m.type === "video" && m.tag === (tag || "web")
  );
  return useVbg && foundMedia?.transparentVideoUrl
    ? foundMedia.transparentVideoUrl
    : foundMedia?.url || "";
}

export function idleUrl(
  mentor: MentorClientData,
  tag?: string,
  useVbg?: boolean
): string {
  const idle = getUtterance(mentor, UtteranceName.IDLE);
  if (idle) {
    return videoUrl(idle.media, tag, useVbg);
  } else {
    return "";
  }
}

export function offTopicMedia(mentor: MentorState | MentorClientData): Media[] {
  const offTopic = getUtterance(mentor, UtteranceName.OFF_TOPIC);
  if (offTopic) {
    return offTopic.media;
  } else {
    return [];
  }
}

export function subtitleUrl(media: Media[], tag?: string): string {
  if (!media) {
    return "";
  }
  return (
    media.find((m) => m.type === "subtitles" && m.tag === (tag || "en"))?.url ||
    ""
  );
}

interface GraphQLResponse<T> {
  errors?: { message: string }[];
  data?: T;
}

export async function fetchMentorByAccessToken(
  accessToken: string
): Promise<MentorClientData> {
  const headers = { Authorization: `bearer ${accessToken}` };
  const result = await axios.post(
    GATSBY_GRAPHQL_ENDPOINT,
    {
      query: `
        query {
          me {
            mentor {
              _id
            }
          }
        }
      `,
    },
    { headers: headers }
  );
  return result.data.data.me.mentor;
}

// Update to convert to mentor
export async function fetchMentor(
  mentorId: string,
  subjectId?: string
): Promise<MentorClientData> {
  const gqlRes = await axios.post<GraphQLResponse<MentorQueryDataGQL>>(
    GATSBY_GRAPHQL_ENDPOINT,
    {
      query: `
      query FetchMentor($mentor: ID!, $subject: ID) {
        mentorClientData(mentor: $mentor, subject: $subject) {
          _id
          name
          title
          email
          mentorType
          allowContact
          hasVirtualBackground
          virtualBackgroundUrl
          topicQuestions {
            topic
            questions
          }
          utterances {
            _id
            name
            transcript
            webMedia {
              tag
              type
              url
              transparentVideoUrl
            }
            mobileMedia {
              tag
              type
              url
              transparentVideoUrl
            }
            vttMedia {
              tag
              type
              url
            }
          }
        }
      }
    `,
      variables: {
        mentor: mentorId,
        subject: subjectId,
      },
    }
  );
  // check that the data returned successfully,
  if (gqlRes.status !== 200) {
    throw new Error(`Mentors load failed: ${gqlRes.statusText}}`);
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
  const mentorClientData = gqlRes.data.data.mentorClientData;
  return convertMentorClientDataGQL(mentorClientData);
}

interface GiveFeedbackResult {
  userQuestionSetFeedback: {
    _id: string;
  };
}

export async function giveFeedback(
  feedbackId: string,
  feedback: string
): Promise<AxiosResponse<GraphQLResponse<GiveFeedbackResult>>> {
  return await axios.post(GATSBY_GRAPHQL_ENDPOINT, {
    query: `
      mutation UserQuestionSetFeedback($id: ID!, $feedback: String!){
        userQuestionSetFeedback(id: $id, feedback: $feedback) {
          _id
        }
      }
    `,
    variables: {
      id: feedbackId,
      feedback: feedback,
    },
  });
}

export async function queryMentor(
  mentorId: string,
  question: string,
  config: Config
): Promise<AxiosResponse<QuestionApiData>> {
  return await axios.get(`${config.classifierLambdaEndpoint}/questions/`, {
    params: {
      mentor: mentorId,
      query: question,
    },
  });
}
