import {Component, input} from '@angular/core';
import {MatchHeaderPipe} from './pipes/match-header.pipe';
import {X01Match} from '../../../../data/model/x01/x01-match';

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
