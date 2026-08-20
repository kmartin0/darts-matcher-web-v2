import {Component, inject} from '@angular/core';
import {HomePageStore} from './home-page-store';
import {ThemeToggle} from '../../../../shared/components/theme-toggle/theme-toggle';
import {CreateX01MatchForm} from '../../components/create-x01-match-form/create-x01-match-form';
import * as CreateX01MatchFormModel from '../../components/create-x01-match-form/create-x01-match-form.model';
import {observeSignalProperty} from '../../../../shared/utils/signal.util';
import {Router} from '@angular/router';
import {AppEndpoints} from '../../../../app/app-endpoints';

@Component({
  selector: 'app-home-page',
  providers: [HomePageStore],
  imports: [ThemeToggle, CreateX01MatchForm],
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
  protected readonly onX01MatchSubmit: CreateX01MatchFormModel.SubmitAction = formModel => {
    return this.store.createX01Match(formModel);
  };

  /**
   * Initializes page-level state observers.
   */
  constructor() {
    this.observeX01MatchCreated();
  }

  /**
   * Observes the created X01 match ID and handles successful match creation.
   */
  private observeX01MatchCreated(): void {
    observeSignalProperty(
      () => this.uiState().createdX01MatchId,
      matchId => this.onX01MatchCreated(matchId)
    );
  }

  /**
   * Navigates to a successfully created X01 match.
   *
   * @param matchId - ID of the created match, or null when no created match is pending.
   */
  private onX01MatchCreated(matchId: string | null): void {
    if (matchId == null) return;
    void this.router.navigateByUrl(AppEndpoints.match(matchId));
  }
}
