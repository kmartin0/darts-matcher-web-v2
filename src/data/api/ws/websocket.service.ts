import {inject, Injectable} from '@angular/core';
import {
  defer,
  distinctUntilChanged,
  EMPTY,
  filter,
  finalize,
  map,
  merge,
  mergeMap, MonoTypeOperatorFunction,
  Observable,
  share,
  switchMap,
  take,
  tap,
  throwError
} from 'rxjs';
import {environment} from '../../../environments/environment';
import {IRxStompPublishParams, RxStomp, RxStompConfig, RxStompState} from '@stomp/rx-stomp';
import {StreamConnectionState, StreamEvent} from '../../repository/stream-event.type';
import {DARTS_MATCHER_WS_DESTINATIONS} from '../ws-endpoints';
import {WebSocketErrorResponse} from './websocket-error-response';
import {ApiErrorHandlerService} from '../errors/api-error-handler.service';

/**
 * Provides shared WebSocket communication through a single RxStomp connection.
 *
 * The connection is activated when the first consumer subscribes and deactivated
 * when the final consumer unsubscribes.
 */
@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private readonly apiErrorHandlerService = inject(ApiErrorHandlerService);
  private readonly rxStomp = this.createRxStomp();
  private activeConsumers = 0;

  readonly connected$ = this.rxStomp.connected$;
  readonly connectionState$: Observable<StreamConnectionState> = this.createConnectionState(this.rxStomp);
  readonly errorQueue$ = this.createErrorQueue();

  /**
   * Watches a STOMP destination and exposes its data, connection state, and matching WebSocket errors as a single stream.
   *
   * Optionally requests the latest data from a separate destination whenever the WebSocket connection is established.
   *
   * @typeParam T - Type of data received from the destination.
   * @param destination - STOMP destination to observe.
   * @param responseOnConnectDestination - Optional destination used to request data after connecting.
   * @returns Stream of data and connection state events.
   */
  watch<T>(destination: string, responseOnConnectDestination?: string): Observable<StreamEvent<T>> {
    const dataEvent$ = this.createDataEventStream<T>(destination, responseOnConnectDestination);
    const connectionEvent$ = this.createConnectionEventStream<T>();
    const error$ = this.createErrorStream(destination, responseOnConnectDestination);

    return merge(dataEvent$, connectionEvent$, error$).pipe(
      this.createLoggingOperator(`ws stream: ${destination}`)
    );
  }

  /**
   * Publishes a message to a STOMP destination.
   *
   * @param destination - STOMP destination to publish to.
   * @param body - Optional message body.
   * @throws When publishing the message fails.
   */
  publish(destination: string, body?: unknown): void {
    console.log(`ws outgoing: ${destination}`);
    console.log(body);

    this.rxStomp.publish(this.createPublishParams(destination, body));
  }

  /**
   * Creates the data event stream for a STOMP destination.
   *
   * When a response-on-connect destination is provided, one response is requested
   * whenever the WebSocket connection is established.
   *
   * @typeParam T - Type of data received from the destination.
   * @param destination - STOMP destination to observe.
   * @param responseOnConnectDestination - Optional destination used to request data after connecting.
   * @returns Stream of data events.
   */
  private createDataEventStream<T>(destination: string, responseOnConnectDestination?: string): Observable<StreamEvent<T>> {
    let responseOnConnect$: Observable<T> = EMPTY;

    if (responseOnConnectDestination) {
      responseOnConnect$ = this.connected$.pipe(
        switchMap(() => this.watchDestination<T>(responseOnConnectDestination).pipe(take(1)))
      );
    }

    return merge(responseOnConnect$, this.watchDestination<T>(destination)).pipe(
      map((data): StreamEvent<T> => ({type: 'data', data}))
    );
  }

  /**
   * Creates the connection state event stream.
   *
   * @typeParam T - Data type of the stream the connection events belong to.
   * @returns Stream of connection state events.
   */
  private createConnectionEventStream<T>(): Observable<StreamEvent<T>> {
    return this.connectionState$.pipe(
      map((connectionState): StreamEvent<T> => ({type: 'connection', state: connectionState}))
    );
  }

  /**
   * Creates an error stream for errors associated with the provided destinations.
   *
   * Matching WebSocket errors are emitted through the observable error channel.
   *
   * @param destination - Primary STOMP destination to match errors against.
   * @param responseOnConnectDestination - Optional response destination to match errors against.
   * @returns Observable that errors when a matching WebSocket error is received.
   */
  private createErrorStream(destination: string, responseOnConnectDestination?: string): Observable<never> {
    return this.errorQueue$.pipe(
      filter(error =>
        error.destination === destination
        || error.destination === responseOnConnectDestination
      ),
      mergeMap(error => throwError(() => error))
    );
  }

  /**
   * Watches a STOMP destination while managing the shared connection lifecycle.
   *
   * @typeParam T - Type of data received from the destination.
   * @param destination - STOMP destination to observe.
   * @returns Observable of parsed destination messages.
   */
  private watchDestination<T>(destination: string): Observable<T> {
    return defer(() => {
      this.acquireConnection();

      return this.rxStomp.watch(destination).pipe(
        map(message => JSON.parse(message.body) as T),
        finalize(() => this.releaseConnection()),
      );
    });
  }

  /**
   * Creates the shared WebSocket error queue.
   *
   * Errors are handled globally before being shared with destination consumers.
   *
   * @returns Shared observable of WebSocket API errors.
   */
  private createErrorQueue(): Observable<WebSocketErrorResponse> {
    return this.watchDestination<WebSocketErrorResponse>(DARTS_MATCHER_WS_DESTINATIONS.ERROR_QUEUE).pipe(
      this.createLoggingOperator('ws error queue:'),
      tap(error => this.apiErrorHandlerService.handle(error)),
      share()
    );
  }

  /**
   * Registers a WebSocket consumer and activates the connection when needed.
   */
  private acquireConnection(): void {
    this.activeConsumers++;

    if (!this.rxStomp.active) {
      this.rxStomp.activate();
    }
  }

  /**
   * Releases a WebSocket consumer and deactivates the connection when none remain.
   */
  private releaseConnection(): void {
    this.activeConsumers--;

    if (this.activeConsumers === 0) {
      void this.rxStomp.deactivate();
    }
  }

  /**
   * Creates and configures the shared RxStomp instance.
   *
   * @returns Configured RxStomp instance.
   */
  private createRxStomp(): RxStomp {
    const rxStomp = new RxStomp();
    rxStomp.configure(this.createConfig());
    return rxStomp;
  }

  /**
   * Creates the RxStomp connection configuration.
   *
   * @returns RxStomp configuration.
   */
  private createConfig(): RxStompConfig {
    return {
      brokerURL: environment.dartsMatcherWebSocketUrl,
      reconnectDelay: 4000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    };
  }

  /**
   * Maps RxStomp connection states to application stream connection states.
   *
   * @param rxStomp - RxStomp instance whose connection state is observed.
   * @returns Observable of application stream connection states.
   */
  private createConnectionState(rxStomp: RxStomp): Observable<StreamConnectionState> {
    return rxStomp.connectionState$.pipe(
      map(state => {
        switch (state) {
          case RxStompState.CONNECTING:
            return 'connecting';

          case RxStompState.OPEN:
            return 'connected';

          case RxStompState.CLOSING:
          case RxStompState.CLOSED:
            return 'disconnected';
        }
      }),
      distinctUntilChanged(),
    );
  }

  /**
   * Creates publish parameters for a STOMP message.
   *
   * @param destination - STOMP destination to publish to.
   * @param body - Optional message body.
   * @returns RxStomp publish parameters.
   */
  private createPublishParams(destination: string, body?: unknown): IRxStompPublishParams {
    const publishParams: IRxStompPublishParams = {
      destination,
      retryIfDisconnected: false,
    };

    if (body != null) {
      publishParams.body = typeof body === 'object' ? JSON.stringify(body) : String(body);
    }

    return publishParams;
  }

  /**
   * Creates an operator that logs each emitted value.
   *
   * @typeParam T - Type of value being logged.
   * @param message - Message identifying the logged stream.
   * @returns Operator that logs emitted values without modifying them.
   */
  private createLoggingOperator<T>(message: string): MonoTypeOperatorFunction<T> {
    return tap(value => {
      console.log(message);
      console.log(value);
    });
  }
}
