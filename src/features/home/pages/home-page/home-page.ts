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
import {RecentX01Matches} from '../../components/recent-x01-matches/recent-x01-matches';

@Component({
  selector: 'app-home-page',
  providers: [HomePageStore],
  imports: [ThemeToggle, CreateX01MatchForm, MatchIdForm, RecentX01Matches],
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
   * @param formModel - Submitted create-X01-match form model.
   * @returns Submission errors returned by the store.
   */
  protected readonly onCreateX01MatchSubmit: CreateX01MatchFormModel.SubmitAction = formModel => {
    return this.store.submitX01Match(formModel);
  };

  /**
   * Submits the match ID form through the page store.
   *
   * @param formModel - Submitted match ID form model.
   * @returns Submission errors returned by the store.
   */
  protected readonly onMatchIdSubmit: MatchIdFormModel.SubmitAction = formModel => {
    return this.store.submitMatchId(formModel);
  };

  /**
   * Initializes page-level state observers.
   */
  constructor() {
    this.observeNavigateToMatch();
  }

  /**
   * Handles selection of a recent match.
   *
   * @param matchId - ID of the selected match.
   */
  protected onSelectMatch(matchId: string): void {
    this.navigateToMatch(matchId);
  }

  /**
   * Handles removal of a recent match.
   *
   * @param matchId - ID of the match to remove.
   */
  protected onRemoveMatch(matchId: string): void {
    this.store.removeRecentMatch(matchId);
  }

  /**
   * Observes the match ID to navigate to and handles match navigation.
   */
  private observeNavigateToMatch(): void {
    observeSignalProperty(
      () => this.uiState().navigateToX01MatchId,
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
    void this.router.navigateByUrl(AppEndpoints.x01Match(matchId));
  }
}
