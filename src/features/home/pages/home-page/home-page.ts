import {Component, inject} from '@angular/core';
import {HomePageStore} from './home-page-store';
import {ThemeToggle} from '../../../../shared/components/theme-toggle/theme-toggle';
import {CreateX01MatchForm} from '../../components/create-x01-match-form/create-x01-match-form';
import * as CreateX01MatchFormModel from '../../components/create-x01-match-form/create-x01-match-form.model';
import * as MatchIdFormModel from '../../components/match-id-form/match-id-form.model';
import {observeSignalProperty} from '../../../../shared/utils/signal.util';
import {Router} from '@angular/router';
import {AppEndpoints} from '../../../../app/app-endpoints';
import {MatchIdForm} from '../../components/match-id-form/match-id-form';

@Component({
  selector: 'app-home-page',
  providers: [HomePageStore],
  imports: [ThemeToggle, CreateX01MatchForm, MatchIdForm],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss'
})
export class HomePage {
  private readonly store = inject(HomePageStore);
  private readonly router = inject(Router);

  protected readonly uiState = this.store.state;

  /**
   * Submits the create-X01-match form through the page store.
   *
   * @param formModel - Current create-X01-match form model.
   * @returns Submission errors returned by the store.
   */
  protected readonly onCreateX01MatchSubmit: CreateX01MatchFormModel.SubmitAction = formModel => {
    return this.store.createX01Match(formModel);
  };

  /**
   * Submits the match-id form through the page store.
   *
   * @param formModel - Current match-id form model.
   * @returns Submission errors returned by the store.
   */
  protected readonly onMatchIdSubmit: MatchIdFormModel.SubmitAction = formModel => {
    return this.store.goToMatch(formModel)
  };

  /**
   * Initializes page-level state observers.
   */
  constructor() {
    this.observeNavigateToMatch();
  }

  /**
   * Observes the match ID to navigate to and handles match navigation.
   */
  private observeNavigateToMatch(): void {
    observeSignalProperty(
      () => this.uiState().navigateToMatchId,
      matchId => this.navigateToMatch(matchId)
    );
  }

  /**
   * Navigates to the match with the given ID.
   *
   * @param matchId - ID of the match to navigate to, or null when no navigation is pending.
   */
  private navigateToMatch(matchId: string | null): void {
    if (matchId == null) return;
    void this.router.navigateByUrl(AppEndpoints.match(matchId));
  }
}
