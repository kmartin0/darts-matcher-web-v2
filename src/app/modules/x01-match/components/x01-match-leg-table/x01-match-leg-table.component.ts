import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {X01Match} from '../../../../models/x01-match/x01-match';
import {KeyValuePipe, NgIf} from '@angular/common';
import {
  MatCell,
  MatCellDef, MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef,
  MatRow, MatRowDef,
  MatTable
} from '@angular/material/table';
import {
  X01MatchLegTableViewDataTransformer
} from './view-data-transformer/x01-match-leg-table-view-data-transformer';
import {X01MatchLegTableViewData} from './view-data-transformer/x01-match-leg-table-view-data';
import {LegSelection} from '../../../../models/common/leg-selection';

@Component({
  selector: 'app-x01-match-leg-table',
  imports: [
    NgIf,
    MatHeaderCellDef,
    MatHeaderCell,
    MatTable,
    MatCell,
    MatCellDef,
    MatHeaderRow,
    MatRow,
    MatRowDef,
    MatHeaderRowDef,
    MatColumnDef,
    KeyValuePipe
  ],
  standalone: true,
  templateUrl: './x01-match-leg-table.component.html',
  styleUrl: './x01-match-leg-table.component.scss'
})
export class X01MatchLegTableComponent implements OnChanges {
  @Input() match: X01Match | null = null;
  @Input() legSelection: LegSelection | null = null;
  viewData: X01MatchLegTableViewData | null = null;

  constructor(private viewDataTransformer: X01MatchLegTableViewDataTransformer) {
  }

  /**
   * Lifecycle hook triggered when @Input properties change.
   * Updates view data or just the table data source depending on which input changed.
   *
   * @param changes The set of changed inputs.
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes['match']) {
      this.updateViewData();
    }
    if (changes['legSelection']) {
      this.updateTableDataSource();
    }
  }

  /**
   * Updates the full view data (columns, tables, and initial leg data).
   */
  private updateViewData() {
    this.viewData = this.viewDataTransformer.createLegTableViewData(this.match, this.legSelection);
  }

  /**
   * Updates the match table data sources' dataset to reflect a new leg selection.
   */
  updateTableDataSource() {
    if (!this.viewData) return;

    const selectedSet = this.legSelection?.set ?? 0;
    const selectedLeg = this.legSelection?.leg ?? 0;

    const tables = this.viewData?.tables;
    const legTable = this.viewDataTransformer.getSelectedLegTable(tables, selectedSet, selectedLeg);
    this.viewData.matchTableDataSource.setData(legTable);
  }
}
