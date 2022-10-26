/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { ChatMsg, State, WebLink } from "types";

export interface UseWithWebLinks {
  webLinks: WebLink[];
}

export function useWithWebLinks(): UseWithWebLinks {
  const [webLinks, setWebLinks] = useState<WebLink[]>([]);
  const curMentorId = useSelector<State, string>((state) => state.curMentor);
  const chatMessages = useSelector<State, ChatMsg[]>((s) => {
    return s.chat.messages;
  });

  // returns an array of WebLinks
  const getWebLinkData = (chatMsgs: ChatMsg[], curMentorId: string) => {
    const lastQuestionId = chatMsgs[chatMsgs.length - 1].questionId;

    const lastWebLink = chatMsgs.filter((m) => {
      if (m.mentorId === curMentorId && m.questionId === lastQuestionId) {
        return m.webLinks || [];
      }
    });
    const mentorWebLink =
      lastWebLink && lastWebLink.length > 0
        ? lastWebLink[0].webLinks || []
        : [];
    return mentorWebLink;
  };

  useEffect(() => {
    if (!curMentorId) {
      return;
    }
    setWebLinks(getWebLinkData(chatMessages, curMentorId));
  }, [chatMessages, curMentorId]);

  return {
    webLinks,
  };
}
