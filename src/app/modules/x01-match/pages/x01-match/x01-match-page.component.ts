import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {EMPTY, Subscription, switchMap} from 'rxjs';
import {DartsMatcherApiService} from '../../../../api/services/darts-matcher-api.service';
import {X01Match} from '../../../../models/x01-match/x01-match';
import {HttpErrorResponse} from '@angular/common/http';
import {isApiErrorBody} from '../../../../api/error/api-error-body';
import {ObjectId} from '../../../../models/object-id';
import {JsonPipe, NgIf} from '@angular/common';
import {MatToolbar} from '@angular/material/toolbar';

@Component({
  selector: 'app-x01-match-page',
  imports: [
    NgIf,
    JsonPipe,
    MatToolbar
  ],
  standalone: true,
  templateUrl: './x01-match-page.component.html',
  styleUrl: './x01-match-page.component.scss'
})
export class X01MatchPageComponent implements OnInit, OnDestroy {

  private getMatchSubscription: Subscription = new Subscription();
  invalidMatchId: boolean = false;

  public match: X01Match | null = null;

  constructor(private route: ActivatedRoute, private apiService: DartsMatcherApiService) {
  }

  ngOnInit(): void {
    this.getMatch();
  }

  ngOnDestroy() {
    this.getMatchSubscription.unsubscribe();
  }

  private getMatch() {
    this.getMatchSubscription.add(this.route.paramMap.pipe(
        switchMap(params => {
          const matchId = params.get('id') ?? '';
          if (!ObjectId.isValid(matchId)) {
            this.handleInvalidMatchId();
            return EMPTY;
          }

          return this.apiService.getMatch(new ObjectId(matchId));
        })
      ).subscribe({
        next: (match: X01Match) => this.handleGetMatchSuccess(match),
        error: (err: HttpErrorResponse) => this.handleGetMatchError(err),
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
