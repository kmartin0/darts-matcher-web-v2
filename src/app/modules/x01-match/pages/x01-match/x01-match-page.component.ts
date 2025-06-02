import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {concat, EMPTY, Observable, of, Subscription, switchMap} from 'rxjs';
import {X01Match} from '../../../../models/x01-match/x01-match';
import {HttpErrorResponse} from '@angular/common/http';
import {isApiErrorBody} from '../../../../api/error/api-error-body';
import {NgIf} from '@angular/common';
import {MatToolbar} from '@angular/material/toolbar';
import {X01MatchComponent} from '../../components/x01-match/x01-match.component';
import {isValidObjectId} from '../../../../shared/utils/object-id.utils';
import {DartsMatcherWebsocketService} from '../../../../api/services/darts-matcher-websocket.service';

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

  private getMatchSubscription: Subscription = new Subscription();
  invalidMatchId: boolean = false;

  public match: X01Match | null = null;

  constructor(private route: ActivatedRoute, private websocketService: DartsMatcherWebsocketService) {
  }

  /**
   * Lifecycle hook that triggers on component initialization.
   * Initiates the retrieval of the match using route parameters.
   */
  ngOnInit(): void {
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
    this.getMatchSubscription.add(this.getMatchIdFromRoute().pipe(
        switchMap(matchId => concat(
          this.websocketService.subscribeToX01MatchSingleResponse(matchId),
          this.websocketService.subscribeToX01MatchBroadcast(matchId)
        ))
      ).subscribe({
        next: (match: X01Match) => this.handleGetMatchSuccess(match),
        error: (err: HttpErrorResponse) => this.handleGetMatchError(err),
      })
    );
  }

  /**
   * Extracts the match ID from the current route parameters and validates if it's an ObjectId.
   *
   * @returns An observable emitting a valid match ID, or EMPTY if invalid.
   */
  private getMatchIdFromRoute(): Observable<string> {
    return this.route.paramMap.pipe(
      switchMap(params => {
        const matchId = params.get('id') ?? '';
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
    this.invalidMatchId = true;
  }

  /**
   * Handles HTTP errors from match retrieval.
   *
   * @param err - The HTTP error response
   */
  private handleGetMatchError(err: HttpErrorResponse) {
    if (isApiErrorBody(err)) {

    }
  }

}
