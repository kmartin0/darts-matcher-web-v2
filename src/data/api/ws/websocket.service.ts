import {inject, Injectable} from '@angular/core';
import {
  defer,
  distinctUntilChanged,
  EMPTY,
  filter,
  finalize,
  map,
  merge,
  mergeMap,
  Observable,
  share,
  shareReplay,
  switchMap,
  take,
  tap,
  throwError, timeout
} from 'rxjs';
import {environment} from '../../../environments/environment';
import {IMessage, IRxStompPublishParams, RxStomp, RxStompConfig, RxStompState} from '@stomp/rx-stomp';
import {StreamConnectionState, StreamEvent} from '../../repository/stream-event.type';
import {DARTS_MATCHER_WS_DESTINATIONS} from '../ws-endpoints';
import {ApiErrorHandlerService} from '../errors/api-error-handler.service';
import {WebSocketErrorMessage} from './websocket-error-message';
import {WebSocketMessage} from './websocket-message';
import {tryParseJson} from '../../../shared/utils/json.util';

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
  private readonly publishIdHeader = 'publish-id';

  private readonly connected$ = this.rxStomp.connected$;
  private readonly connectionState$ = this.createConnectionState(this.rxStomp);

  private readonly responseQueue$ = this.createResponseQueue();
  private readonly errorQueue$ = this.createErrorQueue();

  private readonly publishTimeoutMs = 60_000;

  private activeConsumers = 0;

  /**
   * Watches a STOMP destination and exposes its data, connection state, and matching WebSocket errors as a single stream.
   *
   * Optionally requests the latest data from a separate destination whenever the WebSocket connection is established.
   *
   * @typeParam T - Type of WebSocket message received from the destination.
   * @param destination - STOMP destination to observe.
   * @param responseOnConnectDestination - Optional destination used to request data after connecting.
   * @returns Stream of data and connection state events.
   */
  watch<T extends WebSocketMessage<unknown, unknown>>(destination: string, responseOnConnectDestination?: string): Observable<StreamEvent<T>> {
    const dataEvent$ = this.createWatchDataEventStream<T>(destination, responseOnConnectDestination);
    const connectionEvent$ = this.createWatchConnectionEventStream<T>();
    const error$ = this.createWatchErrorStream(destination, responseOnConnectDestination);

    return merge(dataEvent$, connectionEvent$, error$);
  }

  /**
   * Publishes a message to a STOMP destination and waits for its correlated response.
   *
   * A unique publish ID is attached to the outgoing message and used to match either
   * a response from the shared response queue or an error from the shared error queue.
   * The operation times out when no matching response or error is received within
   * the configured publish timeout.
   *
   * The message is published when the returned observable is subscribed to.
   *
   * @typeParam T - Type of the WebSocket message returned for the publish.
   * @param destination - STOMP destination to publish to.
   * @param body - Optional message body.
   * @returns Observable that emits the matching WebSocket message or errors when the publish fails or times out.
   */
  publish<T extends WebSocketMessage<unknown, unknown>>(destination: string, body?: unknown): Observable<T> {
    return new Observable<T>(subscriber => {
      const publishId = this.createPublishId();

      const resultSubscription = merge(
        this.createPublishResponseStream<T>(publishId),
        this.createPublishErrorStream(publishId)
      )
        .pipe(
          take(1),
          timeout({first: this.publishTimeoutMs})
        )
        .subscribe(subscriber);

      try {
        console.log('publish:', destination, {publishId, body: typeof body === 'string' ? tryParseJson(body) : body});

        this.rxStomp.publish(this.createPublishParams(destination, publishId, body));
      } catch (error) {
        subscriber.error(error);
      }

      return () => resultSubscription.unsubscribe();
    });
  }

  /**
   * Creates the data event stream for a watched STOMP destination.
   *
   * When a response-on-connect destination is provided, one message from that
   * destination is consumed whenever the WebSocket connection is established.
   *
   * @typeParam T - Type of WebSocket message received from the destination.
   * @param destination - STOMP destination to observe.
   * @param responseOnConnectDestination - Optional destination observed once after connecting.
   * @returns Stream of data events.
   */
  private createWatchDataEventStream<T extends WebSocketMessage<unknown, unknown>>(
    destination: string,
    responseOnConnectDestination?: string
  ): Observable<StreamEvent<T>> {
    let responseOnConnect$: Observable<T> = EMPTY;

    if (responseOnConnectDestination) {
      responseOnConnect$ = this.connected$.pipe(
        switchMap(() => this.watchDestination<T>(responseOnConnectDestination).pipe(take(1)))
      );
    }

    // Keep responseOnConnect$ first so it subscribes to connected$ before
    // watchDestination() acquires and potentially activates the shared connection.
    return merge(responseOnConnect$, this.watchDestination<T>(destination)).pipe(
      map((data): StreamEvent<T> => ({type: 'data', data}))
    );
  }

  /**
   * Creates the connection state event stream for a watched destination.
   *
   * @typeParam T - Data type of the stream the connection events belong to.
   * @returns Stream of connection state events.
   */
  private createWatchConnectionEventStream<T>(): Observable<StreamEvent<T>> {
    return this.connectionState$.pipe(
      map((connectionState): StreamEvent<T> => ({type: 'connection', state: connectionState}))
    );
  }

  /**
   * Creates an error stream for a watched destination.
   *
   * Errors associated with either watched destination are emitted through the observable error channel.
   * Malformed error frames are logged and ignored so they cannot terminate the shared error queue.
   *
   * @param destination - Primary STOMP destination to match errors against.
   * @param responseOnConnectDestination - Optional response destination to match errors against.
   * @returns Observable that errors when a matching WebSocket error is received.
   */
  private createWatchErrorStream(destination: string, responseOnConnectDestination?: string): Observable<never> {
    return this.errorQueue$.pipe(
      mergeMap(message => {
        let error: WebSocketErrorMessage;

        try {
          error = JSON.parse(message.body) as WebSocketErrorMessage;
        } catch (parseError) {
          console.error('Invalid WebSocket error message:', parseError, message);
          return EMPTY;
        }

        if (error.destination !== destination && error.destination !== responseOnConnectDestination) {
          return EMPTY;
        }

        return throwError(() => error);
      })
    );
  }

  /**
   * Creates the response stream for a publish operation.
   *
   * Raw STOMP responses are filtered by publish ID before their body is parsed.
   * A malformed response therefore only affects the publish operation it belongs to.
   *
   * @typeParam T - Type of the WebSocket message returned for the publish.
   * @param publishId - ID of the publish operation to match.
   * @returns Stream containing the matching WebSocket message.
   */
  private createPublishResponseStream<T extends WebSocketMessage<unknown, unknown>>(publishId: string): Observable<T> {
    return this.responseQueue$.pipe(
      filter(message => message.headers[this.publishIdHeader] === publishId),
      map(message => JSON.parse(message.body) as T)
    );
  }

  /**
   * Creates the error stream for a publish operation.
   *
   * Raw STOMP errors are filtered by publish ID before their body is parsed.
   * A malformed error therefore only affects the publish operation it belongs to.
   *
   * @param publishId - ID of the publish operation to match.
   * @returns Observable that errors when the matching publish error is received.
   */
  private createPublishErrorStream(publishId: string): Observable<never> {
    return this.errorQueue$.pipe(
      filter(message => message.headers[this.publishIdHeader] === publishId),
      mergeMap(message => {
        const error = JSON.parse(message.body) as WebSocketErrorMessage;
        return throwError(() => error);
      })
    );
  }

  /**
   * Watches and parses WebSocket messages from a STOMP destination.
   *
   * @typeParam T - Type of WebSocket message received from the destination.
   * @param destination - STOMP destination to observe.
   * @returns Observable of parsed WebSocket messages.
   */
  private watchDestination<T extends WebSocketMessage<unknown, unknown>>(destination: string): Observable<T> {
    return this.watchStompDestination(destination).pipe(
      tap(message => console.log('incoming stream:', destination, tryParseJson(message.body))),
      map(message => JSON.parse(message.body) as T)
    );
  }

  /**
   * Watches a raw STOMP destination while managing the shared connection lifecycle.
   *
   * @param destination - STOMP destination to observe.
   * @returns Observable of raw STOMP messages.
   */
  private watchStompDestination(destination: string): Observable<IMessage> {
    return defer(() => {
      this.acquireConnection();

      return this.rxStomp.watch(destination).pipe(
        finalize(() => this.releaseConnection()),
      );
    });
  }

  /**
   * Creates the shared WebSocket response queue.
   *
   * The queue exposes raw STOMP messages so publish correlation can occur before
   * deserialization. Responses without a publish ID are logged and cannot match
   * an active publish operation.
   *
   * @returns Shared observable of raw response queue messages.
   */
  private createResponseQueue(): Observable<IMessage> {
    return this.watchStompDestination(DARTS_MATCHER_WS_DESTINATIONS.RESPONSE_QUEUE).pipe(
      tap(message => {
        const publishId = message.headers[this.publishIdHeader];

        console.log('response queue:', {publishId, body: tryParseJson(message.body)});

        if (!publishId) {
          console.error('WebSocket response is missing publish-id header:', message);
        }
      }),
      share()
    );
  }

  /**
   * Creates the shared WebSocket error queue.
   *
   * The queue exposes raw STOMP messages so consumers can correlate messages before
   * deserialization. Valid API error messages are also forwarded to the global API
   * error handler.
   *
   * @returns Shared observable of raw error queue messages.
   */
  private createErrorQueue(): Observable<IMessage> {
    return this.watchStompDestination(DARTS_MATCHER_WS_DESTINATIONS.ERROR_QUEUE).pipe(
      tap(message => {
        console.log('error queue:', {
          publishId: message.headers[this.publishIdHeader],
          body: tryParseJson(message.body)
        });
        this.handleApiError(message);
      }),
      share()
    );
  }

  /**
   * Handles a WebSocket API error without allowing a malformed frame to terminate the shared error queue.
   *
   * @param message - Raw STOMP error message.
   */
  private handleApiError(message: IMessage): void {
    try {
      const error = JSON.parse(message.body) as WebSocketErrorMessage;
      this.apiErrorHandlerService.handle(error);
    } catch (parseError) {
      console.error('Invalid WebSocket error message:', parseError, message);
    }
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
      map((state): StreamConnectionState => {
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
      tap(state => console.log('ws connection state:', state)),
      shareReplay({bufferSize: 1, refCount: true})
    );
  }

  /**
   * Creates publish parameters for a STOMP message.
   *
   * @param destination - STOMP destination to publish to.
   * @param publishId - Unique ID used to correlate the publish with its response or error.
   * @param body - Optional message body.
   * @returns RxStomp publish parameters.
   */
  private createPublishParams(destination: string, publishId: string, body?: unknown): IRxStompPublishParams {
    const publishParams: IRxStompPublishParams = {
      destination,
      retryIfDisconnected: false,
      headers: {
        [this.publishIdHeader]: publishId
      }
    };

    if (body != null) {
      publishParams.body = typeof body === 'object' ? JSON.stringify(body) : String(body);
    }

    return publishParams;
  }

  /**
   * Creates an ID used to correlate a publish operation with its response or error.
   *
   * Uses a UUID when available and falls back to a timestamp-based random ID when
   * the browser does not expose {@link Crypto.randomUUID}, such as in some insecure contexts.
   *
   * @returns Unique publish correlation ID.
   */
  private createPublishId(): string {
    return crypto.randomUUID?.()
      ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}
