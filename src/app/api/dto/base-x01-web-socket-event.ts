import {X01WebSocketEventType} from './x01-web-socket-event-type';
import {X01Match} from '../../models/x01-match/x01-match';

/**
 * Base interface for all X01 WebSocket events.
 */
export interface BaseX01WebSocketEvent<T = any> {
  eventType: X01WebSocketEventType;
  payload: T;
}

/**
 * WebSocket event for updating an X01 match.
 */
type UpdateMatchEvent = BaseX01WebSocketEvent<X01Match> & {
  eventType: X01WebSocketEventType.UPDATE_MATCH;
};

/**
 * WebSocket event for deleting an X01 match.
 */
type DeleteMatchEvent = BaseX01WebSocketEvent<string> & {
  eventType: X01WebSocketEventType.DELETE_MATCH;
};

/**
 * Union type of all supported X01 WebSocket event shapes.
 */
export type X01WebSocketEvent =
  | UpdateMatchEvent
  | DeleteMatchEvent;
