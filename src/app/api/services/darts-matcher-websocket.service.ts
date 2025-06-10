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
import {X01EditTurn} from '../../models/x01-match/x01-edit-turn';
import {X01DeleteLastTurn} from '../../models/x01-match/x01-delete-last-turn';

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

  /**
   * Subscribes to the WebSocket error queue and emits API WebSocket error messages.
   *
   * Parses incoming messages and validates them against the `ApiWsErrorBody` type guard. If a message
   * doesn't match the expected structure, an error is thrown.
   *
   * @returns An observable emitting validated `ApiWsErrorBody` objects received from the error queue destination.
   * @throws An error if the received message body does not conform to the `ApiWsErrorBody` format.
   */
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
  publishX01AddTurn(turn: X01Turn) {
    const destination = DARTS_MATCHER_WS_DESTINATIONS.PUBLISH.X01_ADD_TURN;

    this.publish(destination, turn);
  }

  /**
   * Publishes an edited X01 turn to the server via WebSocket.
   *
   * @param {X01EditTurn} editTurn - The edit turn data to send.
   */
  publishX01EditTurn(editTurn: X01EditTurn) {
    const destination = DARTS_MATCHER_WS_DESTINATIONS.PUBLISH.X01_EDIT_TURN;

    this.publish(destination, editTurn);
  }

  /**
   * Publishes a request to delete the last X01 turn from a match to the server via WebSocket.
   *
   * @param {X01DeleteLastTurn} deleteLastTurn - The body which contains from which match to delete the last turn from.
   */
  publishX01DeleteLastTurn(deleteLastTurn: X01DeleteLastTurn) {
    const destination = DARTS_MATCHER_WS_DESTINATIONS.PUBLISH.X01_DELETE_LAST_TURN;

    this.publish(destination, deleteLastTurn);
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

  /**
   * Watches a WebSocket destination and merges broadcast messages with a single-response observable (optional).
   * This ensures that subscribing to a broadcast destination also emits an initial value.
   *
   * @template T - The expected type of the message payload after parsing.
   * @param destination - The WebSocket destination to subscribe to.
   * @param singleResponse$ - An observable that emits a single response once connected. (optional)
   * @returns An observable emitting both the single response (on connect) and broadcast messages,
   *          filtered to avoid duplicate emissions.
   */
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

  /**
   * Subscribes to a WebSocket destination and logs all incoming messages to the console.
   *
   * @param destination - The WebSocket destination to subscribe to.
   * @returns An observable emitting raw STOMP messages received from the destination.
   */
  private watch(destination: string): Observable<IMessage> {
    return this.rxStomp.watch(destination).pipe(
      tap(message => {
        console.log(`ws incoming: ${destination}`);
        console.log(JSON.parse(message.body));
      })
    );
  }

  /**
   * Sends a message to the specified WebSocket destination.
   *
   * @param destination - The destination to which the message should be sent.
   * @param body - The message payload to be serialized and sent.
   */
  private publish(destination: string, body: object) {
    console.log('ws outgoing: ', destination);
    console.log(body);
    this.rxStomp.publish({
      destination: destination,
      body: JSON.stringify(body)
    });
  }
}
