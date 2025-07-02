import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {concatMap, debounceTime, delay, EMPTY, Observable, of, switchMap} from 'rxjs';
import {X01Match} from '../../../../models/x01-match/x01-match';
import {NgIf} from '@angular/common';
import {MatToolbar} from '@angular/material/toolbar';
import {X01MatchComponent} from '../../components/x01-match/x01-match.component';
import {isValidObjectId} from '../../../../shared/utils/object-id.utils';
import {DartsMatcherWebSocketService} from '../../../../api/services/darts-matcher-web-socket.service';
import {ApiErrorEnum} from '../../../../api/error/api-error-enum';
import {ApiErrorBodyHandler} from '../../../../api/services/api-error-body-handler.service';
import {DARTS_MATCHER_WS_DESTINATIONS, WsDestType} from '../../../../api/endpoints/darts-matcher-web-socket.endpoints';
import {ApiWsErrorBody} from '../../../../api/error/api-ws-error-body';
import {AppEndpoints} from '../../../../core/app.endpoints';
import {X01MatchEventType} from '../../../../api/dto/x01-match-event-type';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {DialogService} from '../../../../shared/services/dialog-service/dialog.service';
import {MatTooltip} from '@angular/material/tooltip';
import {BaseComponent} from '../../../../shared/components/base/base.component';
import {RxStompState} from '@stomp/rx-stomp';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatSnackBar} from '@angular/material/snack-bar';
import {X01MatchEventUnion} from '../../../../api/dto/x01-match-event';


@Component({
  selector: 'app-x01-match-page',
  imports: [
    NgIf,
    MatToolbar,
    X01MatchComponent,
    MatButton,
    MatIconButton,
    MatIcon,
    MatTooltip,
    MatProgressSpinner,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
  ],
  standalone: true,
  templateUrl: './x01-match-page.component.html',
  styleUrl: './x01-match-page.component.scss'
})
export class X01MatchPageComponent extends BaseComponent implements OnInit {
  match: X01Match | null = null;
  matchNotFound: boolean = false;
  matchDeleteEvent: boolean = false;
  webSocketClosed: boolean = false;
  errorMsg: string | null = null;

  private readonly matchIdParamKey = 'matchId';

  private route = inject(ActivatedRoute);
  private webSocketService = inject(DartsMatcherWebSocketService);
  private apiErrorBodyHandler = inject(ApiErrorBodyHandler);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private dialogService = inject(DialogService);
  private snackBar = inject(MatSnackBar);

  /**
   * Lifecycle hook that triggers on component initialization.
   * Initiates the retrieval of the match using route parameters.
   */
  ngOnInit(): void {
    this.connectWebSocket();

    this.subscribeErrorQueue();
    this.getMatch();
  }

  /**
   * Navigates the user to the home page.
   */
  navigateToHome() {
    this.router.navigateByUrl(AppEndpoints.home()).catch(e => {
      console.log(e);
    });
  }

  /**
   * Copies the current page URL (match URL) to the clipboard.
   * Shows a snackbar notification indicating success or failure.
   */
  copyUrlToClipboard() {
    navigator.clipboard.writeText(window.location.href)
      .then(() => this.openSnackBar('Link copied'))
      .catch(err => this.openSnackBar('Failed to copy url'));
  }

  /**
   * Copies the current match ID to the clipboard.
   * Only runs if `match` is defined.
   * Shows a snackbar notification indicating success or failure.
   */
  copyMatchIdToClipboard() {
    const errorHandler = () => this.openSnackBar('Failed to copy match ID');
    if (!this.match) {
      errorHandler();
      return;
    }

    navigator.clipboard.writeText(this.match.id)
      .then(() => this.openSnackBar('Match ID copied'))
      .catch(err => errorHandler());
  }

  /**
   * Opens a confirmation dialog for resetting the match.
   * If the user confirms, triggers the `publishResetMatch()` method to publish the reset event.
   */
  openConfirmResetMatchDialog() {
    const dialogRef = this.dialogService.openConfirmDialog({action: 'Reset Match'});
    if (dialogRef) {
      const sub = dialogRef.afterClosed().subscribe(result => {
        if (result) this.publishResetMatch();
      });
      this.subscription.add(sub);
    }
  }

  /**
   * Opens a confirmation dialog for deleting the match.
   * If the user confirms, triggers the `publishDeleteMatch()` method to publish the delete event.
   */
  openConfirmDeleteMatchDialog() {
    const dialogRef = this.dialogService.openConfirmDialog({action: 'Delete Match'});
    if (dialogRef) {
      const sub = dialogRef.afterClosed().subscribe(result => {
        if (result) this.publishDeleteMatch();
      });
      this.subscription.add(sub);
    }
  }

  /**
   * Establishes a WebSocket connection using the WebSocketService
   * and observes the connection status to update the `webSocketClosed` flag.
   */
  private connectWebSocket() {
    // Connect to the web socket service.
    this.webSocketService.connect(this.destroyRef);

    // Signal `webSocketClosed` flag when there is no connection to the web socket.
    const sub = this.webSocketService.connectionStatus$
      .pipe(debounceTime(1000))
      .subscribe(rxStompState => {
        this.webSocketClosed = rxStompState !== RxStompState.OPEN;
      });
    this.subscription.add(sub);
  }

