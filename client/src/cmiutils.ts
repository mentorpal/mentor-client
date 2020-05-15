import queryString from "query-string";
import { Agent } from "@gradiant/xapi-dsl";

export interface CmiParams {
  activityId: string;
  actor: Agent;
  endpoint: string;
  fetch: string;
  registration: string;
}

export function addCmi(url: string, cp: CmiParams): string {
  return `${url}${url.includes("?") ? "" : "?"}${
    url.endsWith("&") ? "" : "&"
  }activityId=${encodeURIComponent(cp.activityId)}&actor=${encodeURIComponent(
    JSON.stringify(cp.actor)
  )}&endpoint=${encodeURIComponent(cp.endpoint)}&fetch=${encodeURIComponent(
    cp.fetch
  )}&registration=${encodeURIComponent(cp.registration)}`;
}

export function hasCmi(urlOrQueryString: string): boolean {
  const cutIx = urlOrQueryString.indexOf("?");
  const urlQs =
    cutIx !== -1 ? urlOrQueryString.substring(cutIx + 1) : urlOrQueryString;
  const params = queryString.parse(urlQs);
  return Boolean(
    params.endpoint &&
      params.fetch &&
      params.actor &&
      params.registration &&
      params.activityId
  );
}

export default addCmi;
