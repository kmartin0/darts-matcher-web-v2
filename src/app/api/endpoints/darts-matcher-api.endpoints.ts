import {environment} from '../../../environments/environment';

export const DARTS_MATCHER_API_BASE_URL = environment.dartsMatcherApiUrl;

export const DARTS_MATCHER_API_ENDPOINTS = {
  CREATE_MATCH: `${DARTS_MATCHER_API_BASE_URL}/matches`,
  GET_MATCH: (matchId: string): string => `${DARTS_MATCHER_API_BASE_URL}/matches/${matchId}`,
  GET_X01_CHECKOUTS: `${DARTS_MATCHER_API_BASE_URL}/checkouts`,
}
