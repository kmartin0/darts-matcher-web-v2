import {DestroyRef, inject, Injectable, signal} from '@angular/core';
import {X01MatchRepository} from '../../../data/repository/x01-match-repository';
import {initialX01MatchPageState, X01MatchPageState} from './x01-match-page-state';
import {catchError, EMPTY, map, Observable, switchMap, tap} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ActivatedRoute} from '@angular/router';
import {isValidObjectId} from '../../../data/api/utils/object-id.util';
import {X01Match} from '../../../data/model/x01/x01-match';
import {RecentX01MatchesRepository} from '../../../data/repository/recent-x01-matches-repository';
import {getApiErrorResponse} from '../../../data/api/errors/api-error-response';
import {ApiErrorCode} from '../../../data/api/errors/api-error-code';

@Injectable()
export class X01MatchPageStore {
  private readonly x01MatchRepository = inject(X01MatchRepository);
  private readonly recentMatchesRepository = inject(RecentX01MatchesRepository);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _state = signal<X01MatchPageState>(initialX01MatchPageState);
  readonly state = this._state.asReadonly();

  /**
   * Initializes the store by observing route parameter changes.
   */
  constructor() {
    this.observeRouteParams();
  }

  /**
   * Observes route parameter changes and loads the corresponding X01 match.
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
            this.patchState({x01Match: {status: 'error'}});
            return EMPTY;
          }

          return this.loadX01Match(matchId);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  /**
   * Loads an X01 match by its ID and updates the page state for the load result.
   *
   * Any load failure is represented as an error state.
   *
   * @param matchId - Valid ObjectId of the X01 match to load.
   * @returns Observable of the loaded X01 match.
   */
  private loadX01Match(matchId: string): Observable<X01Match> {
    this.patchState({x01Match: {status: 'loading'}});

    return this.x01MatchRepository
      .getX01Match(matchId)
      .pipe(
        tap(match => {
          this.recentMatchesRepository.addMatch(match.id);
          this.patchState({x01Match: {status: 'loaded', data: match}});
        }),
        catchError((error: unknown) => {
          this.handleLoadX01MatchError(matchId, error);
          return EMPTY;
        }),
      );
  }

  /**
   * Handles an X01 match load failure.
   *
   * Removes the match from recents when it no longer exists and updates the page
   * to the error state.
   *
   * @param matchId - ID of the match that failed to load.
   * @param error - Error returned while loading the match.
   */
  private handleLoadX01MatchError(matchId: string, error: unknown): void {
    const errorResponse = getApiErrorResponse(error);

    if (errorResponse?.error === ApiErrorCode.RESOURCE_NOT_FOUND) {
      this.recentMatchesRepository.removeMatch(matchId);
    }

    this.patchState({x01Match: {status: 'error'}});
  }

  /**
   * Updates the current page state with the provided values.
   *
   * @param patch - Partial state containing the values to update.
   */
  private patchState(patch: Partial<X01MatchPageState>): void {
    this._state.update(state => ({
      ...state,
      ...patch
    }));
  }
}
