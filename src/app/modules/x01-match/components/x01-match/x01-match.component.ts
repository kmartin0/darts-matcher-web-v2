import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {X01Match} from '../../../../models/x01-match/x01-match';
import {JsonPipe, KeyValuePipe, NgIf} from '@angular/common';
import {MatCard} from '@angular/material/card';
import {MatOptgroup, MatOption, MatSelect} from '@angular/material/select';
import {MatFormField} from '@angular/material/input';
import {MatLabel} from '@angular/material/form-field';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {Subscription} from 'rxjs';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef, MatHeaderRow,
  MatHeaderRowDef, MatRow,
  MatRowDef,
  MatTable
} from '@angular/material/table';
import {X01MatchViewDataTransformer} from './x01-match-view-data-transformer';
import {X01MatchViewData} from './models/x01-match-view-data';

interface SelectLegFormControl {
  set: number,
  leg: number
}

@Component({
  selector: 'app-x01-match',
  imports: [
    MatCard,
    MatFormField,
    MatSelect,
    MatLabel,
    MatOption,
    MatOptgroup,
    MatIconButton,
    MatIcon,
    MatButton,
    KeyValuePipe,
    ReactiveFormsModule,
    JsonPipe,
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatHeaderRowDef,
    MatRowDef,
    MatCellDef,
    MatRow,
    MatHeaderRow,
    MatCell,
    NgIf
  ],
  standalone: true,
  templateUrl: './x01-match.component.html',
  styleUrl: './x01-match.component.scss'
})
export class X01MatchComponent implements OnInit, OnChanges, OnDestroy {
  @Input() match: X01Match | null | undefined = null;
  private subscriptions = new Subscription();
  readonly selectedLegControl = new FormControl<SelectLegFormControl>({set: 0, leg: 0});
  matchViewData: X01MatchViewData | null = null;

  constructor(private viewDataTransformer: X01MatchViewDataTransformer) {
  }

  /**
   * On init sets up subscription to react to changes in selectedLegControl.
   */
  ngOnInit() {
    this.initSelectedLegChange();
  }

  /**
   * Watches for changes to `match` input to update view data and selected leg.
   * @param changes - Object containing changes to input properties
   */
  async ngOnChanges(changes: SimpleChanges) {
    if (changes['match']) {
      await this.updateMatchViewData();
      this.selectCurrentOrLastLeg();
    }
  }

  /**
   * Cleans up all subscriptions to avoid memory leaks.
   */
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  /**
   * Updates `matchViewData` by transforming the current `match` into a structure that the template can use to display
   * all data fields without having to perform any additional calculations or transformations during rendering.
   */
  private async updateMatchViewData() {
    this.matchViewData = await this.viewDataTransformer.createX01MatchViewData(this.match);
  }

  /**
   * Sets up a subscription to the `selectedLegControl` FormControl value changes.
   * When the selection changes, updates the match table data source with rounds of the selected leg.
   */
  initSelectedLegChange() {
    this.subscriptions.add(this.selectedLegControl.valueChanges.subscribe(selection => {
        const selectedSet = selection?.set;
        const selectedLeg = selection?.leg;
        if (this.matchViewData && selectedSet && selectedLeg) {
          const legTable = this.matchViewData.sets[selectedSet]?.legs?.[selectedLeg]?.rounds ?? [];
          this.matchViewData.matchTableDataSource.setData(legTable);
        }
      })
    );
  }

  /**
   * Selects the current leg in play if available; otherwise selects the last leg in the match.
   * Sets the selected leg control to update the dropdown and table accordingly.
   */
  selectCurrentOrLastLeg() {
    let selection: SelectLegFormControl = {set: 0, leg: 0};
    if (this.match) {
      const setAndLegInPlay = this.getSetAndLegInPlay(this.match);
      if (setAndLegInPlay) { // Set the selection the current set and leg in play.
        selection = setAndLegInPlay;
      } else { // If no set or leg is in play. Get the last leg.
        const lastSet = this.match.sets.at(-1);
        const lastLeg = lastSet?.legs.at(-1);

        if (lastSet && lastLeg) {
          selection = {set: lastSet.set, leg: lastLeg.leg};
        }
      }
    }

    this.selectedLegControl.setValue(selection);
  }

  /**
   * Retrieves the set and leg currently in play based on the match progress.
   *
   * @param match - The current X01Match object
   * @returns The current set and leg numbers, or undefined if none in play
   */
  getSetAndLegInPlay(match: X01Match): SelectLegFormControl | undefined {
    const matchProgress = match.matchProgress;
    const setInPlay = match.sets.find(set => set.set === matchProgress.currentSet);
    const legInPlay = setInPlay?.legs.find(leg => leg.leg === matchProgress.currentLeg);

    if (!setInPlay || !legInPlay) return undefined;

    return {set: setInPlay.set, leg: legInPlay.leg};
  }

  /**
   * Compares two leg selection objects for equality.
   * Used by Angular Material select to correctly match selected option.
   *
   * @param option - Option leg selection object
   * @param selection - Currently selected leg selection object
   * @returns True if both selections have the same set and leg numbers, false otherwise
   */
  compareLegSelection(option: { set: number; leg: number }, selection: { set: number; leg: number }): boolean {
    return option?.set === selection?.set && option?.leg === selection?.leg;
  }

}
