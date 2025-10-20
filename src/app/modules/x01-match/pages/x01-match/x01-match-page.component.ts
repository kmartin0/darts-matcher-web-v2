import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {concatMap, debounceTime, delay, EMPTY, map, Observable, of, switchMap} from 'rxjs';
import {X01Match} from '../../../../models/x01-match/x01-match';

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
import {ERROR_DETAIL_KEYS} from '../../../../api/error/error-detail-keys';
import {RecentMatchesService} from '../../../../shared/services/recent-matches-service/recent-matches.service';
import {ThemeToggleComponent} from '../../../../shared/components/theme-toggle/theme-toggle.component';
import {Clipboard} from '@angular/cdk/clipboard';
import {X01MatchPageType} from './x01-match-page-type';
import {X01MatchSummaryComponent} from '../../components/x01-match-summary/x01-match-summary.component';
import {
  LocalX01SettingsDialogData
} from '../../../../shared/components/local-x01-settings-dialog/local-x01-settings-dialog.types';
import {LocalX01SettingsService} from '../../../../shared/services/local-x01-settings/local-x01-settings.service';


@Component({
  selector: 'app-x01-match-page',
  imports: [
    MatToolbar,
    X01MatchComponent,
    MatIconButton,
    MatIcon,
    MatTooltip,
    MatProgressSpinner,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    RouterLink,
    MatButton,
    ThemeToggleComponent,
    X01MatchSummaryComponent
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
  currentPageType: X01MatchPageType = X01MatchPageType.MATCH;

  protected readonly X01MatchPageType = X01MatchPageType;
  protected readonly AppEndpoints = AppEndpoints;
  private readonly matchIdParamKey = 'matchId';

  private route = inject(ActivatedRoute);
  private webSocketService = inject(DartsMatcherWebSocketService);
  private apiErrorBodyHandler = inject(ApiErrorBodyHandler);
  private destroyRef = inject(DestroyRef);
  private dialogService = inject(DialogService);
  private snackBar = inject(MatSnackBar);
  private recentMatchesService = inject(RecentMatchesService);
  private clipboard = inject(Clipboard);
  private localX01SettingsService = inject(LocalX01SettingsService);

  private persistedInRecentMatches = false;

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
   * Opens the X01 Player Settings dialog for the current match. And save changes, if they are made.
   */
  async openX01PlayerSettingsDialog() {
    if (!this.match) return;

    // Retrieves the local match settings. If no settings present, create default settings.
    const localX01SettingsRecord = await this.localX01SettingsService.getX01Settings(this.match.id)
      ?? this.localX01SettingsService.createDefaultX01Record(this.match.id);

    const dialogData: LocalX01SettingsDialogData = {
      players: this.match.players,
      localX01SettingsRecord: localX01SettingsRecord
    };

    // Open the settings dialog. If a result is returned, save these new settings.
    const dialogRef = this.dialogService.openLocalX01SettingsDialog(dialogData);
    if (dialogRef) {
      const sub = dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.localX01SettingsService.saveX01Settings(result);
        }
      });
      this.subscription.add(sub);
    }
  }

  /**
   * Copies the current page URL (match URL) to the clipboard.
   * Shows a snackbar notification indicating success or failure.
   */
  copyUrlToClipboard() {
    this.openSnackBar(this.clipboard.copy(window.location.href) ? 'Link copied' : 'Failed to copy url');
  }

  /**
   * Copies the current match ID to the clipboard.
   * Only runs if `match` is defined.
   * Shows a snackbar notification indicating success or failure.
   */
  copyMatchIdToClipboard() {
    const failedToCopyStr = 'Failed to copy match ID';
    if (!this.match) {
      this.openSnackBar(failedToCopyStr);
      return;
    }

    this.openSnackBar(this.clipboard.copy(this.match.id) ? 'Match ID copied' : failedToCopyStr);
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

  togglePageType() {
    const enumValues = Object.values(X01MatchPageType);
    const currentIndex = enumValues.indexOf(this.currentPageType);
    const nextIndex = (currentIndex + 1) % enumValues.length;
    setTimeout(() => {
      this.currentPageType = enumValues[nextIndex];
    }, 100);
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
      map(() => this.getMatchIdFromRoute()),
      switchMap(matchId => {
        if (!isValidObjectId(matchId)) {
          this.handleInvalidMatchId(matchId);
          return EMPTY;
        }
        return of(matchId);
      })
    );
  }

  /**
   * @returns string - the match ID from the current route
   */
  private getMatchIdFromRoute(): string {
    return this.route.snapshot.paramMap.get(this.matchIdParamKey) ?? '';
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
        this.handleDeleteMatchEvent(event.payload);
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
    if (this.match && this.match.broadcastVersion > match.broadcastVersion) return;

    if (!this.persistedInRecentMatches) {
      this.recentMatchesService.persistMatch(match.id);
      this.persistedInRecentMatches = true;
    }

    this.match = match;
  }

  private handleDeleteMatchEvent(matchId: string) {
    this.match = null;
    this.matchDeleteEvent = true;
    this.localX01SettingsService.deleteX01Settings(matchId);
  }

  /**
   * Sets the invalid match ID flag when the route contains an invalid ObjectId.
   */
  private handleInvalidMatchId(matchId: string) {
    this.match = null;
    this.matchNotFound = true;
    this.localX01SettingsService.deleteX01Settings(matchId);
  }

  /**
   * Publishes a reprocess match event for the current match over WebSocket.
   */
  publishReprocessMatch() {
    if (!this.match) return;

    this.webSocketService.publishReprocessMatch(this.match.id);
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
          if (Object.hasOwn(apiWsErrorBody.details ?? {}, ERROR_DETAIL_KEYS.X01_MATCH)) this.handleInvalidMatchId(this.getMatchIdFromRoute());
          else this.errorMsg = 'Error: not found.';

          break;
        }

        case ApiErrorEnum.PROCESSING_LIMIT_REACHED: {
          this.errorMsg = 'Error, sync match to try again.';
          break;
        }

        case ApiErrorEnum.CONFLICT: {
          this.errorMsg = 'Please try again.';
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
