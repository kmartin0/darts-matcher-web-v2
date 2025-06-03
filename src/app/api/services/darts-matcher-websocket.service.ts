import {DestroyRef, Injectable} from '@angular/core';
import {IMessage, RxStomp, RxStompConfig, RxStompState} from '@stomp/rx-stomp';
import {
  DARTS_MATCHER_WEBSOCKET_BASE_URL,
  DARTS_MATCHER_WS_DESTINATIONS,
  WsDestType
} from '../endpoints/darts-matcher-websocket.endpoints';
import {distinctUntilChanged, filter, map, merge, Observable, switchMap, take, tap} from 'rxjs';
import {X01Match} from '../../models/x01-match/x01-match';
import {X01Turn} from '../../models/x01-match/x01-turn';
import {ApiWsErrorBody, isApiWsErrorBody} from '../error/api-ws-error-body';

// TODO: Since service is a singleton. If this were used at the same time and one component calls deactivate.
// TODO: Then all other components will have their connection closed.
@Injectable({providedIn: 'root'})
export class DartsMatcherWebsocketService {

  private readonly rxStomp: RxStomp;
  private activeConnections: Set<DestroyRef> = new Set<DestroyRef>();

  /**
   * Initializes the WebSocket service with RxStomp configuration and activates the connection.
   */
  constructor() {
    this.rxStomp = new RxStomp();
    this.rxStomp.configure(this.createRxStompConfig());
  }

  /**
   * Connects a component to the WebSocket service and manages its lifecycle.
   *
   * If the WebSocket client is not active, it activates the connection.
   * Tracks the component's DestroyRef to manage active connections and
   * automatically deactivates the WebSocket client when no active connections remain.
   *
   * @param {DestroyRef} destroyRef - The Angular DestroyRef instance tied to the component's lifecycle.
   */
  connect(destroyRef: DestroyRef) {
    // If the component is already connected, do nothing.
    if (this.activeConnections.has(destroyRef)) return;

    // Activate the STOMP client if not active.
    if (!this.rxStomp.active) this.rxStomp.activate();

    // Add the component to the active connections.
    this.activeConnections.add(destroyRef);

    // On component destroy, remove from active connections and deactivate if none remain.
    destroyRef.onDestroy(() => {
      this.activeConnections.delete(destroyRef);
      if (this.activeConnections.size === 0) this.rxStomp.deactivate().catch(err => {
        console.error('WebSocket deactivation error:', err);
      });
    });
  }

  getErrorQueue(): Observable<ApiWsErrorBody> {
    const destination = DARTS_MATCHER_WS_DESTINATIONS.SUBSCRIBE.ERROR_QUEUE;
    return this.watch(destination).pipe(
      map(message => {
        const parsedBody = JSON.parse(message.body);
        if (!isApiWsErrorBody(parsedBody)) throw new Error('An unknown error occurred');

        return parsedBody as ApiWsErrorBody;
      })
    );
  }

  /**
   * Subscribes to the broadcast WebSocket topic for updates to an X01 match.
   *
   * @param {string} matchId - The ID of the match to subscribe to.
   * @returns {Observable<X01Match>} An observable emitting match updates.
   */
  getX01MatchBroadcast(matchId: string): Observable<X01Match> {
    const destination = DARTS_MATCHER_WS_DESTINATIONS.SUBSCRIBE.X01_GET_MATCH(matchId, WsDestType.BROADCAST);

    return this.watchBroadcast<X01Match>(destination, this.getX01MatchSingleResponse(matchId));
  }

  /**
   * Subscribes to receive a single response with X01 match data.
   *
   * @param {string} matchId - The ID of the match to retrieve.
   * @returns {Observable<X01Match>} An observable that emits the match data once and completes.
   */
  getX01MatchSingleResponse(matchId: string): Observable<X01Match> {
    const destination = DARTS_MATCHER_WS_DESTINATIONS.SUBSCRIBE.X01_GET_MATCH(matchId, WsDestType.SINGLE_RESPONSE);

    return this.watch(destination).pipe(
      take(1), // Complete after the first response.
      map(message => {
        return JSON.parse(message.body) as X01Match;
      })
    );
  }

  /**
   * Publishes a new X01 turn to the server via WebSocket.
   *
   * @param {X01Turn} turn - The turn data to send.
   */
  publishX01MatchTurn(turn: X01Turn) {
    const destination = DARTS_MATCHER_WS_DESTINATIONS.PUBLISH.X01_ADD_TURN;

    return this.publish(destination, turn);
  }

  /**
   * Deactivates the RxStomp WebSocket connection.
   * Logs an error if deactivation fails.
   */
  deactivate() {
    this.rxStomp.deactivate().catch(err => {
      console.error('Error while deactivating WebSocket:', err);
    });
  }

  /**
   * Creates and returns the configuration object for RxStomp.
   *
   * @returns {RxStompConfig} The configuration for the RxStomp client.
   */
  private createRxStompConfig(): RxStompConfig {
    return {
      brokerURL: DARTS_MATCHER_WEBSOCKET_BASE_URL,
      reconnectDelay: 2000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000
    };
  }

  private watchBroadcast<T>(destination: string, singleResponse$: Observable<T>) {
    // Create the broadcast observable.
    const broadcast$ = this.watch(destination).pipe(
      map(message => JSON.parse(message.body) as T)
    );

    // Create the single response observable.
    const singleResponseOnConnect$ = this.rxStomp.connected$.pipe(
      filter(stompState => stompState === RxStompState.OPEN),
      switchMap(() => singleResponse$)
    );

    return merge(singleResponseOnConnect$, broadcast$).pipe(
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
    );
  }

  private watch(destination: string): Observable<IMessage> {
    return this.rxStomp.watch(destination).pipe(
      tap(message => {
        console.log(`ws incoming: ${destination}`);
        console.log(JSON.parse(message.body));
      })
    );
  }

  private publish(destination: string, body: object) {
    console.log('ws outgoing: ', destination);
    console.log(body);
    this.rxStomp.publish({
      destination: destination,
      body: JSON.stringify(body)
    });
  }

}
