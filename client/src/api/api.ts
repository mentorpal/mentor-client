/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import axios, { AxiosResponse } from "axios";
import config from "config";

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
}

export const videoUrl = (
  mentor: string,
  answerId: string,
  format: string
): string => {
  return `${config.MENTOR_VIDEO_URL}/mentors/${mentor}/${format}/${answerId}.mp4`;
};

export const idleUrl = (mentor: string, format: string): string => {
  return `${config.MENTOR_VIDEO_URL}/mentors/${mentor}/${format}/idle.mp4`;
};

// TODO: don't pass mentor here, pass mentorId and answerId
export const subtitleUrl = (mentor: string, answerId: string): string => {
  return `${config.MENTOR_API_URL}/mentors/${mentor}/tracks/${answerId}.vtt`;
};

export async function fetchMentorData(
  mentorId: string
): Promise<AxiosResponse<MentorApiData>> {
  return await axios.get(`${config.MENTOR_API_URL}/mentors/${mentorId}/data`);
}

export const queryMentor = async (
  mentorId: string,
  question: string
): Promise<AxiosResponse<QuestionApiData>> => {
  // const res =
  return await axios.get(`${config.MENTOR_API_URL}/questions/`, {
    params: {
      mentor: mentorId,
      query: question,
    },
  });
};
