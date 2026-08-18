import {Component, inject} from '@angular/core';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {JsonPipe} from '@angular/common';
import {X01MatchPageStore} from './x01-match-page-store';

@Component({
  selector: 'app-x01-match-page',
  templateUrl: './x01-match-page.html',
  imports: [
    MatProgressSpinner,
    JsonPipe
  ],
  providers: [X01MatchPageStore],
  styleUrl: './x01-match-page.scss'
})
export class X01MatchPage {
  private readonly store = inject(X01MatchPageStore);

  protected readonly uiState = this.store.state;
}
