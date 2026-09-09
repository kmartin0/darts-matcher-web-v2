import {ALL_API_ERROR_CODES, ApiErrorCode} from './api-error-code';
import {ApiTargetErrors, isApiTargetErrors} from './api-target-errors';

export interface ApiErrorResponse {
  type: ApiErrorCode;
  description: string;
  status: number;
  targetErrors?: ApiTargetErrors;
}

/**
 * Checks whether a value matches the API error response contract.
 *
 * @param value - Value to check.
 * @returns Whether the value is a valid API error response.
 */
export function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('type' in value) ||
    !('description' in value) ||
    !('status' in value)
  ) {
    return false;
  }

  return (
    ALL_API_ERROR_CODES.includes(value.type as ApiErrorCode) &&
    typeof value.description === 'string' &&
    typeof value.status === 'number' &&
    (!('targetErrors' in value) || isApiTargetErrors(value.targetErrors))
  );
}
