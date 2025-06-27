import {
  Component,
  ElementRef,
  EventEmitter, inject,
  Input,
  OnChanges,
  Output,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren
} from '@angular/core';
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
  @ViewChild('tableContainer', {static: false}) tableContainer!: ElementRef<HTMLDivElement>;
  @ViewChildren('tableRows', {read: ElementRef}) rows!: QueryList<ElementRef<HTMLTableRowElement>>;
  @Input() match: X01Match | null = null;
  @Input() legSelection: LegSelection | null = null;
  @Input() editMode: boolean = false;
  @Output() editModeChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() submitScoreEdit: EventEmitter<X01EditScoreDialogResult> = new EventEmitter<X01EditScoreDialogResult>();
  viewData: X01MatchLegTableViewData | null = null;

  private viewDataTransformer = inject(X01MatchLegTableViewDataTransformer);
  private dialogService = inject(DialogService);

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
      this.scrollToRoundInPlay(this.match, this.legSelection);
    }
  }

  /**
   * Updates the match table data sources' dataset to reflect a new leg selection.
   */
  updateTableDataSource() {
    if (!this.viewData) return;

    const selectedSet = this.legSelection?.setEntry.setNumber ?? 0;
    const selectedLeg = this.legSelection?.legEntry.legNumber ?? 0;

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
      set: this.legSelection.setEntry.setNumber,
      leg: this.legSelection.legEntry.legNumber,
      playerName: this.match.players.find(player => player.playerId === playerId)?.playerName ?? '',
      round: rowData.round,
      playerId: playerId,
      currentScore: rowData.players[playerId]?.score ?? 0,
      doublesMissed: rowData.players[playerId]?.doublesMissed ?? null
    };

    this.openEditScoreDialog(dialogData);
  }

  /**
   * Scrolls the table container to the appropriate round depending on whether the currently selected leg
   * is the one in progress. If it is, scrolls to the last round. Otherwise, scrolls to round 1.
   *
   * @param match - The current match object.
   * @param legSelection - The currently selected leg.
   */
  private scrollToRoundInPlay(match: X01Match | null, legSelection: LegSelection | null) {
    if (!match || !legSelection) return;

    if (this.isCurrentLegSelected(match, legSelection)) {
      // Get the last round of the current leg
      const roundToScrollTo = legSelection.legEntry.leg.rounds.at(-1);
      this.scrollToRound(roundToScrollTo?.roundNumber ?? null, true);
    } else {
      // Scroll to round 1 if the selected leg isn't the current one
      this.scrollToRound(1, false);
    }
  }

  /**
   * Checks whether the currently selected leg matches the leg in progress in the match.
   *
   * @param match - The match object to check against.
   * @param legSelection - The leg selection to verify.
   * @returns True if the selected leg is the one currently in play; false otherwise.
   */
  private isCurrentLegSelected(match: X01Match | null, legSelection: LegSelection | null): boolean {
    if (!match || !legSelection) return false;

    return match.matchProgress.currentSet == legSelection.setEntry.setNumber &&
      match.matchProgress.currentLeg == legSelection.legEntry.legNumber &&
      match.matchProgress.currentRound != null;
  }

  /**
   * Scrolls the leg table container to a specified round.
   *
   * @param roundNumber - The round number to scroll to.
   * @param smooth - Whether the scroll behavior should be smooth or instant.
   */
  private scrollToRound(roundNumber: number | null, smooth: boolean) {
    if (roundNumber == null) return;

    // Delay scrolling to ensure the DOM has rendered the rows
    setTimeout(() => {
      if (!this.rows || !this.tableContainer) return;

      // Get the target row matching the round number. Fallback to the last row.
      const rowIndex = roundNumber - 1;
      const targetRow = this.rows.get(rowIndex) ?? this.rows.get(this.rows.length - 1);
      const container = this.tableContainer.nativeElement;

      if (targetRow && container) {
        // Determine the row's offset from the top, then subtract the sticky header's height.
        const stickyHeaderHeight = 56;
        const offsetTop = targetRow.nativeElement.offsetTop - stickyHeaderHeight;

        container.scrollTo({
          top: Math.max(0, offsetTop),
          behavior: smooth ? 'smooth' : 'instant'
        });
      }
    }, 0);
  }

  /**
   * Opens the edit score dialog with the provided dialog data.
   * Subscribes to the dialog close event to emit the score edit result.
   *
   * @param dialogData The data used to initialize the edit score dialog.
   */
  private openEditScoreDialog(dialogData: X01EditScoreDialogData) {
    const dialogRef = this.dialogService.openX01EditScoreDialog(dialogData);
    if (dialogRef) {
      const sub = dialogRef.afterClosed().subscribe(result => {
        if (!result) return;
        this.submitScoreEdit.emit(result);
      });
      this.subscription.add(sub);
    }
  }

  /**
   * Updates the full view data (columns, tables, and initial leg data).
   */
  private updateViewData() {
    this.viewData = this.viewDataTransformer.transform(this.match, this.legSelection);
  }

}
