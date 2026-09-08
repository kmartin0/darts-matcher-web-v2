import {ApiErrorCode} from '../errors/api-error-code';
import {ApiTargetErrors, isApiTargetErrors} from '../errors/api-target-errors';

export interface WebSocketErrorMessage {
  destination: string;
  error: ApiErrorCode;
  description: string;
  code: number;
  targetErrors?: ApiTargetErrors;
}

export function isWebSocketErrorMessage(value: unknown): value is WebSocketErrorMessage {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('destination' in value) ||
    !('error' in value) ||
    !('description' in value) ||
    !('code' in value)
  ) {
    return false;
  }

  return (
    typeof value.destination === 'string' &&
    Object.values(ApiErrorCode).includes(value.error as ApiErrorCode) &&
    typeof value.description === 'string' &&
    typeof value.code === 'number' &&
    (!('targetErrors' in value) || isApiTargetErrors(value.targetErrors))
  );
}
