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

  ngOnInit(): void {
    this.getMatch();
  }

  ngOnDestroy() {
    this.getMatchSubscription.unsubscribe();
    this.websocketService.deactivate();
  }

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

  private handleGetMatchSuccess(match: X01Match) {
    this.match = match;
  }

  private handleInvalidMatchId() {
    this.invalidMatchId = true;
  }

  private handleGetMatchError(err: HttpErrorResponse) {
    if (isApiErrorBody(err)) {

    }
  }

}