  /**
   * Retrieve the match id from the route and subscribe to the single response match websocket for the initial match object
   * and the broadcast for match updates.
   */
  private getMatch() {
    const sub = this.getAndValidateMatchIdFromRoute().pipe(
      switchMap(matchId => this.webSocketService.getX01MatchBroadcast(matchId)),
      concatMap(event => {
        const shouldDelay = event.eventType === X01MatchEventType.ADD_BOT_TURN;
        return of(event).pipe(delay(shouldDelay ? 500 : 0));
      })
    ).subscribe({
      next: event => this.handleWebSocketEvent(event),
    });
    this.subscription.add(sub);
  }

  /**
   * Extracts the match ID from the current route parameters and validates if it's an ObjectId.
   *
   * @returns An observable emitting a valid match ID, or EMPTY if invalid.
   */
  private getAndValidateMatchIdFromRoute(): Observable<string> {
    return this.route.paramMap.pipe(
      switchMap(params => {
        const matchId = params.get(this.matchIdParamKey) ?? '';
        if (!isValidObjectId(matchId)) {
          this.handleInvalidMatchId();
          return EMPTY;
        }
        return of(matchId);
      })
    );
  }

  /**
   * Handles incoming WebSocket events by dispatching actions based on the event type.
   *
   * @param {X01MatchEventUnion} event - The WebSocket event object containing the event type and payload.
   */
  private handleWebSocketEvent(event: X01MatchEventUnion | null) {
    if (event == null) return;

    switch (event.eventType) {
      case X01MatchEventType.PROCESS_MATCH:
      case X01MatchEventType.ADD_HUMAN_TURN:
      case X01MatchEventType.ADD_BOT_TURN:
      case X01MatchEventType.EDIT_TURN:
      case X01MatchEventType.DELETE_LAST_TURN:
      case X01MatchEventType.RESET_MATCH: {
        this.handleGetMatchSuccess(event.payload);
        break;
      }
      case X01MatchEventType.DELETE_MATCH: {
        this.handleDeleteMatchEvent();
        break;
      }
    }
  }

  /**
   * Initializes the component property `match` with the retrieved X01Match.
   *
   * @param match - The retrieved X01 match
   */
  private handleGetMatchSuccess(match: X01Match) {
    this.match = match;
  }

  private handleDeleteMatchEvent() {
    this.match = null;
    this.matchDeleteEvent = true;
  }

  /**
   * Sets the invalid match ID flag when the route contains an invalid ObjectId.
   */
  private handleInvalidMatchId() {
    this.matchNotFound = true;
  }

  /**
   * Publishes a delete event for the current match over WebSocket.
   */
  private publishDeleteMatch() {
    if (!this.match) return;

    this.webSocketService.publishDeleteMatch(this.match.id);
  }

  /**
   * Publishes a reset event for the current match over WebSocket.
   */
  private publishResetMatch() {
    if (!this.match) return;

    this.webSocketService.publishResetMatch(this.match.id);
  }

  /**
   * Subscribes to the websocket error queue. Delegates the errors to the ws error body handler.
   */
  private subscribeErrorQueue() {
    const sub = this.webSocketService.errorQueue$.subscribe({
      next: (apiWsErrorBody) => {
        this.handleApiWsErrorBody(apiWsErrorBody);
      }
    });
    this.subscription.add(sub);
  }

  /**
   * Handles errors coming from the websocket error queue.
   * Will only handle errors that are in the destinations relevant to this component.
   *
   * @param apiWsErrorBody - The error body to be handled.
   */
  private handleApiWsErrorBody(apiWsErrorBody: ApiWsErrorBody) {
    const errorDestinations = this.getErrorDestinations();

    if (errorDestinations.includes(apiWsErrorBody.destination)) {
      switch (apiWsErrorBody.error) {
        case ApiErrorEnum.RESOURCE_NOT_FOUND: {
          this.handleInvalidMatchId();
          break;
        }

        case ApiErrorEnum.PROCESSING_LIMIT_REACHED: {
          this.errorMsg = 'Error, sync match to try again.';
          break;
        }

        default: {
          this.apiErrorBodyHandler.handleApiErrorBody(apiWsErrorBody);
        }
      }
    }
  }

  /**
   * Array of error destination that should be handled by this component.
   */
  private getErrorDestinations(): string[] {
    const matchId = this.route.snapshot.paramMap.get(this.matchIdParamKey) ?? '';

    return [
      DARTS_MATCHER_WS_DESTINATIONS.SUBSCRIBE.X01_GET_MATCH(matchId, WsDestType.BROADCAST),
      DARTS_MATCHER_WS_DESTINATIONS.SUBSCRIBE.X01_GET_MATCH(matchId, WsDestType.SINGLE_RESPONSE),
      DARTS_MATCHER_WS_DESTINATIONS.PUBLISH.X01_RESET_MATCH(matchId),
      DARTS_MATCHER_WS_DESTINATIONS.PUBLISH.X01_DELETE_MATCH(matchId)
    ];
  }

  /**
   * Displays a snackbar message to the user.
   *
   * @param message - The message to display in the snackbar.
   */
  private openSnackBar(message: string) {
    this.snackBar.open(message, undefined, {duration: 1250});
  }

}
