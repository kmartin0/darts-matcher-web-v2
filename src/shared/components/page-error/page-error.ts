import {Component, input} from '@angular/core';

@Component({
  selector: 'app-page-error',
  imports: [],
  templateUrl: './page-error.html',
  styleUrl: './page-error.scss'
})
export class PageError {
  readonly message = input.required<string>();
}
