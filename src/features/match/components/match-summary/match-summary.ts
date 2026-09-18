import {Component, input} from '@angular/core';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import {X01Match} from '../../../../data/model/x01/match/x01-match';
import {MatchInformation} from '../match-information/match-information';
import {MatchStatistics} from '../match-statistics/match-statistics';

@Component({
  selector: 'app-match-summary',
  imports: [
    MatTabGroup,
    MatTab,
    MatchInformation,
    MatchStatistics
  ],
  templateUrl: './match-summary.html',
  styleUrl: './match-summary.scss'
})
export class MatchSummary {
  readonly match = input.required<X01Match>();
}
