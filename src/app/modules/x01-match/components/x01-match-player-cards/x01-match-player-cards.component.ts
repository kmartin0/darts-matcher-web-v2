import {Component, inject, Input, OnChanges, SimpleChanges} from '@angular/core';
import {X01Match} from '../../../../models/x01-match/x01-match';
import {
  X01MatchPlayerCardsViewDataTransformer
} from './view-data-transformer/x01-match-player-cards-view-data-transformer.service';
import {KeyValuePipe, NgClass} from '@angular/common';
import {MatCard} from '@angular/material/card';
import {LegSelection} from '../../../../models/common/leg-selection';
import {X01PlayerCardsViewData} from './view-data-transformer/x01-player-cards-view-data';
import {ResultType} from '../../../../models/basematch/result-type';
import {BaseComponent} from '../../../../shared/components/base/base.component';
import {X01BestOfType} from '../../../../models/x01-match/x01-best-of-type';
import {MatDivider} from '@angular/material/divider';

@Component({
  selector: 'app-x01-match-player-cards',
  imports: [
    KeyValuePipe,
    MatCard,
    NgClass
  ],
  standalone: true,
  templateUrl: './x01-match-player-cards.component.html',
  styleUrl: './x01-match-player-cards.component.scss'
})
export class X01MatchPlayerCardsComponent extends BaseComponent implements OnChanges {
  @Input() match: X01Match | null = null;
  @Input() legSelection: LegSelection | null = null;
  protected readonly ResultType = ResultType;
  protected readonly X01BestOfType = X01BestOfType;
  viewData: X01PlayerCardsViewData | null = null;

  private viewDataTransformer = inject(X01MatchPlayerCardsViewDataTransformer);

  /**
   * Watches for changes to `match` input to update view data.
   * @param changes - Object containing changes to input properties
   */
  async ngOnChanges(changes: SimpleChanges) {
    if (changes['match']) {
      await this.updateViewData();
    }
  }

  /**
   * Replaces the view data with a newly constructed view data object reflecting the `X01Match` object of the class.
   */
  private async updateViewData() {
    this.viewData = await this.viewDataTransformer.transform(this.match);
  }
}
