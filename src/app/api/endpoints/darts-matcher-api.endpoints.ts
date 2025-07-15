import {environment} from '../../../environments/environment';

export const DARTS_MATCHER_API_BASE_URL = environment.dartsMatcherApiUrl;

export const DARTS_MATCHER_API_ENDPOINTS = {
  CREATE_MATCH: `${DARTS_MATCHER_API_BASE_URL}/x01/matches`,
  GET_MATCH: (matchId: string): string => `${DARTS_MATCHER_API_BASE_URL}/x01/matches/${matchId}`,
  GET_MATCHES: (matchIds: string[]): string => `${DARTS_MATCHER_API_BASE_URL}/x01/matches?ids=${matchIds}`,
  GET_X01_CHECKOUTS: `${DARTS_MATCHER_API_BASE_URL}/checkouts`,
  X01_MATCH_EXISTS: (matchId: string) => `${DARTS_MATCHER_API_BASE_URL}/x01/matches/${matchId}/exists`
};
