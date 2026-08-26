import {catchError, MonoTypeOperatorFunction, throwError} from 'rxjs';
import {mapHttpErrorToApiErrorResponse} from './http-error.mapper';

/**
 * Unwraps API error responses from HTTP errors while preserving unknown errors.
 *
 * @typeParam T - Observable value type.
 * @returns Operator that rethrows an API error response when available,
 * otherwise rethrows the original error.
 */
export function unwrapApiError<T>(): MonoTypeOperatorFunction<T> {
  return catchError((error: unknown) =>
    throwError(() => mapHttpErrorToApiErrorResponse(error) ?? error)
  );
}
