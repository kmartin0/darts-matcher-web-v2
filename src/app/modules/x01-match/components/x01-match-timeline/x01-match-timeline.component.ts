import {Component, inject, Input, OnChanges, SimpleChanges} from '@angular/core';
import {BaseComponent} from '../../../../shared/components/base/base.component';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable
} from '@angular/material/table';
import {MatCard, MatCardContent} from '@angular/material/card';
import {X01Match} from '../../../../models/x01-match/x01-match';
import {DecimalPipe} from '@angular/common';
import {X01MatchTimelineViewModel} from './x01-match-timeline-view-model';
import {X01MatchTimelineViewModelMapper} from './x01-match-timeline-view-model-mapper';
import {X01BestOfType} from '../../../../models/x01-match/x01-best-of-type';
import {MatIcon} from '@angular/material/icon';
import {MatDivider} from '@angular/material/divider';

@Component({
  selector: 'app-x01-match-timeline',
  imports: [
    MatCard,
    MatCardContent,
    MatTable,
    MatHeaderCellDef,
    MatCellDef,
    MatHeaderRowDef,
    MatRowDef,
    MatHeaderCell,
    MatColumnDef,
    MatCell,
    MatHeaderRow,
    MatRow,
    DecimalPipe,
    MatIcon
  ],
  standalone: true,
  templateUrl: './x01-match-timeline.component.html',
  styleUrl: './x01-match-timeline.component.scss'
})
export class X01MatchTimelineComponent extends BaseComponent implements OnChanges {
  @Input() match: X01Match | null = null;

  viewModelMapper: X01MatchTimelineViewModelMapper = inject(X01MatchTimelineViewModelMapper);
  viewModel: X01MatchTimelineViewModel | null = null;
  displayedColumns: string[] = [];

  protected readonly X01BestOfType = X01BestOfType;

  constructor() {
    super();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['match']) {
      this.viewModel = this.viewModelMapper.mapToViewModel(this.match);
      this.displayedColumns = ['initials', 'score', 'darts', 'avg', 'left', ...this.viewModel?.trackDoubles ? ['checkout'] : []];
    }
  }
}
