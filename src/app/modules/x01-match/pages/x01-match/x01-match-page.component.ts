import {Component, DestroyRef, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {EMPTY, Observable, of, Subscription, switchMap} from 'rxjs';
import {X01Match} from '../../../../models/x01-match/x01-match';
import {NgIf} from '@angular/common';
import {MatToolbar} from '@angular/material/toolbar';
import {X01MatchComponent} from '../../components/x01-match/x01-match.component';
import {isValidObjectId} from '../../../../shared/utils/object-id.utils';
import {DartsMatcherWebsocketService} from '../../../../api/services/darts-matcher-websocket.service';
import {ApiErrorEnum} from '../../../../api/error/api-error-enum';
import {ApiErrorBodyHandler} from '../../../../api/services/api-error-body-handler.service';
import {DARTS_MATCHER_WS_DESTINATIONS, WsDestType} from '../../../../api/endpoints/darts-matcher-websocket.endpoints';
import {ApiWsErrorBody} from '../../../../api/error/api-ws-error-body';

@Component({
  selector: 'app-x01-match-page',
  imports: [
    NgIf,
    MatToolbar,
    X01MatchComponent
  ],
  standalone: true,
  templateUrl: './x01-match-page.component.html',
  styleUrl: './x01-match-page.component.scss'
})
export class X01MatchPageComponent implements OnInit, OnDestroy {

  private readonly matchIdParamKey = 'matchId';
  private getMatchSubscription: Subscription = new Subscription();
  matchNotFound: boolean = false;

  public match: X01Match | null = null;

  constructor(private route: ActivatedRoute, private websocketService: DartsMatcherWebsocketService,
              private apiErrorBodyHandler: ApiErrorBodyHandler, private destroyRef: DestroyRef) {
  }

  /**
   * Lifecycle hook that triggers on component initialization.
   * Initiates the retrieval of the match using route parameters.
   */
  ngOnInit(): void {
    this.websocketService.connect(this.destroyRef)
    this.subscribeErrorQueue();
    this.getMatch();
  }

  /**
   * Lifecycle hook that triggers when the component is destroyed.
   * Cleans up all subscriptions and deactivates WebSocket connection.
   */
  ngOnDestroy() {
    this.getMatchSubscription.unsubscribe();
    this.websocketService.deactivate();
  }

  /**
   * Retrieve the match id from the route and subscribe to the single response match websocket for the initial match object
   * and the broadcast for match updates.
   */
  private getMatch() {
    this.getMatchSubscription.add(this.getAndValidateMatchIdFromRoute().pipe(
        switchMap(matchId => this.websocketService.getX01MatchBroadcast(matchId))
      ).subscribe({
        next: (match: X01Match) => this.handleGetMatchSuccess(match),
      })
    );
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
   * Initializes the component property `match` with the retrieved X01Match.
   *
   * @param match - The retrieved X01 match
   */
  private handleGetMatchSuccess(match: X01Match) {
    this.match = match;
  }

  /**
   * Sets the invalid match ID flag when the route contains an invalid ObjectId.
   */
  private handleInvalidMatchId() {
    this.matchNotFound = true;
  }

  /**
   * Subscribes to the websocket error queue. Delegates the errors to the ws error body handler.
   */
  private subscribeErrorQueue() {
    this.websocketService.getErrorQueue().subscribe({
      next: (apiWsErrorBody) => {
        this.handleApiWsErrorBody(apiWsErrorBody);
      }
    });
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
      DARTS_MATCHER_WS_DESTINATIONS.SUBSCRIBE.X01_GET_MATCH(matchId, WsDestType.SINGLE_RESPONSE)
    ];
  }

}
