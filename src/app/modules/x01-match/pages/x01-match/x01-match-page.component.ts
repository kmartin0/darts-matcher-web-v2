import {Component, DestroyRef, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {EMPTY, Observable, of, switchMap} from 'rxjs';
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
import {X01WebSocketEvent} from '../../../../api/dto/base-x01-web-socket-event';
import {X01WebSocketEventType} from '../../../../api/dto/x01-web-socket-event-type';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {DialogService} from '../../../../shared/services/dialog-service/dialog.service';
import {
  X01MatchActionsDialogResult,
  X01MatchDialogAction
} from '../../../../shared/components/x01-match-actions-dialog/x01-match-actions-dialog.component';
import {MatTooltip} from '@angular/material/tooltip';
import {BaseComponent} from '../../../../shared/components/base/base.component';

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
  ],
  standalone: true,
  templateUrl: './x01-match-page.component.html',
  styleUrl: './x01-match-page.component.scss'
})
export class X01MatchPageComponent extends BaseComponent implements OnInit {

  private readonly matchIdParamKey = 'matchId';
  matchNotFound: boolean = false;
  matchDeleteEvent: boolean = false;

  public match: X01Match | null = null;

  constructor(private route: ActivatedRoute, private webSocketService: DartsMatcherWebSocketService,
              private apiErrorBodyHandler: ApiErrorBodyHandler, private destroyRef: DestroyRef, private router: Router,
              private dialogService: DialogService) {
    super();
  }

  /**
   * Lifecycle hook that triggers on component initialization.
   * Initiates the retrieval of the match using route parameters.
   */
  ngOnInit(): void {
    this.webSocketService.connect(this.destroyRef);
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
   * Opens a dialog allowing the user to choose match actions (e.g., reset or delete).
   * If the user selects an action, a confirmation dialog is opened.
   */
  openMatchActionsDialog() {
    if (!this.match) return;
    const dialogRef = this.dialogService.openX01MatchActionsDialog({matchId: this.match.id});
    if (dialogRef) {
      const sub = dialogRef.afterClosed().subscribe(result => {
        if (!result) return;
        this.handleMatchActionsDialogResult(result);
      });
      this.subscription.add(sub);
    }
  }

  /**
   * Handles the result from the X01 match actions dialog.
   * Depending on the selected action, opens a confirmation dialog
   * to either reset or delete the match.
   *
   * @param result - The result object containing the selected action.
   */
  private handleMatchActionsDialogResult(result: X01MatchActionsDialogResult) {
    switch (result.action) {
      case X01MatchDialogAction.RESET_MATCH: {
        this.openConfirmResetMatchDialog();
        break;
      }
      case X01MatchDialogAction.DELETE_MATCH: {
        this.openConfirmDeleteMatchDialog();
        break;
      }
    }
  }

  /**
   * Retrieve the match id from the route and subscribe to the single response match websocket for the initial match object
   * and the broadcast for match updates.
   */
  private getMatch() {
    const sub = this.getAndValidateMatchIdFromRoute().pipe(
      switchMap(matchId => this.webSocketService.getX01MatchBroadcast(matchId))
    ).subscribe({
      next: (event: X01WebSocketEvent) => this.handleWebSocketEvent(event),
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
   * @param {X01WebSocketEvent} event - The WebSocket event object containing the event type and payload.
   */
  private handleWebSocketEvent(event: X01WebSocketEvent) {
    switch (event.eventType) {
      case X01WebSocketEventType.UPDATE_MATCH: {
        this.handleGetMatchSuccess(event.payload);
        break;
      }
      case X01WebSocketEventType.DELETE_MATCH: {
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
   * Opens a confirmation dialog for resetting the match.
   * If the user confirms, triggers the `publishResetMatch()` method to publish the reset event.
   */
  private openConfirmResetMatchDialog() {
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
  private openConfirmDeleteMatchDialog() {
    const dialogRef = this.dialogService.openConfirmDialog({action: 'Delete Match'});
    if (dialogRef) {
      const sub = dialogRef.afterClosed().subscribe(result => {
        if (result) this.publishDeleteMatch();
      });
      this.subscription.add(sub);
    }
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
    const sub = this.webSocketService.getErrorQueue().subscribe({
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
      DARTS_MATCHER_WS_DESTINATIONS.PUBLISH.X01_DELETE_MATCH(matchId)
    ];
  }

}
