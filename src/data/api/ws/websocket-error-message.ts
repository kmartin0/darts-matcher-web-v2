import {ApiErrorCode} from '../errors/api-error-code';

export interface WebSocketErrorMessage {
  destination: string;
  error: ApiErrorCode;
  description: string;
  code: number;
  targetErrors?: Record<string, string>;
}
