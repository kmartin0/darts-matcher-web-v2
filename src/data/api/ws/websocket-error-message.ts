import {ApiErrorResponse, isApiErrorResponse} from '../errors/api-error-response';

export interface WebSocketErrorMessage extends ApiErrorResponse {
  destination: string;
}

/**
 * Checks whether a value matches the WebSocket error message contract.
 *
 * @param value - Value to check.
 * @returns Whether the value is a valid WebSocket error message.
 */
export function isWebSocketErrorMessage(value: unknown): value is WebSocketErrorMessage {
  if (!isApiErrorResponse(value)) {
    return false;
  }

  return (
    'destination' in value &&
    typeof value.destination === 'string'
  );
}
