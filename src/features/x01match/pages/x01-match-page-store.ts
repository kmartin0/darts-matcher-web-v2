import {DestroyRef, inject, Injectable, signal} from '@angular/core';
import {X01MatchRepository} from '../../../data/repository/x01-match-repository';
import {initialX01MatchPageState, X01MatchPageState} from './x01-match-page-state';
import {finalize} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ActivatedRoute} from '@angular/router';

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
   * Observes the route params and loads the corresponding X01 match whenever the matchId changes.
   */
  private observeRouteParams(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const matchId = params.get('matchId');
        if (matchId) this.loadX01Match(matchId);
      });
  }

  /**
   * Loads an X01 match by its ID.
   *
   * @param matchId - ID of the X01 match to load.
   */
  private loadX01Match(matchId: string): void {
    this.patchState({isLoadingX01Match: true});
    this.x01MatchRepository
      .getX01Match(matchId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.patchState({isLoadingX01Match: false});
        })
      )
      .subscribe({
        next: match => {
          this.patchState({x01Match: match});
        },
        error: error => {
          //TODO: Error Handling
        }
      });
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
