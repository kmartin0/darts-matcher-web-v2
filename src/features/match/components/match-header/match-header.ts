import {Component, input} from '@angular/core';
import {X01Match} from '../../../../data/model/x01/match/x01-match';
import {MatchHeaderPipe} from './pipes/match-header.pipe';

@Component({
  selector: 'app-match-header',
  templateUrl: './match-header.html',
  imports: [
    MatchHeaderPipe
  ],
  styleUrl: './match-header.scss'
})
export class MatchHeader {
  readonly match = input.required<X01Match>();
}
