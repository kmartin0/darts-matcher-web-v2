import {Component, inject, Input, OnChanges, SimpleChanges} from '@angular/core';
import {BaseComponent} from '../../../../shared/components/base/base.component';
import {X01Match} from '../../../../models/x01-match/x01-match';
import {X01MatchStatisticsCardMapperService} from './x01-match-statistics-card-mapper.service';
import {InformationCardData} from '../../../../shared/components/information-card/information-card-data';
import {InformationCardComponent} from '../../../../shared/components/information-card/information-card.component';

@Component({
  selector: 'app-x01-match-statistics',
  imports: [
    InformationCardComponent
  ],
  standalone: true,
  templateUrl: './x01-match-statistics.component.html',
  styleUrl: './x01-match-statistics.component.scss'
})
export class X01MatchStatisticsComponent extends BaseComponent implements OnChanges {
  @Input() match: X01Match | null = null;
  matchStatisticsCardsData: InformationCardData[] | null = null;
  private statisticsCardMapper = inject(X01MatchStatisticsCardMapperService);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['match']) {
      this.matchStatisticsCardsData = this.statisticsCardMapper.mapToCardsData(this.match);
    }
  }
}
