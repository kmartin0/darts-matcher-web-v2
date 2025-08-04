import {Component, inject, Input, OnChanges, SimpleChanges} from '@angular/core';
import {BaseComponent} from '../../../../shared/components/base/base.component';
import {MatCard, MatCardContent} from '@angular/material/card';
import {X01Match} from '../../../../models/x01-match/x01-match';
import {X01MatchInformationViewmodelMapperService} from './x01-match-information-viewmodel-mapper.service';
import {X01MatchInformationViewmodel} from './x01-match-information-viewmodel';
import {DatePipe, KeyValuePipe} from '@angular/common';
import {X01BestOfType} from '../../../../models/x01-match/x01-best-of-type';

@Component({
  selector: 'app-x01-match-information',
  imports: [
    MatCard,
    MatCardContent,
    KeyValuePipe,
    DatePipe
  ],
  standalone: true,
  templateUrl: './x01-match-information.component.html',
  styleUrl: './x01-match-information.component.scss'
})
export class X01MatchInformationComponent extends BaseComponent implements OnChanges {
  @Input() match: X01Match | null = null;
  viewModel: X01MatchInformationViewmodel | null = null;
  protected readonly X01BestOfType = X01BestOfType;
  private viewModelMapperService = inject(X01MatchInformationViewmodelMapperService);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['match']) {
      this.viewModel = this.viewModelMapperService.map(this.match);
    }
  }
}
