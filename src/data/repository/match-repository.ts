import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CreateMatchRequestDto} from '../dto/create-match-request.dto';
import {Observable} from 'rxjs';
import {X01Match} from '../model/x01/x01-match';
import {DARTS_MATCHER_REST_ENDPOINTS} from '../api/rest-endpoints';
import {unwrapApiError} from '../api/http/http-error.operator';
import {WebSocketService} from '../api/ws/websocket.service';
import {DARTS_MATCHER_WS_DESTINATIONS, WsDestinationType} from '../api/ws-endpoints';
import {StreamEvent} from './stream-event.type';
import {
  DeleteLastTurnMessage,
  DeleteMatchMessage,
  MatchMessageUnion,
  ProcessMatchMessage,
  ResetMatchMessage
} from '../api/ws/match-message';
import {handledLocallyHttpContext} from '../api/http/http-api-error-context';
import {ApiErrorCodes} from '../api/errors/api-error-code';

@Injectable({providedIn: 'root'})
export class MatchRepository {
  private readonly http = inject(HttpClient);
  private readonly webSocket = inject(WebSocketService);

  /**
   * Creates an X01 match.
   *
   * @param body - Match creation request.
   * @param handleLocally - API error codes handled locally by the caller.
   * @returns Observable containing the created match.
   */
  createMatch(body: CreateMatchRequestDto, handleLocally: ApiErrorCodes = []): Observable<X01Match> {
    const context = handledLocallyHttpContext(handleLocally);
    return this.http.post<X01Match>(DARTS_MATCHER_REST_ENDPOINTS.X01.MATCHES, body, {context}).pipe(unwrapApiError());
  }

  /**
   * Gets existing X01 matches for the supplied match IDs.
   *
   * @param matchIds - Match IDs to retrieve.
   * @param handleLocally - API error codes handled locally by the caller.
   * @returns Observable containing the existing matches.
   */
  getMatches(matchIds: string[], handleLocally: ApiErrorCodes = []): Observable<X01Match[]> {
    const context = handledLocallyHttpContext(handleLocally);
    return this.http.get<X01Match[]>(DARTS_MATCHER_REST_ENDPOINTS.X01.MATCHES_BY_IDS(matchIds), {context}).pipe(unwrapApiError());
  }

  /**
   * Checks whether an X01 match exists.
   *
   * @param matchId - ID of the match to check.
   * @param handleLocally - API error codes handled locally by the caller.
   * @returns Observable that completes when the match exists.
   */
  matchExists(matchId: string, handleLocally: ApiErrorCodes = []): Observable<void> {
    const context = handledLocallyHttpContext(handleLocally);
    return this.http.get<void>(DARTS_MATCHER_REST_ENDPOINTS.X01.MATCH_EXISTS(matchId), {context}).pipe(unwrapApiError());
  }

  /**
   * Streams updates and connection state for an X01 match.
   *
   * @param matchId - ID of the match to stream.
   * @param handleLocally - API error codes handled locally by the caller.
   * @returns Observable containing match messages and connection state events.
   */
  streamMatch(matchId: string, handleLocally: ApiErrorCodes = []): Observable<StreamEvent<MatchMessageUnion>> {
    const broadcastDestination = DARTS_MATCHER_WS_DESTINATIONS.X01.SUBSCRIBE.MATCH(matchId, WsDestinationType.BROADCAST);
    const responseOnConnectDestination = DARTS_MATCHER_WS_DESTINATIONS.X01.SUBSCRIBE.MATCH(matchId, WsDestinationType.SINGLE_RESPONSE);

    return this.webSocket.watch<MatchMessageUnion>(broadcastDestination, responseOnConnectDestination, handleLocally);
  }

  /**
   * Reprocesses an X01 match.
   *
   * @param matchId - ID of the match to reprocess.
   * @param handleLocally - API error codes handled locally by the caller.
   * @returns Observable containing the processed match message.
   */
  reprocessMatch(matchId: string, handleLocally: ApiErrorCodes = []): Observable<ProcessMatchMessage> {
    const destination = DARTS_MATCHER_WS_DESTINATIONS.X01.PUBLISH.REPROCESS_MATCH(matchId);
    return this.webSocket.publish<ProcessMatchMessage>(destination, undefined, handleLocally);
  }

  /**
   * Resets an X01 match.
   *
   * @param matchId - ID of the match to reset.
   * @param handleLocally - API error codes handled locally by the caller.
   * @returns Observable containing the reset match message.
   */
  resetMatch(matchId: string, handleLocally: ApiErrorCodes = []): Observable<ResetMatchMessage> {
    const destination = DARTS_MATCHER_WS_DESTINATIONS.X01.PUBLISH.RESET_MATCH(matchId);
    return this.webSocket.publish<ResetMatchMessage>(destination, undefined, handleLocally);
  }

  /**
   * Deletes an X01 match.
   *
   * @param matchId - ID of the match to delete.
   * @param handleLocally - API error codes handled locally by the caller.
   * @returns Observable containing the delete match message.
   */
  deleteMatch(matchId: string, handleLocally: ApiErrorCodes = []): Observable<DeleteMatchMessage> {
    const destination = DARTS_MATCHER_WS_DESTINATIONS.X01.PUBLISH.DELETE_MATCH(matchId);
    return this.webSocket.publish<DeleteMatchMessage>(destination, undefined, handleLocally);
  }

  /**
   * Deletes the last turn from a match.
   *
   * @param matchId - ID of the match whose last turn should be deleted.
   * @param handleLocally - API error codes handled locally by the caller.
   * @returns Observable containing the delete-last-turn WebSocket message.
   */
  deleteLastTurn(matchId: string, handleLocally: ApiErrorCodes = []): Observable<DeleteLastTurnMessage> {
    const destination = DARTS_MATCHER_WS_DESTINATIONS.X01.PUBLISH.DELETE_LAST_TURN(matchId);
    return this.webSocket.publish<DeleteLastTurnMessage>(destination, undefined, handleLocally);
  }
}
