/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import axios, { AxiosResponse } from "axios";
import { withPrefix } from "gatsby";
import { Config } from "store/types";

export interface MentorApiData {
  id: string;
  name: string;
  questions_by_id: {
    [question_id: string]: {
      question_text: string;
    };
  };
  short_name: string;
  title: string;
  topics_by_id: {
    [topic_id: string]: {
      name: string;
      questions: string[];
    };
  };
  utterances_by_type: {
    [utterance_type: string]: string[][];
  };
}

export interface QuestionApiData {
  query: string;
  answer_id: string;
  answer_text: string;
  confidence: number;
  classifier: string;
  feedback_id: string;
}

export const videoUrl = (
  mentor: string,
  answerId: string,
  format: string,
  config: Config
): string => {
  return `${config.urlVideo}/mentors/${mentor}/${format}/${answerId}.mp4`;
};

export const idleUrl = (
  mentor: string,
  format: string,
  config: Config
): string => {
  return `${config.urlVideo}/mentors/${mentor}/${format}/idle.mp4`;
};

// TODO: don't pass mentor here, pass mentorId and answerId
export const subtitleUrl = (
  mentor: string,
  answerId: string,
  config: Config
): string => {
  return `${config.urlClassifier}/mentors/${mentor}/tracks/${answerId}.vtt`;
};

export async function fetchConfig(): Promise<AxiosResponse<Config>> {
  return await axios.get<Config>(withPrefix("config"));
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
