import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {X01Match} from '../../../../models/x01-match/x01-match';
import {KeyValuePipe, NgIf} from '@angular/common';
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
import {X01MatchLegTableViewDataTransformer} from './view-data-transformer/x01-match-leg-table-view-data-transformer';
import {X01MatchLegTableViewData} from './view-data-transformer/x01-match-leg-table-view-data';
import {LegSelection} from '../../../../models/common/leg-selection';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {DialogService} from '../../../../shared/services/dialog-service/dialog.service';
import {
  X01EditScoreDialogData,
  X01EditScoreDialogResult
} from '../../../../shared/components/x01-edit-score-dialog/x01-edit-score-dialog.types';
import {X01LegTableRow} from './x01-leg-table-data-source';
import {BaseComponent} from '../../../../shared/components/base/base.component';

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
    KeyValuePipe,
    MatIconButton,
    MatIcon
  ],
  standalone: true,
  templateUrl: './x01-match-leg-table.component.html',
  styleUrl: './x01-match-leg-table.component.scss'
})
export class X01MatchLegTableComponent extends BaseComponent implements OnChanges {
  @Input() match: X01Match | null = null;
  @Input() legSelection: LegSelection | null = null;
  @Input() editMode: boolean = false;
  @Output() editModeChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() submitScoreEdit: EventEmitter<X01EditScoreDialogResult> = new EventEmitter<X01EditScoreDialogResult>();
  viewData: X01MatchLegTableViewData | null = null;

  constructor(private viewDataTransformer: X01MatchLegTableViewDataTransformer, private dialogService: DialogService) {
    super();
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

  /**
   * Handles the click event to edit a player's score.
   * Prepares the dialog data and opens the edit score dialog.
   *
   * @param playerId The ID of the player whose score is to be edited.
   * @param rowData The data for the current round including scores for all players.
   */
  onEditScoreClick(playerId: string, rowData: X01LegTableRow) {
    if (!this.legSelection || !this.match) return;

    const dialogData: X01EditScoreDialogData = {
      matchId: this.match.id,
      set: this.legSelection.set,
      leg: this.legSelection.leg,
      playerName: this.match.players.find(player => player.playerId === playerId)?.playerName ?? '',
      round: rowData.round,
      playerId: playerId,
      currentScore: rowData.players[playerId]?.score ?? 0
    };

    this.openEditScoreDialog(dialogData);
  }

  /**
   * Opens the edit score dialog with the provided dialog data.
   * Subscribes to the dialog close event to emit the score edit result.
   *
   * @param dialogData The data used to initialize the edit score dialog.
   */
  private openEditScoreDialog(dialogData: X01EditScoreDialogData) {
    const dialogRef = this.dialogService.openX01EditScoreDialog(dialogData);
    const sub = dialogRef.afterClosed().subscribe((result: X01EditScoreDialogResult | null | undefined) => {
      if (result === null || result === undefined) return;
      this.submitScoreEdit.emit(result);
    });
    this.subscription.add(sub);
  }

  /**
   * Updates the full view data (columns, tables, and initial leg data).
   */
  private updateViewData() {
    this.viewData = this.viewDataTransformer.createLegTableViewData(this.match, this.legSelection);
  }

}
