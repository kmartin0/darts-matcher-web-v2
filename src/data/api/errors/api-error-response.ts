import {ApiErrorCode} from './api-error-code';
import {ApiTargetErrors, isApiTargetErrors} from './api-target-errors';
import {HttpErrorResponse} from '@angular/common/http';

export interface ApiErrorResponse {
  error: ApiErrorCode;
  description?: string;
  error_description?: string;
  code: number;
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
    !('error' in value) ||
    !('code' in value)
  ) {
    return false;
  }

  return (
    Object.values(ApiErrorCode).includes(value.error as ApiErrorCode) &&
    typeof value.code === 'number' &&
    (!('description' in value) || typeof value.description === 'string') &&
    (!('error_description' in value) || typeof value.error_description === 'string') &&
    (!('targetErrors' in value) || isApiTargetErrors(value.targetErrors))
  );
}
