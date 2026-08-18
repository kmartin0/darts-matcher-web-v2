import {DestroyRef, inject, Injectable, signal} from '@angular/core';
import {HomePageState, initialHomeState} from './home-page-state';
import {CreateX01MatchFormModel} from '../../components/create-x01-match-form/create-x01-match-form.model';
import {X01MatchRepository} from '../../../../data/repository/x01-match-repository';
import {mapToCreateX01MatchRequest} from '../../mappers/create-x01-match-request.mapper';
import {finalize} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Injectable()
export class HomePageStore {
  private readonly x01MatchRepository = inject(X01MatchRepository);
  private readonly _state = signal<HomePageState>(initialHomeState);
  private readonly destroyRef = inject(DestroyRef);

  readonly state = this._state.asReadonly();

  /**
   * Creates an X01 match through the repository and updates the store with the created match ID.
   *
   * @param x01MatchForm - X01 match form model used to create the match.
   */
  createX01Match(x01MatchForm: CreateX01MatchFormModel): void {
    this.patchState({isCreatingX01Match: true});
    this.x01MatchRepository
      .createMatch(mapToCreateX01MatchRequest(x01MatchForm))
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.patchState({isCreatingX01Match: false});
        })
      )
      .subscribe({
        next: x01Match => {
          console.log(x01Match);
          this.patchState({createdX01MatchId: x01Match.id});
        },
        error: error => {
          console.log(error);
        }
      });
  }

  /**
   * Updates the current home state with the provided values.
   *
   * @param patch - Partial state containing the values to update.
   */
  private patchState(patch: Partial<HomePageState>): void {
    this._state.update(state => ({
      ...state,
      ...patch,
    }));
  }
}
