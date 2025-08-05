import {Component, Input} from '@angular/core';
import {InformationCardData} from './information-card-data';
import {MatCard, MatCardContent} from '@angular/material/card';

@Component({
  selector: 'app-information-card',
  imports: [
    MatCard,
    MatCardContent
  ],
  standalone: true,
  templateUrl: './information-card.component.html',
  styleUrl: './information-card.component.scss'
})
export class InformationCardComponent {
  @Input() cardData: InformationCardData | null = null;
}
