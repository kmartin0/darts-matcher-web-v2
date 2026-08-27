import {Component, input} from '@angular/core';

@Component({
  selector: 'app-error-message',
  templateUrl: './error-message.html',
  styleUrl: './error-message.scss',
})
export class ErrorMessage {
  readonly message = input<string | null>(null);
  readonly contrast = input<boolean>(false);
}
