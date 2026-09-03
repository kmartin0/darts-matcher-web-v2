import {environment} from '../../environments/environment';

const DARTS_MATCHER_API_BASE_URL = environment.dartsMatcherApiUrl;

export const DARTS_MATCHER_REST_ENDPOINTS = {
  X01: {
    MATCHES: `${DARTS_MATCHER_API_BASE_URL}/matches/x01`,
    MATCH: (matchId: string): string => `${DARTS_MATCHER_API_BASE_URL}/matches/x01/${matchId}`,
    MATCHES_BY_IDS: (matchIds: string[]): string => `${DARTS_MATCHER_API_BASE_URL}/matches/x01?ids=${matchIds}`,
    MATCH_EXISTS: (matchId: string): string => `${DARTS_MATCHER_API_BASE_URL}/matches/x01/${matchId}/exists`,
    CHECKOUTS: `${DARTS_MATCHER_API_BASE_URL}/checkouts/x01`,
  },
};
