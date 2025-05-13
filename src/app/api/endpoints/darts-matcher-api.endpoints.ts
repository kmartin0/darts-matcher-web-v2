import {environment} from '../../../environments/environment';
import {ObjectId} from '../../models/object-id';

export const BASE_URL = environment.dartsMatcherApiUrl;

export const DARTS_MATCHER_API_ENDPOINTS = {
  CREATE_MATCH: `${BASE_URL}/matches`,
  GET_MATCH: (matchId: ObjectId): string => `${BASE_URL}/matches/${matchId}`
}
