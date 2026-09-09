import {HttpContext, HttpContextToken} from '@angular/common/http';
import {ApiErrorCodes} from '../errors/api-error-code';

/**
 * HTTP context token containing API error codes handled locally by the caller.
 *
 * Locally handled errors still propagate to the caller, but are skipped by the
 * global error handler.
 */
export const LOCALLY_HANDLED_ERRORS_TOKEN = new HttpContextToken<ApiErrorCodes>(() => []);

/**
 * Builds an HTTP context declaring that the caller handles the given API error codes locally.
 *
 * @param codes - API error codes handled locally by the caller.
 * @returns HTTP context to pass as the `context` option of an HttpClient call.
 */
export function handledLocallyHttpContext(codes: ApiErrorCodes = []): HttpContext {
  return new HttpContext().set(LOCALLY_HANDLED_ERRORS_TOKEN, codes);
}
