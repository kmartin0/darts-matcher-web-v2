import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CreateMatchRequestDto} from '../dto/create-match-request.dto';
import {Observable} from 'rxjs';
import {X01Match} from '../model/x01/x01-match';
import {DARTS_MATCHER_REST_ENDPOINTS} from '../api/rest-endpoints';
import {unwrapApiError} from '../api/http/http-error.operator';
import {WebSocketService} from '../api/ws/websocket.service';
import {MatchEventUnion, ProcessMatchEvent} from '../api/ws/match-event';
import {DARTS_MATCHER_WS_DESTINATIONS, WsDestinationType} from '../api/ws-endpoints';
import {StreamEvent} from './stream-event.type';


@Injectable({providedIn: 'root'})
export class MatchRepository {
  private readonly http = inject(HttpClient);
  private readonly webSocket = inject(WebSocketService);

  createMatch(body: CreateMatchRequestDto): Observable<X01Match> {
    return this.http.post<X01Match>(DARTS_MATCHER_REST_ENDPOINTS.X01.MATCHES, body).pipe(unwrapApiError());
  }

  getMatch(matchId: string): Observable<X01Match> {
    return this.http.get<X01Match>(DARTS_MATCHER_REST_ENDPOINTS.X01.MATCH(matchId)).pipe(unwrapApiError());
  }

  getMatches(matchIds: string[]): Observable<X01Match[]> {
    return this.http.get<X01Match[]>(DARTS_MATCHER_REST_ENDPOINTS.X01.MATCHES_BY_IDS(matchIds)).pipe(unwrapApiError());
  }

  matchExists(matchId: string): Observable<void> {
    return this.http.get<void>(DARTS_MATCHER_REST_ENDPOINTS.X01.MATCH_EXISTS(matchId)).pipe(unwrapApiError());
  }

  streamMatch(matchId: string): Observable<StreamEvent<MatchEventUnion>> {
    const broadcastDestination = DARTS_MATCHER_WS_DESTINATIONS.X01.SUBSCRIBE.MATCH(matchId, WsDestinationType.BROADCAST);
    const responseOnConnectDestination = DARTS_MATCHER_WS_DESTINATIONS.X01.SUBSCRIBE.MATCH(matchId, WsDestinationType.SINGLE_RESPONSE);

    return this.webSocket.watch<MatchEventUnion>(broadcastDestination, responseOnConnectDestination);
  }

  reprocessMatch(matchId: string): Observable<ProcessMatchEvent> {
    return this.webSocket.publish<ProcessMatchEvent>(DARTS_MATCHER_WS_DESTINATIONS.X01.PUBLISH.REPROCESS_MATCH(matchId));
  }
}
