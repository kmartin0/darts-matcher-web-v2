import {HttpErrorResponse} from '@angular/common/http';
import {ApiErrorResponse, isApiErrorResponse} from '../errors/api-error-response';

/**
 * Maps an HTTP error to an API error response.
 *
 * @param error - Error to map.
 * @returns Parsed API error response, or undefined when the error does not contain one.
 */
export function mapHttpErrorToApiErrorResponse(error: unknown): ApiErrorResponse | undefined {
  if (!(error instanceof HttpErrorResponse)) return undefined;

  return isApiErrorResponse(error.error)
    ? error.error
    : undefined;
}
