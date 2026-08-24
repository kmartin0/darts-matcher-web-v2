import {environment} from '../../environments/environment';

const DARTS_MATCHER_API_BASE_URL = environment.dartsMatcherApiUrl;

export const DARTS_MATCHER_API_ENDPOINTS = {
  X01_MATCHES: `${DARTS_MATCHER_API_BASE_URL}/x01/matches`,
  X01_MATCH: (matchId: string): string => `${DARTS_MATCHER_API_BASE_URL}/x01/matches/${matchId}`,
  GET_X01_MATCHES: (matchIds: string[]): string => `${DARTS_MATCHER_API_BASE_URL}/x01/matches?ids=${matchIds}`,
  X01_MATCH_EXISTS: (matchId: string): string => `${DARTS_MATCHER_API_BASE_URL}/x01/matches/${matchId}/exists`,
  X01_CHECKOUTS: `${DARTS_MATCHER_API_BASE_URL}/checkouts`
};
