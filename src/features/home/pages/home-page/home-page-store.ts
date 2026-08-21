import {DestroyRef, inject, Injectable, signal} from '@angular/core';
import {HomePageState, initialHomeState} from './home-page-state';
import * as CreateX01MatchFormModel from '../../components/create-x01-match-form/create-x01-match-form.model';
import {X01MatchRepository} from '../../../../data/repository/x01-match-repository';
import {mapToCreateX01MatchRequest} from '../../mappers/create-x01-match-request.mapper';
import {catchError, firstValueFrom, map, of, tap} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {getApiErrorResponse} from '../../../../data/api/errors/api-error-response';
import {mapToCreateX01MatchSubmitErrors} from '../../mappers/create-x01-match-submit-error.mapper';
import * as MatchIdFormModel from '../../components/match-id-form/match-id-form.model';
import {mapToMatchIdSubmitErrors} from '../../mappers/match-id-submit-error.mapper';

@Injectable()
export class HomePageStore {
  private readonly x01MatchRepository = inject(X01MatchRepository);
  private readonly _state = signal<HomePageState>(initialHomeState);
  private readonly destroyRef = inject(DestroyRef);

  readonly state = this._state.asReadonly();

  /**
   * Creates an X01 match from the submitted form model.
   *
   * On success, stores the created match ID and resolves with no submission errors.
   * API failures are mapped to form submit errors.
   *
   * @param x01MatchForm - Submitted create-X01-match form model.
   * @returns A promise resolving to form submission errors.
   */
  createX01Match(x01MatchForm: CreateX01MatchFormModel.FormModel): Promise<CreateX01MatchFormModel.SubmitError[]> {
    return firstValueFrom(
      this.x01MatchRepository
        .createMatch(mapToCreateX01MatchRequest(x01MatchForm))
        .pipe(takeUntilDestroyed(this.destroyRef),
          tap(x01Match => {
            this.patchState({navigateToMatchId: x01Match.id});
          }),
          map(() => []),
          catchError((error: unknown) => {
            const errorResponse = getApiErrorResponse(error);
            return of<CreateX01MatchFormModel.SubmitError[]>(mapToCreateX01MatchSubmitErrors(errorResponse));
          })
        ),
      {defaultValue: []}
    );
  }

  /**
   * Validates that the submitted match ID belongs to an existing X01 match.
   *
   * On success, stores the match ID for navigation and resolves with no submission errors.
   * API failures are mapped to match ID form submission errors.
   *
   * @param formModel - Submitted match ID form model.
   * @returns A promise resolving to form submission errors.
   */
  goToMatch(formModel: MatchIdFormModel.FormModel): Promise<MatchIdFormModel.SubmitError[]> {
    return firstValueFrom(
      this.x01MatchRepository
        .matchExists(formModel.matchId)
        .pipe(takeUntilDestroyed(this.destroyRef),
          tap(() => {
            this.patchState({navigateToMatchId: formModel.matchId});
          }),
          map(() => []),
          catchError((error: unknown) => {
            const errorResponse = getApiErrorResponse(error);
            return of<MatchIdFormModel.SubmitError[]>(mapToMatchIdSubmitErrors(errorResponse));
          })
        ),
      {defaultValue: []}
    );
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
