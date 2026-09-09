import {DatePipe} from '@angular/common';
import {Component, input, output} from '@angular/core';
import {MatIconButton} from '@angular/material/button';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatIcon} from '@angular/material/icon';
import {MatList, MatListItem} from '@angular/material/list';
import {MatTooltip} from '@angular/material/tooltip';
import {X01Match} from '../../../../data/model/x01/match/x01-match';
import {ErrorMessage} from '../../../../shared/components/error-message/error-message';
import {LoadState} from '../../../../shared/types/load-state';
import {BestOfLegsRulePipe} from './pipes/best-of-legs-rule.pipe';
import {BestOfSetsRulePipe} from './pipes/best-of-sets-rule.pipe';
import {ClearByTwoFinalSetRulePipe} from './pipes/clear-by-two-final-set-rule.pipe';
import {EpochSecondsToDatePipe} from './pipes/epoch-seconds-to-date.pipe';
import {ScorelinePipe} from './pipes/scoreline.pipe';

@Component({
  selector: 'app-recent-matches',
  imports: [
    DatePipe,
    MatExpansionModule,
    MatIcon,
    MatIconButton,
    MatList,
    MatListItem,
    MatTooltip,
    ErrorMessage,
    ScorelinePipe,
    BestOfLegsRulePipe,
    BestOfSetsRulePipe,
    ClearByTwoFinalSetRulePipe,
    EpochSecondsToDatePipe,
  ],
  templateUrl: './recent-matches.html',
  styleUrl: './recent-matches.scss',
})
export class RecentMatches {
  readonly recentMatches = input.required<LoadState<X01Match[]>>();

  readonly selectMatch = output<string>();
  readonly deleteMatch = output<string>();

  /**
   * Selects a recent match without toggling its expansion panel.
   *
   * @param event - Click event to stop from propagating to the panel header.
   * @param matchId - ID of the match to select.
   */
  protected onSelectMatch(event: MouseEvent, matchId: string): void {
    event.stopPropagation();
    this.selectMatch.emit(matchId);
  }

  /**
   * Deletes a recent match without toggling its expansion panel.
   *
   * @param event - Click event to stop from propagating to the panel header.
   * @param matchId - ID of the match to delete.
   */
  protected onDeleteMatch(event: MouseEvent, matchId: string): void {
    event.stopPropagation();
    this.deleteMatch.emit(matchId);
  }
}
