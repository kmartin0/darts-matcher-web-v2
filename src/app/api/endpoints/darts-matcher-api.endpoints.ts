import {environment} from '../../../environments/environment';

export const BASE_URL = environment.dartsMatcherApiUrl;

export const DARTS_MATCHER_API_ENDPOINTS = {
CREATE_MATCH: `${BASE_URL}/matches`
}
