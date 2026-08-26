import {ApiErrorResponse} from '../errors/api-error-response';

export interface WebSocketErrorResponse extends ApiErrorResponse {
  destination: string;
}
