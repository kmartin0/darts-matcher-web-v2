import {Component, inject} from '@angular/core';
import {Router} from '@angular/router';
import {AppEndpoints} from '../../../../app/app-endpoints';
import {ThemeToggle} from '../../../../shared/components/theme-toggle/theme-toggle';
import {CommonDialogService} from '../../../../shared/services/common-dialog.service';
import {observeSignalProperty} from '../../../../shared/utils/signal.util';
import {CreateMatchForm} from '../../components/create-match-form/create-match-form';
import * as CreateMatchFormModel from '../../components/create-match-form/create-match-form.model';
import {MatchIdForm} from '../../components/match-id-form/match-id-form';
import * as MatchIdFormModel from '../../components/match-id-form/match-id-form.model';
import {RecentMatches} from '../../components/recent-matches/recent-matches';
import {HomePageStore} from './home-page-store';

@Component({
  selector: 'app-home-page',
  providers: [HomePageStore],
  imports: [ThemeToggle, CreateMatchForm, MatchIdForm, RecentMatches],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss'
})
export class HomePage {
  private readonly store = inject(HomePageStore);
  private readonly commonDialogService = inject(CommonDialogService);
  private readonly router = inject(Router);

  protected readonly uiState = this.store.state;

  /**
   * Submits the create-match form through the page store.
   *
   * @param formModel - Submitted create-match form model.
   * @returns Submission errors returned by the store.
   */
  protected readonly onCreateMatchSubmit: CreateMatchFormModel.SubmitAction = formModel => {
    return this.store.submitCreateMatch(formModel);
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

  constructor() {
    this.registerMatchNavigationObserver();
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
   * Handles removal of a match from recent matches.
   *
   * @param matchId - ID of the match to remove.
   */
  protected onDeleteFromRecentMatches(matchId: string): void {
    const dialogRef = this.commonDialogService.openConfirmDialog(
      'Remove this match from recents'
    );

    dialogRef?.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.store.deleteFromRecentMatches(matchId);
      }
    });
  }

  /**
   * Registers the observer that handles pending match navigation.
   */
  private registerMatchNavigationObserver(): void {
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
    if (matchId === null) {
      return;
    }

    void this.router.navigateByUrl(AppEndpoints.match(matchId));
  }
}
