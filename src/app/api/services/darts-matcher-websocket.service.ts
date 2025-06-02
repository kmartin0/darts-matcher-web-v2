import {Injectable} from '@angular/core';
import {RxStomp, RxStompConfig} from '@stomp/rx-stomp';
import {
  DARTS_MATCHER_WEBSOCKET_BASE_URL,
  DARTS_MATCHER_WEBSOCKET_DESTINATIONS
} from '../endpoints/darts-matcher-websocket.endpoints';
import {map, Observable, take} from 'rxjs';
import {X01Match} from '../../models/x01-match/x01-match';
import {X01Turn} from '../../models/x01-match/x01-turn';

@Injectable({providedIn: 'root'})
export class DartsMatcherWebsocketService {

  private readonly rxStomp: RxStomp;

  /**
   * Initializes the WebSocket service with RxStomp configuration and activates the connection.
   */
  constructor() {
    this.rxStomp = new RxStomp();
    this.rxStomp.configure(this.createRxStompConfig());
    this.rxStomp.activate();
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
      heartbeatIncoming: 0,
      heartbeatOutgoing: 20000,
      debug: (msg: string) => console.log(msg)
    };
  }

  /**
   * Subscribes to the broadcast WebSocket topic for updates to an X01 match.
   *
   * @param {string} matchId - The ID of the match to subscribe to.
   * @returns {Observable<X01Match>} An observable emitting match updates.
   */
  subscribeToX01MatchBroadcast(matchId: string): Observable<X01Match> {
    const destination = DARTS_MATCHER_WEBSOCKET_DESTINATIONS.SUBSCRIBE.BROADCAST.X01_GET_MATCH(matchId);
    return this.rxStomp.watch(destination).pipe(
      map(message => {
        return JSON.parse(message.body) as X01Match;
      })
    );
  }

  /**
   * Subscribes to receive a single response with X01 match data.
   *
   * @param {string} matchId - The ID of the match to retrieve.
   * @returns {Observable<X01Match>} An observable that emits the match data once and completes.
   */
  subscribeToX01MatchSingleResponse(matchId: string): Observable<X01Match> {
    const destination = DARTS_MATCHER_WEBSOCKET_DESTINATIONS.SUBSCRIBE.SINGLE_RESPONSE.X01_GET_MATCH(matchId);
    return this.rxStomp.watch(destination).pipe(
      take(1), // Complete after the first response.
      map(message => {
        console.log(message);
        return JSON.parse(message.body) as X01Match;
      })
    );
  }

  /**
   * Sends a new X01 turn to the server via WebSocket.
   *
   * @param {X01Turn} turn - The turn data to send.
   */
  sendX01MatchTurn(turn: X01Turn) {
    const destination = DARTS_MATCHER_WEBSOCKET_DESTINATIONS.SEND.X01_ADD_TURN;
    this.rxStomp.publish({
      destination: destination,
      body: JSON.stringify(turn)
    });
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

}
