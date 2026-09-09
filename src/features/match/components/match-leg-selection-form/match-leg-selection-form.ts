import {Component, effect, input, output, signal} from '@angular/core';
import {form, FormField} from '@angular/forms/signals';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatOptgroup, MatOption, MatSelect, MatSelectChange} from '@angular/material/select';
import {X01Match} from '../../../../data/model/x01/match/x01-match';
import {LegSelection} from '../match-board/leg-selection';
import * as MatchLegSelectionFormModel from './match-leg-selection-form.model';
import {MATCH_LEG_SELECTION_FORM_SCHEMA} from './match-leg-selection-form.schema';

@Component({
  selector: 'app-match-leg-selection-form',
  templateUrl: './match-leg-selection-form.html',
  styleUrl: './match-leg-selection-form.scss',
  imports: [
    FormField,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOptgroup,
    MatOption
  ]
})
export class MatchLegSelectionForm {
  readonly match = input.required<X01Match>();
  readonly legSelection = input.required<LegSelection>();

  readonly legSelectionChange = output<LegSelection>();

  private readonly formModel = signal<MatchLegSelectionFormModel.FormModel>(
    MatchLegSelectionFormModel.createInitialFormModel()
  );

  protected readonly legSelectionForm = form(
    this.formModel,
    MATCH_LEG_SELECTION_FORM_SCHEMA
  );

  constructor() {
    this.registerLegSelectionEffect();
  }

  /**
   * Compares two leg selections by their set and leg numbers.
   *
   * @param option - Option leg selection.
   * @param selection - Current leg selection.
   * @returns Whether both selections represent the same leg.
   */
  protected compareLegSelection(option: LegSelection | null, selection: LegSelection | null): boolean {
    return option?.setEntry.setNumber === selection?.setEntry.setNumber &&
      option?.legEntry.legNumber === selection?.legEntry.legNumber;
  }

  /**
   * Emits the selected leg.
   *
   * @param event - Material select change event containing the selected leg.
   */
  protected onLegSelectionChange(event: MatSelectChange): void {
    this.legSelectionChange.emit(event.value as LegSelection);
  }

  /**
   * Registers the effect that keeps the form selection synchronized with the input selection.
   */
  private registerLegSelectionEffect(): void {
    effect(() => {
      this.formModel.set(
        MatchLegSelectionFormModel.createInitialFormModel(this.legSelection())
      );
    });
  }
}
