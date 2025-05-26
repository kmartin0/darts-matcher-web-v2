import {Injectable} from '@angular/core';
import {ApiService} from './api.service';
import {RxStomp, RxStompConfig} from '@stomp/rx-stomp';
import {
  DARTS_MATCHER_WEBSOCKET_BASE_URL,
  DARTS_MATCHER_WEBSOCKET_DESTINATIONS
} from '../endpoints/darts-matcher-websocket.endpoints';
import {map, Observable, take} from 'rxjs';
import {X01Match} from '../../models/x01-match/x01-match';
import {X01MatchPlayer} from '../../models/x01-match/x01-match-player';

@Injectable({providedIn: 'root'})
export class DartsMatcherWebsocketService {

  private readonly rxStomp: RxStomp;

  constructor(private api: ApiService) {
    this.rxStomp = new RxStomp();
    this.rxStomp.configure(this.createRxStompConfig());
    this.rxStomp.activate();
  }

  private createRxStompConfig(): RxStompConfig {
    return {
      brokerURL: DARTS_MATCHER_WEBSOCKET_BASE_URL,
      reconnectDelay: 2000,
      heartbeatIncoming: 0,
      heartbeatOutgoing: 20000,
      debug: (msg: string) => console.log(msg)
    };
  }

  subscribeToX01MatchBroadcast(matchId: string): Observable<X01Match> {
    const destination = DARTS_MATCHER_WEBSOCKET_DESTINATIONS.SUBSCRIBE.BROADCAST.X01_GET_MATCH(matchId);
    return this.rxStomp.watch(destination).pipe(
      map(message => JSON.parse(message.body) as X01Match)
    );
  }

  subscribeToX01MatchSingleResponse(matchId: string): Observable<X01Match> {
    const destination = DARTS_MATCHER_WEBSOCKET_DESTINATIONS.SUBSCRIBE.SINGLE_RESPONSE.X01_GET_MATCH(matchId);
    return this.rxStomp.watch(destination).pipe(
      take(1), // Complete after the first response.
      map(message => JSON.parse(message.body) as X01Match)
    );
  }

  // Add disconnect if needed:
  deactivate() {
    void this.rxStomp.deactivate().catch(err => {
      console.error('Error while deactivating WebSocket:', err);
    });
  }

}
