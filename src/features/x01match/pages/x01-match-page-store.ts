import {DestroyRef, inject, Injectable, signal} from '@angular/core';
import {X01MatchRepository} from '../../../data/repository/x01-match-repository';
import {initialX01MatchPageState, X01MatchPageState} from './x01-match-page-state';
import {catchError, EMPTY, filter, map, Observable, of, switchMap, tap} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ActivatedRoute} from '@angular/router';
import {isValidObjectId} from '../../../data/api/utils/object-id.util';
import {X01Match} from '../../../data/model/x01/x01-match';

@Injectable()
export class X01MatchPageStore {
  private readonly x01MatchRepository = inject(X01MatchRepository);
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
   * Invalid match IDs are treated as not found. Using switchMap ensures any
   * previous match request is cancelled when the route parameter changes.
   */
  private observeRouteParams(): void {
    this.route.paramMap
      .pipe(
        map(params => params.get('matchId')),
        switchMap(matchId => {
          if (!isValidObjectId(matchId)) {
            this.patchState({x01MatchStatus: 'notFound', x01Match: null});
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
   * Any load failure is represented as a not-found state.
   *
   * @param matchId - Valid ObjectId of the X01 match to load.
   * @returns Observable of the loaded X01 match.
   */
  private loadX01Match(matchId: string): Observable<X01Match> {
    this.patchState({x01MatchStatus: 'loading', x01Match: null});

    return this.x01MatchRepository
      .getX01Match(matchId)
      .pipe(
        tap(match => {
          this.patchState({x01MatchStatus: 'loaded', x01Match: match});
        }),
        catchError((error: unknown) => {
          this.patchState({x01MatchStatus: 'notFound', x01Match: null});
          return EMPTY;
        }),
      );
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
