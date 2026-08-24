import {environment} from '../../environments/environment';

const DARTS_MATCHER_API_BASE_URL = environment.dartsMatcherApiUrl;

export const DARTS_MATCHER_API_ENDPOINTS = {
  X01: {
    MATCHES: `${DARTS_MATCHER_API_BASE_URL}/x01/matches`,
    MATCH: (matchId: string): string => `${DARTS_MATCHER_API_BASE_URL}/x01/matches/${matchId}`,
    MATCHES_BY_IDS: (matchIds: string[]): string => `${DARTS_MATCHER_API_BASE_URL}/x01/matches?ids=${matchIds}`,
    MATCH_EXISTS: (matchId: string): string => `${DARTS_MATCHER_API_BASE_URL}/x01/matches/${matchId}/exists`,
    CHECKOUTS: `${DARTS_MATCHER_API_BASE_URL}/checkouts`,
  },
};
