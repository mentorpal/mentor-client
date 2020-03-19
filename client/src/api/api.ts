import axios, { AxiosResponse } from "axios";
import config from "@/config";

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
