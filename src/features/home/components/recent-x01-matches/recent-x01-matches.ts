import {DatePipe} from '@angular/common';
import {Component, input, output} from '@angular/core';
import {MatIconButton} from '@angular/material/button';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatIcon} from '@angular/material/icon';
import {MatList, MatListItem} from '@angular/material/list';
import {MatTooltip} from '@angular/material/tooltip';
import {X01Match} from '../../../../data/model/x01/x01-match';
import {X01BestOfType} from '../../../../data/model/x01/x01-best-of-type';
import {epochSecondsToDate, formatCount} from '../../../../shared/utils/number.util';
import {LoadState} from '../../../../shared/types/load-state';
import {ErrorMessage} from '../../../../shared/components/error-message/error-message';
import {X01ScorelinePipe} from './pipes/x01-scoreline.pipe';
import {X01BestOfSetsPipe} from './pipes/x01-best-of-sets.pipe';
import {X01BestOfLegsPipe} from './pipes/x01-best-of-legs.pipe';
import {X01ClearByTwoFinalSetPipe} from './pipes/x01-clear-by-two-final-set.pipe';
import {EpochSecondsToDatePipe} from './pipes/epoch-seconds-to-date.pipe';

@Component({
  selector: 'app-recent-x01-matches',
  imports: [
    DatePipe,
    MatExpansionModule,
    MatIcon,
    MatIconButton,
    MatList,
    MatListItem,
    MatTooltip,
    ErrorMessage,
    X01ScorelinePipe,
    X01BestOfSetsPipe,
    X01BestOfLegsPipe,
    X01ClearByTwoFinalSetPipe,
    EpochSecondsToDatePipe,
  ],
  templateUrl: './recent-x01-matches.html',
  styleUrl: './recent-x01-matches.scss',
})
export class RecentX01Matches {
  readonly recentMatches = input.required<LoadState<X01Match[]>>();

  readonly selectMatch = output<string>();
  readonly removeMatch = output<string>();

  protected readonly epochSecondsToDate = epochSecondsToDate;
}


