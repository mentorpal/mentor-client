/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import axios, { AxiosResponse } from "axios";
import { withPrefix } from "gatsby";
import { Config, MentorApiData, QuestionApiData } from "store/types";

export const videoUrl = (
  mentorId: string,
  answerId: string,
  config: Config
): string => {
  return `${config.urlVideo}/mentors/${mentorId}/${answerId}.mp4`;
};

export const subtitleUrl = (
  mentorId: string,
  answerId: string,
  config: Config
): string => {
  return `${config.urlClassifier}/mentors/${mentorId}/tracks/${answerId}.vtt`;
};

export async function fetchConfig(): Promise<AxiosResponse<Config>> {
  return await axios.get<Config>(process.env.CONFIG || withPrefix("config"));
}

export async function fetchMentorData(
  mentorId: string,
  config: Config
): Promise<AxiosResponse<MentorApiData>> {
  return await axios.get(`${config.urlClassifier}/mentors/${mentorId}/data`);
}

export const queryMentor = async (
  mentorId: string,
  question: string,
  config: Config
): Promise<AxiosResponse<QuestionApiData>> => {
  return await axios.get(`${config.urlClassifier}/questions/`, {
    params: {
      mentor: mentorId,
      query: question,
    },
  });
};

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
