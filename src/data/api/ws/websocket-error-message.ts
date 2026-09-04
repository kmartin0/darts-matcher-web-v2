import {ApiErrorCode} from '../errors/api-error-code';
import {ApiTargetErrors} from '../errors/api-target-errors';

export interface WebSocketErrorMessage {
  destination: string;
  error: ApiErrorCode;
  description: string;
  code: number;
  targetErrors?: ApiTargetErrors;
}
