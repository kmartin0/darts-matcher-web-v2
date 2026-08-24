import {Component, inject} from '@angular/core';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {JsonPipe} from '@angular/common';
import {MatchPageStore} from './match-page-store';
import {PageError} from '../../../shared/components/page-error/page-error';

@Component({
  selector: 'app-match-page',
  templateUrl: './match-page.html',
  imports: [
    MatProgressSpinner,
    JsonPipe,
    PageError
  ],
  providers: [MatchPageStore],
  styleUrl: './match-page.scss'
})
export class MatchPage {
  private readonly store = inject(MatchPageStore);

  protected readonly uiState = this.store.state;
}
