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
import {
  convertMentorClientDataGQL,
  MentorQueryDataGQL,
  AuthUserData,
} from "types-gql";

export const GATSBY_GRAPHQL_ENDPOINT =
  process.env.GATSBY_GRAPHQL_ENDPOINT || "/graphql";
export async function fetchConfig(): Promise<Config> {
  const gqlRes = await axios.post<GraphQLResponse<{ orgConfig: Config }>>(
    GATSBY_GRAPHQL_ENDPOINT,
    {
      query: `
      query FetchConfig {
        orgConfig {
          cmi5Enabled
          cmi5Endpoint
          cmi5Fetch
          classifierLambdaEndpoint
          urlGraphql
          urlVideo
          mentorsDefault
          filterEmailMentorAddress
          disclaimerTitle
          disclaimerText
          disclaimerDisabled
          styleHeaderColor
          styleHeaderTextColor
          styleHeaderLogo
          styleHeaderLogoUrl
          displayGuestPrompt
          displaySurveyPopupCondition
          defaultVirtualBackground
          postSurveyLink
          postSurveyTimer
          minTopicQuestionSize
          postSurveyUserIdEnabled
          postSurveyReferrerEnabled
          surveyButtonInDisclaimer
          guestPromptInputType
          guestPromptTitle
          guestPromptText
        }
      }
    `,
    }
  );
  if (gqlRes.status !== 200) {
    throw new Error(`orgConfig load failed: ${gqlRes.statusText}}`);
  }
  if (gqlRes.data.errors) {
    throw new Error(
      `errors reponse to orgConfig query: ${JSON.stringify(gqlRes.data.errors)}`
    );
  }
  if (!gqlRes.data.data) {
    throw new Error(
      `no data in non-error reponse: ${JSON.stringify(gqlRes.data)}`
    );
  }
  return gqlRes.data.data.orgConfig;
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
  accessToken: string,
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
          isPublicApproved
          isDirty
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
    },
    {
      headers: {
        Authorization: `bearer ${accessToken}`,
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

export interface NpcEditorResponse {
  data: {
    id: string;
    speaker: string;
    text: string;
    error?: boolean;
    reason?: string;
  };
}

export interface Answer {
  _id: string;
  question: {
    _id: string;
    question: string;
  };
  transcript: string;
  markdownTranscript: string;
  webMedia: Media;
  vttMedia: Media;
  mobileMedia: Media;
  externalVideoIds: {
    wistiaId: string;
  };
}

export async function getAnswerFromGqlByField(
  mentorId: string,
  fieldKey: string,
  fieldValue: string,
  accessToken: string
): Promise<Answer> {
  const res = await axios.post(
    GATSBY_GRAPHQL_ENDPOINT,
    {
      query: `
      query AnswerByFieldValue($mentor: ID!, $fieldKey: String!, $fieldValue: String!) {
        answerByFieldValue(mentor: $mentor, fieldKey: $fieldKey, fieldValue: $fieldValue) {
          _id
          question{
            _id
            question
          }
          transcript
          markdownTranscript
          webMedia{
            type
            tag
            url
          }
          vttMedia{
            type
            tag
            url
          }
          mobileMedia{
            type
            tag
            url
          }
          externalVideoIds{
            wistiaId
          }
        }
      }
    `,
      variables: {
        mentor: mentorId,
        fieldKey: fieldKey,
        fieldValue: fieldValue,
      },
    },
    {
      headers: {
        Authorization: `bearer ${accessToken}`,
      },
    }
  );

  return res.data.data.answerByFieldValue;
}

export async function queryMentor(
  mentorId: string,
  question: string,
  chatsessionid: string,
  config: Config,
  accessToken: string
): Promise<QuestionApiData> {
  const classifierInUrl = new URL(location.href).searchParams.get("classifier");
  const useNpcEditorClassifier = classifierInUrl === "npceditor";
  const paraproMentorIds = [
    "64b8251cef4d1ec577642925",
    "64b823c6ef4d1ec5776314b2",
    "63b897bb796fb654b71a6dba",
  ];
  const mentorIsParaproDoctor = paraproMentorIds.includes(mentorId);
  if (mentorIsParaproDoctor && useNpcEditorClassifier) {
    const npcEditorUrl = process.env.GATSBY_NPCEDITOR_ENDPOINT;
    const builtNpcEditorUrl = `${npcEditorUrl}?query=${question}&mentor=${mentorId}&chatsessionid=${chatsessionid}`;
    const npcEditorRes = await axios.post<QuestionApiData>(builtNpcEditorUrl);
    return npcEditorRes.data;
  } else {
    const res = await axios.get(
      `${config.classifierLambdaEndpoint}/questions/`,
      {
        params: {
          mentor: mentorId,
          query: question,
          chatsessionid,
        },
        headers: {
          Authorization: `bearer ${accessToken}`,
        },
      }
    );
    return res.data;
  }
}

export async function pingMentor(
  mentorId: string,
  chatSessionId: string,
  config: Config,
  accessToken: string
): Promise<AxiosResponse<QuestionApiData>> {
  return await axios.get(`${config.classifierLambdaEndpoint}/questions/`, {
    params: {
      mentor: mentorId,
      query: "Ping",
      ping: true,
      chatsessionid: chatSessionId,
    },
    headers: {
      Authorization: `bearer ${accessToken}`,
    },
  });
}

export async function refreshAccessToken(): Promise<AuthUserData> {
  const gqlRes = await axios.post(
    GATSBY_GRAPHQL_ENDPOINT,
    {
      query: `
    mutation RefreshAccessToken{
      refreshAccessToken {
        accessToken
        errorMessage
        authenticated
        userRole
        mentorIds
      }
    }
    `,
    },
    { withCredentials: true }
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
  const accessTokenData = gqlRes.data.data.refreshAccessToken;
  return accessTokenData;
}
