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
  throwError,
  timeout
} from 'rxjs';
import {environment} from '../../../environments/environment';
import {IMessage, IRxStompPublishParams, RxStomp, RxStompConfig, RxStompState} from '@stomp/rx-stomp';
import {StreamConnectionState, StreamEventType} from './stream-event-type';
import {DARTS_MATCHER_WS_DESTINATIONS} from '../ws-endpoints';
import {ApiErrorHandlerService} from '../errors/api-error-handler.service';
import {isWebSocketErrorMessage, WebSocketErrorMessage} from './websocket-error-message';
import {WebSocketMessage} from './websocket-message';
import {tryParseJson} from '../../../shared/utils/json.util';
import {ApiErrorCodes} from '../errors/api-error-code';
import {ErrorDialogService} from '../../../shared/services/error-dialog.service';

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
  private readonly errorDialogService = inject(ErrorDialogService);

  private readonly publishIdHeader = 'publish-id';
  private readonly publishTimeoutMs = 60_000;

  private readonly rxStomp = this.createRxStomp();
  private readonly connected$ = this.rxStomp.connected$;
  private readonly connectionState$ = this.createConnectionState(this.rxStomp);

  private readonly responseQueue$ = this.createResponseQueue();
  private readonly errorQueue$ = this.createErrorQueue();

  private activeConsumers = 0;

  /**
   * Watches a STOMP destination and exposes its data, connection state, and matching WebSocket errors as a single stream.
   *
   * Optionally consumes one message from a separate destination whenever the WebSocket connection is established.
   *
   * @typeParam T - Type of WebSocket message received from the destination.
   * @param destination - STOMP destination to observe.
   * @param responseOnConnectDestination - Optional destination observed once after connecting.
   * @param handleLocally - API error codes handled locally by the caller.
   * @returns Stream of data and connection state events.
   */
  watch<T extends WebSocketMessage<unknown, unknown>>(
    destination: string,
    responseOnConnectDestination?: string,
    handleLocally: ApiErrorCodes = []
  ): Observable<StreamEventType<T>> {
    const dataEvent$ = this.createWatchDataEventStream<T>(destination, responseOnConnectDestination);
    const connectionEvent$ = this.createWatchConnectionEventStream<T>();
    const error$ = this.createWatchErrorStream(destination, responseOnConnectDestination, handleLocally);

    return merge(dataEvent$, connectionEvent$, error$);
  }

  /**
   * Publishes a message to a STOMP destination and waits for its correlated response.
   *
   * A unique publish ID is attached to the outgoing message and used to match either
   * a response from the shared response queue or an error from the shared error queue.
   * The operation times out when no matching response or error is received within
   * the configured publishing timeout.
   *
   * The message is published when the returned observable is subscribed to.
   *
   * @typeParam T - Type of the WebSocket message returned for the publish.
   * @param destination - STOMP destination to publish to.
   * @param body - Optional message body.
   * @param handleLocally - API error codes handled locally by the caller.
   * @returns Observable that emits the matching WebSocket message or errors when the publish fails or times out.
   */
  publish<T extends WebSocketMessage<unknown, unknown>>(
    destination: string,
    body?: unknown,
    handleLocally: ApiErrorCodes = []
  ): Observable<T> {
    return new Observable<T>(subscriber => {
      const publishId = this.createPublishId();

      const resultSubscription = merge(
        this.createPublishResponseStream<T>(publishId),
        this.createPublishErrorStream(publishId, handleLocally)
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
  ): Observable<StreamEventType<T>> {
    let responseOnConnect$: Observable<T> = EMPTY;

    if (responseOnConnectDestination) {
      responseOnConnect$ = this.connected$.pipe(
        switchMap(() => this.watchDestination<T>(responseOnConnectDestination).pipe(take(1)))
      );
    }

    // Keep responseOnConnect$ first so it subscribes to connected$ before
    // watchDestination() acquires and potentially activates the shared connection.
    return merge(responseOnConnect$, this.watchDestination<T>(destination)).pipe(
      map((data): StreamEventType<T> => ({type: 'data', data}))
    );
  }

  /**
   * Creates the connection state event stream for a watched destination.
   *
   * @typeParam T - Data type of the stream the connection events belong to.
   * @returns Stream of connection state events.
   */
  private createWatchConnectionEventStream<T>(): Observable<StreamEventType<T>> {
    return this.connectionState$.pipe(
      map((connectionState): StreamEventType<T> => ({type: 'connection', state: connectionState}))
    );
  }

  /**
   * Creates an error stream for a watched destination.
   *
   * Errors associated with either watched destination are emitted through the observable error channel.
   * Matching API errors are forwarded to the global API error handler unless handled locally by the caller.
   * Malformed error frames are logged and ignored so they cannot terminate the shared error queue.
   *
   * @param destination - Primary STOMP destination to match errors against.
   * @param responseOnConnectDestination - Optional response destination to match errors against.
   * @param handleLocally - API error codes handled locally by the caller.
   * @returns Observable that errors when a matching WebSocket error is received.
   */
  private createWatchErrorStream(
    destination: string,
    responseOnConnectDestination: string | undefined,
    handleLocally: ApiErrorCodes
  ): Observable<never> {
    return this.errorQueue$.pipe(
      map(message => this.parseWebSocketErrorMessage(message)),
      filter((error): error is WebSocketErrorMessage => error !== undefined),
      filter(error => error.destination === destination || error.destination === responseOnConnectDestination),
      tap(error => this.apiErrorHandlerService.handle(error, handleLocally)),
      mergeMap(error => throwError(() => error))
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
      map(message => this.parseWebSocketMessage(message))
    );
  }

  /**
   * Creates the error stream for a publish operation.
   *
   * Raw STOMP errors are filtered by publish ID before their body is parsed.
   * A malformed error therefore only affects the publish operation it belongs to.
   *
   * @param publishId - ID of the publish operation to match.
   * @param handleLocally - API error codes handled locally by the caller.
   * @returns Observable that errors when the matching publishing error is received.
   */
  private createPublishErrorStream(publishId: string, handleLocally: ApiErrorCodes): Observable<never> {
    return this.errorQueue$.pipe(
      filter(message => message.headers[this.publishIdHeader] === publishId),
      map(message => this.parseWebSocketErrorMessage(message)),
      filter((error): error is WebSocketErrorMessage => error !== undefined),
      tap(error => this.apiErrorHandlerService.handle(error, handleLocally)),
      mergeMap(error => throwError(() => error))
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
      map(message => this.parseWebSocketMessage(message))
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
   * deserialization. Responses without a publishing ID are logged and cannot match
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
   * deserialization.
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
      }),
      share()
    );
  }

  /**
   * Parses the body of a WebSocket message.
   *
   * Opens the internal error dialog and rethrows when the message body contains invalid JSON.
   *
   * @typeParam T - Type of the parsed message body.
   * @param message - Raw STOMP message to parse.
   * @returns Parsed message body.
   * @throws SyntaxError when the message body contains invalid JSON.
   */
  private parseWebSocketMessage<T>(message: IMessage): T {
    try {
      return JSON.parse(message.body) as T;
    } catch (parseError) {
      this.errorDialogService.openInternalErrorDialog();
      throw parseError;
    }
  }

  /**
   * Parses and validates a WebSocket API error message without allowing an invalid frame to terminate the shared error queue.
   *
   * @param message - Raw STOMP error message.
   * @returns the parsed WebSocket error, or undefined when the message is invalid.
   */
  private parseWebSocketErrorMessage(message: IMessage): WebSocketErrorMessage | undefined {
    try {
      const errorResponse: unknown = JSON.parse(message.body);

      if (!isWebSocketErrorMessage(errorResponse)) {
        this.errorDialogService.openInternalErrorDialog();
        return undefined;
      }

      return errorResponse;
    } catch {
      this.errorDialogService.openInternalErrorDialog();
      return undefined;
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
   * @param rxStomp - Initialized RxStomp instance whose connection state is observed.
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
