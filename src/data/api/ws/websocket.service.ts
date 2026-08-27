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
  throwError
} from 'rxjs';
import {environment} from '../../../environments/environment';
import {IMessage, IRxStompPublishParams, RxStomp, RxStompConfig, RxStompState} from '@stomp/rx-stomp';
import {StreamConnectionState, StreamEvent} from '../../repository/stream-event.type';
import {DARTS_MATCHER_WS_DESTINATIONS} from '../ws-endpoints';
import {WebSocketErrorResponse} from './websocket-error-response';
import {ApiErrorHandlerService} from '../errors/api-error-handler.service';
import {WebSocketResponse} from './websocket-response';

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

  private activeConsumers = 0;

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
   * The message is published when the returned observable is subscribed to.
   *
   * @typeParam T - Type of response returned for the publish.
   * @param destination - STOMP destination to publish to.
   * @param body - Optional message body.
   * @returns Observable that emits the matching response or errors when the publish fails.
   */
  publish<T>(destination: string, body?: unknown): Observable<T> {
    return new Observable(subscriber => {
      const publishId = crypto.randomUUID();

      const resultSubscription = merge(
        this.createPublishResponseStream<T>(publishId),
        this.createPublishErrorStream(publishId)
      )
        .pipe(take(1))
        .subscribe(subscriber);

      try {
        console.log('publish:', destination, {publishId, body});

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
   * When a response-on-connect destination is provided, one response is requested
   * whenever the WebSocket connection is established.
   *
   * @typeParam T - Type of data received from the destination.
   * @param destination - STOMP destination to observe.
   * @param responseOnConnectDestination - Optional destination used to request data after connecting.
   * @returns Stream of data events.
   */
  private createWatchDataEventStream<T>(
    destination: string,
    responseOnConnectDestination?: string
  ): Observable<StreamEvent<T>> {
    let responseOnConnect$: Observable<WebSocketResponse<T>> = EMPTY;

    if (responseOnConnectDestination) {
      responseOnConnect$ = this.connected$.pipe(
        switchMap(() => this.watchDestination<T>(responseOnConnectDestination).pipe(take(1)))
      );
    }

    return merge(responseOnConnect$, this.watchDestination<T>(destination)).pipe(
      tap(response => console.log('incoming stream:', destination, response)),
      map((response): StreamEvent<T> => ({type: 'data', data: response.body}))
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
   * Errors associated with either watched destination are emitted through the
   * observable error channel.
   *
   * @param destination - Primary STOMP destination to match errors against.
   * @param responseOnConnectDestination - Optional response destination to match errors against.
   * @returns Observable that errors when a matching WebSocket error is received.
   */
  private createWatchErrorStream(
    destination: string,
    responseOnConnectDestination?: string
  ): Observable<never> {
    return this.errorQueue$.pipe(
      filter(response =>
        response.body.destination === destination
        || response.body.destination === responseOnConnectDestination
      ),
      mergeMap(response => throwError(() => response.body))
    );
  }

  /**
   * Creates the response stream for a publish operation.
   *
   * Responses are received from the shared response queue and filtered by publish ID.
   *
   * @typeParam T - Type of response returned for the publish.
   * @param publishId - ID of the publish operation to match.
   * @returns Stream containing the matching publish response.
   */
  private createPublishResponseStream<T>(publishId: string): Observable<T> {
    return this.responseQueue$.pipe(
      filter(response => response.publishId === publishId),
      map(response => response.body as T)
    );
  }

  /**
   * Creates the error stream for a publish operation.
   *
   * Errors are received from the shared error queue and filtered by publish ID.
   * A matching response is emitted through the observable error channel.
   *
   * @param publishId - ID of the publish operation to match.
   * @returns Observable that errors when the matching publish error is received.
   */
  private createPublishErrorStream(publishId: string): Observable<never> {
    return this.errorQueue$.pipe(
      filter(response => response.publishId === publishId),
      mergeMap(response => throwError(() => response.body))
    );
  }

  /**
   * Watches a STOMP destination while managing the shared connection lifecycle.
   *
   * @typeParam T - Type of message body received from the destination.
   * @param destination - STOMP destination to observe.
   * @returns Observable of parsed WebSocket responses.
   */
  private watchDestination<T>(destination: string): Observable<WebSocketResponse<T>> {
    return defer(() => {
      this.acquireConnection();

      return this.rxStomp.watch(destination).pipe(
        map(message => this.mapToWebSocketResponse<T>(message)),
        finalize(() => this.releaseConnection()),
      );
    });
  }

  /**
   * Maps a STOMP message to a WebSocket response.
   *
   * @typeParam T - Type of the parsed message body.
   * @param message - STOMP message to map.
   * @returns Parsed WebSocket response including publish correlation metadata.
   */
  private mapToWebSocketResponse<T>(message: IMessage): WebSocketResponse<T> {
    return {
      body: JSON.parse(message.body) as T,
      publishId: message.headers[this.publishIdHeader]
    };
  }

  /**
   * Creates the shared WebSocket response queue.
   *
   * Successful publish responses from the server are received through this queue
   * and shared between active publish operations.
   *
   * @returns Shared observable of WebSocket publish responses.
   */
  private createResponseQueue(): Observable<WebSocketResponse<unknown>> {
    return this.watchDestination<unknown>(DARTS_MATCHER_WS_DESTINATIONS.RESPONSE_QUEUE).pipe(
      tap(response => console.log('response queue:', response)),
      share()
    );
  }

  /**
   * Creates the shared WebSocket error queue.
   *
   * WebSocket API errors are handled globally before being shared between
   * active watch and publish operations.
   *
   * @returns Shared observable of WebSocket API error responses.
   */
  private createErrorQueue(): Observable<WebSocketResponse<WebSocketErrorResponse>> {
    return this.watchDestination<WebSocketErrorResponse>(DARTS_MATCHER_WS_DESTINATIONS.ERROR_QUEUE).pipe(
      tap(response => console.log('error queue:', response)),
      tap(response => this.apiErrorHandlerService.handle(response.body)),
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
      tap(state => console.log(`ws connection state:`, state)),
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
}
