import {Component, input} from '@angular/core';
import {X01Match} from '../../../../data/model/x01/match/x01-match';
import {MatchFormatSummaryPipe} from './pipes/match-format-summary.pipe';

@Component({
  selector: 'app-match-header',
  templateUrl: './match-header.html',
  imports: [
    MatchFormatSummaryPipe
  ],
  styleUrl: './match-header.scss'
})
export class MatchHeader {
  readonly match = input.required<X01Match>();
}
