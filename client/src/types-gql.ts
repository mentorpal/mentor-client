/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  Media,
  MentorClientData,
  MentorType,
  TopicQuestions,
  Utterance,
} from "types";

export interface MentorQueryDataGQL {
  mentorClientData: MentorClientDataGQL;
}

export enum UserRole {
  NONE = "NONE",
  USER = "USER",
  CONTENT_MANAGER = "CONTENT_MANAGER",
  ADMIN = "ADMIN",
  SUPER_CONTENT_MANAGER = "SUPER_CONTENT_MANAGER",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export interface AuthUserData {
  accessToken: string;
  errorMessage: string;
  authenticated: boolean;
  userRole: UserRole;
  mentorIds: string[];
}

export interface MentorClientDataGQL {
  _id: string;
  name: string;
  title: string;
  email: string;
  allowContact: boolean;
  mentorType: MentorType;
  topicQuestions: TopicQuestions[];
  utterances: UtteranceGQL[];
  hasVirtualBackground: boolean;
  virtualBackgroundUrl: string;
  isPublicApproved: boolean;
  isDirty: boolean;
}

export interface UtteranceGQL {
  _id: string;
  name: string;
  transcript: string;
  webMedia?: Media;
  mobileMedia?: Media;
  vttMedia?: Media;
}

export interface OrgCheckPermission {
  isOrg: boolean;
  isPrivate: boolean;
  canView: boolean;
}

export function getMediaListFromUtteranceGql(utterance: UtteranceGQL): Media[] {
  const mediaList = [];
  if (utterance.mobileMedia) {
    mediaList.push(utterance.mobileMedia);
  }
  if (utterance.webMedia) {
    mediaList.push(utterance.webMedia);
  }
  if (utterance.vttMedia) {
    mediaList.push(utterance.vttMedia);
  }
  return mediaList;
}

export function convertUtteranceGQL(utteranceGql: UtteranceGQL): Utterance {
  return {
    ...utteranceGql,
    media: getMediaListFromUtteranceGql(utteranceGql),
  };
}

export function convertMentorClientDataGQL(
  mentorClientData: MentorClientDataGQL
): MentorClientData {
  return {
    ...mentorClientData,
    utterances: mentorClientData.utterances.map((utteranceGql) =>
      convertUtteranceGQL(utteranceGql)
    ),
  };
}
