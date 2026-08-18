import {Component, inject, viewChild} from '@angular/core';
import {HomeStore} from './home-store';
import {ThemeToggle} from '../../../../shared/components/theme-toggle/theme-toggle';
import {CreateX01MatchForm} from '../../components/create-x01-match-form/create-x01-match-form';
import {CreateX01MatchFormModel} from '../../components/create-x01-match-form/create-x01-match-form.model';
import {observeSignalProperty} from '../../../../shared/utils/signal.util';

@Component({
  selector: 'app-home-page',
  providers: [HomeStore],
  imports: [ThemeToggle, CreateX01MatchForm],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss'
})
export class HomePage {
  private readonly store = inject(HomeStore);
  protected readonly uiState = this.store.state;

  private readonly createMatchForm = viewChild.required(CreateX01MatchForm);

  constructor() {
    this.observeX01MatchCreated();
  }

  /**
   * Submits the X01 match form for creation.
   *
   * @param matchForm - X01 match form model to create the match from.
   */
  protected onX01MatchSubmit(matchForm: CreateX01MatchFormModel): void {
    void this.store.createX01Match(matchForm);
    console.log(matchForm);
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
   * Handles a successfully created X01 match.
   *
   * @param matchId - ID of the created match, or null when no created match is pending.
   */
  private onX01MatchCreated(matchId: string | null): void {
    if (matchId == null) return;

    // 1. Navigate to Match ID.

    // 2. Reset form.
    this.createMatchForm().reset();

    // 3. Reset created match id.
    this.store.onCreatedX01MatchHandled();
  }
}
