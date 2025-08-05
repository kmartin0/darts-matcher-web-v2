import {Component, inject, Input, OnChanges, SimpleChanges} from '@angular/core';
import {BaseComponent} from '../../../../shared/components/base/base.component';
import {X01Match} from '../../../../models/x01-match/x01-match';
import {X01MatchInformationCardMapperService} from './x01-match-information-card-mapper.service';
import {InformationCardData} from '../../../../shared/components/information-card/information-card-data';
import {InformationCardComponent} from '../../../../shared/components/information-card/information-card.component';

@Component({
  selector: 'app-x01-match-information',
  imports: [
    InformationCardComponent
  ],
  standalone: true,
  templateUrl: './x01-match-information.component.html',
  styleUrl: './x01-match-information.component.scss'
})
export class X01MatchInformationComponent extends BaseComponent implements OnChanges {
  @Input() match: X01Match | null = null;
  cardData: InformationCardData | null = null;
  private informationCardMapper = inject(X01MatchInformationCardMapperService);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['match']) {
      this.cardData = this.informationCardMapper.mapToCardData(this.match);
    }
  }
}
