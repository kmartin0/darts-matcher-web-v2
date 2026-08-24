import {DestroyRef, inject, Injectable, signal} from '@angular/core';
import {HomePageState, initialHomeState} from './home-page-state';
import * as CreateX01MatchFormModel from '../../components/create-x01-match-form/create-x01-match-form.model';
import {X01MatchRepository} from '../../../../data/repository/x01-match-repository';
import {mapToCreateX01MatchRequest} from '../../mappers/create-x01-match-request.mapper';
import {catchError, EMPTY, firstValueFrom, map, of, switchMap, tap} from 'rxjs';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {getApiErrorResponse} from '../../../../data/api/errors/api-error-response';
import {mapToCreateX01MatchSubmitErrors} from '../../mappers/create-x01-match-submit-error.mapper';
import * as MatchIdFormModel from '../../components/match-id-form/match-id-form.model';
import {mapToMatchIdSubmitErrors} from '../../mappers/match-id-submit-error.mapper';
import {RecentX01MatchesRepository} from '../../../../data/repository/recent-x01-matches-repository';
import {X01Match} from '../../../../data/model/x01/x01-match';

@Injectable()
export class HomePageStore {
  private readonly x01MatchRepository = inject(X01MatchRepository);
  private readonly recentMatchesRepository = inject(RecentX01MatchesRepository);
  private readonly _state = signal<HomePageState>(initialHomeState);
  private readonly destroyRef = inject(DestroyRef);

  readonly state = this._state.asReadonly();

  constructor() {
    this.observeRecentMatchIds();
  }

  /**
   * Submits the create-X01-match form.
   *
   * On success, stores the created match ID for navigation and resolves with no submission errors.
   * API failures are mapped to form submission errors.
   *
   * @param x01MatchForm - Submitted create-X01-match form model.
   * @returns A promise resolving to form submission errors.
   */
  submitX01Match(x01MatchForm: CreateX01MatchFormModel.FormModel): Promise<CreateX01MatchFormModel.SubmitError[]> {
    return firstValueFrom(
      this.x01MatchRepository
        .createMatch(mapToCreateX01MatchRequest(x01MatchForm))
        .pipe(
          tap(x01Match => {
            this.patchState({navigateToX01MatchId: x01Match.id});
          }),
          map(() => []),
          catchError((error: unknown) => {
            const errorResponse = getApiErrorResponse(error);
            return of<CreateX01MatchFormModel.SubmitError[]>(mapToCreateX01MatchSubmitErrors(errorResponse));
          }),
          takeUntilDestroyed(this.destroyRef)
        ),
      {defaultValue: []}
    );
  }

  /**
   * Submits the match ID form.
   *
   * Validates that the submitted match ID belongs to an existing X01 match.
   * On success, stores the match ID for navigation and resolves with no submission errors.
   * API failures are mapped to match ID form submission errors.
   *
   * @param formModel - Submitted match ID form model.
   * @returns A promise resolving to form submission errors.
   */
  submitMatchId(formModel: MatchIdFormModel.FormModel): Promise<MatchIdFormModel.SubmitError[]> {
    return firstValueFrom(
      this.x01MatchRepository
        .matchExists(formModel.matchId)
        .pipe(
          tap(() => {
            this.patchState({navigateToX01MatchId: formModel.matchId});
          }),
          map(() => []),
          catchError((error: unknown) => {
            const errorResponse = getApiErrorResponse(error);
            return of<MatchIdFormModel.SubmitError[]>(mapToMatchIdSubmitErrors(errorResponse));
          }),
          takeUntilDestroyed(this.destroyRef)
        ),
      {defaultValue: []}
    );
  }

  /**
   * Removes a match from the recently visited matches.
   *
   * @param matchId - ID of the match to remove.
   */
  removeRecentMatch(matchId: string) {
    this.recentMatchesRepository.removeMatch(matchId);
  }

  /**
   * Observes recently visited match IDs and loads their corresponding X01 matches.
   *
   * Updates the recent matches load state when loading succeeds or fails.
   */
  private observeRecentMatchIds(): void {
    this.patchState({recentX01Matches: {status: 'loading'}});
    toObservable(this.recentMatchesRepository.recentMatchIds)
      .pipe(
        switchMap(recentMatchIds => {
          if (recentMatchIds.length === 0) {
            return of<X01Match[]>([]);
          }

          return this.x01MatchRepository
            .getMatches(recentMatchIds)
            .pipe(
              catchError(() => {
                this.patchState({recentX01Matches: {status: 'error'}});

                return EMPTY;
              })
            );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(recentMatches => {
        this.patchState({recentX01Matches: {status: 'loaded', data: recentMatches}});
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
