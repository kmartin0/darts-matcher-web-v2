import {Component, input} from '@angular/core';
import {X01Match} from '../../../../data/model/x01/x01-match';
import {JsonPipe} from '@angular/common';

@Component({
  selector: 'app-match-board',
  templateUrl: './match-board.html',
  styleUrl: './match-board.scss',
  imports: [
    JsonPipe
  ]
})
export class MatchBoard {
  readonly match = input.required<X01Match>();
}
