import {HttpContext, HttpContextToken} from '@angular/common/http';
import {ApiErrorCodes} from '../errors/api-error-code';

/**
 * HTTP context token listing API error codes the caller handles locally
 * for this request - e.g. showing a form field error or a toolbar message.
 * The global error handler skips its dialog for these codes; the error
 * itself still propagates to the caller as normal. Codes not listed here
 * are handled by the global error handler.
 */
export const LOCALLY_HANDLED_ERRORS_TOKEN = new HttpContextToken<ApiErrorCodes>(() => []);

/**
 * Builds an HTTP context declaring that the caller handles the given API error codes locally.
 *
 * @param codes - API error codes for which the caller shows its own error message.
 * @returns HTTP context to pass as the `context` option of an HttpClient call.
 */
export function handledLocallyHttpContext(codes: ApiErrorCodes = []): HttpContext {
  return new HttpContext().set(LOCALLY_HANDLED_ERRORS_TOKEN, codes);
}
