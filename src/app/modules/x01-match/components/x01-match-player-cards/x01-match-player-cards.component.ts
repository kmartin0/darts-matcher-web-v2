import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {X01Match} from '../../../../models/x01-match/x01-match';
import {
  X01MatchPlayerCardsViewDataTransformer
} from './view-data-transformer/x01-match-player-cards-view-data-transformer.service';
import {JsonPipe, KeyValuePipe, NgClass, NgIf} from '@angular/common';
import {MatCard} from '@angular/material/card';
import {LegSelection} from '../../../../models/common/leg-selection';
import {X01PlayerCardsViewData} from './view-data-transformer/x01-player-cards-view-data';

@Component({
  selector: 'app-x01-match-player-cards',
  imports: [
    NgIf,
    KeyValuePipe,
    MatCard,
    NgClass,
    JsonPipe
  ],
  standalone: true,
  templateUrl: './x01-match-player-cards.component.html',
  styleUrl: './x01-match-player-cards.component.scss'
})
export class X01MatchPlayerCardsComponent implements OnChanges {
  @Input() match: X01Match | null = null;
  @Input() legSelection: LegSelection | null = null;
  viewData: X01PlayerCardsViewData | null = null;

  constructor(private viewDataTransformer: X01MatchPlayerCardsViewDataTransformer) {
  }

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
    this.viewData = await this.viewDataTransformer.createPlayerCardsViewData(this.match);
    console.log(this.viewData);
  }

}
