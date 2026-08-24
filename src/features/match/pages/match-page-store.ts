import {DestroyRef, inject, Injectable, signal} from '@angular/core';
import {MatchRepository} from '../../../data/repository/match-repository';
import {initialMatchPageState, MatchPageState} from './match-page-state';
import {catchError, EMPTY, map, Observable, switchMap, tap} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ActivatedRoute} from '@angular/router';
import {isValidObjectId} from '../../../data/api/utils/object-id.util';
import {X01Match} from '../../../data/model/x01/x01-match';
import {RecentMatchesRepository} from '../../../data/repository/recent-matches-repository';
import {getApiErrorResponse} from '../../../data/api/errors/api-error-response';
import {ApiErrorCode} from '../../../data/api/errors/api-error-code';

@Injectable()
export class MatchPageStore {
  private readonly matchRepository = inject(MatchRepository);
  private readonly recentMatchesRepository = inject(RecentMatchesRepository);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _state = signal<MatchPageState>(initialMatchPageState);
  readonly state = this._state.asReadonly();

  /**
   * Initializes the store by observing route parameter changes.
   */
  constructor() {
    this.observeRouteParams();
  }

  /**
   * Observes route parameter changes and loads the corresponding match.
   *
   * Invalid match IDs are represented as an error state. Using switchMap ensures
   * any previous match request is canceled when the route parameter changes.
   */
  private observeRouteParams(): void {
    this.route.paramMap
      .pipe(
        map(params => params.get('matchId')),
        switchMap(matchId => {
          if (!isValidObjectId(matchId)) {
            this.patchState({match: {status: 'error'}});
            return EMPTY;
          }

          return this.loadMatch(matchId);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  /**
   * Loads an match by its ID and updates the page state for the load result.
   *
   * Any load failure is represented as an error state.
   *
   * @param matchId - Valid ObjectId of the match to load.
   * @returns Observable of the loaded match.
   */
  private loadMatch(matchId: string): Observable<X01Match> {
    this.patchState({match: {status: 'loading'}});

    return this.matchRepository
      .getMatch(matchId)
      .pipe(
        tap(match => {
          this.recentMatchesRepository.addMatch(match.id);
          this.patchState({match: {status: 'loaded', data: match}});
        }),
        catchError((error: unknown) => {
          this.handleLoadMatchError(matchId, error);
          return EMPTY;
        }),
      );
  }

  /**
   * Handles an match load failure.
   *
   * Removes the match from recents when it no longer exists and updates the page
   * to the error state.
   *
   * @param matchId - ID of the match that failed to load.
   * @param error - Error returned while loading the match.
   */
  private handleLoadMatchError(matchId: string, error: unknown): void {
    const errorResponse = getApiErrorResponse(error);

    if (errorResponse?.error === ApiErrorCode.RESOURCE_NOT_FOUND) {
      this.recentMatchesRepository.removeMatch(matchId);
    }

    this.patchState({match: {status: 'error'}});
  }

  /**
   * Updates the current page state with the provided values.
   *
   * @param patch - Partial state containing the values to update.
   */
  private patchState(patch: Partial<MatchPageState>): void {
    this._state.update(state => ({
      ...state,
      ...patch
    }));
  }
}
