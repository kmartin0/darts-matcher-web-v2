import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {MatFormField} from '@angular/material/input';
import {MatOptgroup, MatOption, MatSelect} from '@angular/material/select';
import {MatLabel} from '@angular/material/form-field';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {LegSelection} from '../../../../models/common/leg-selection';
import {X01Match} from '../../../../models/x01-match/x01-match';
import {NgIf} from '@angular/common';
import {BaseComponent} from '../../../../shared/components/base/base.component';
import {X01LegEntry} from '../../../../models/x01-match/x01-leg-entry';

@Component({
  selector: 'app-select-leg-form',
  imports: [
    MatFormField,
    MatLabel,
    MatSelect,
    MatOptgroup,
    MatOption,
    ReactiveFormsModule,
    NgIf
  ],
  standalone: true,
  templateUrl: './select-leg-form.component.html',
  styleUrl: './select-leg-form.component.scss'
})
export class SelectLegFormComponent extends BaseComponent implements OnInit, OnChanges {
  readonly legSelectionControl = new FormControl<LegSelection | null>(null);

  @Input() match: X01Match | null = null;
  @Input() legSelection: LegSelection | null = null;
  @Output() legSelectionChange: EventEmitter<LegSelection | null> = new EventEmitter<LegSelection | null>();

  /**
   * Lifecycle hook that is called after the component's view has been initialized.
   * Initializes the selected leg FormControl and its value change handling.
   */
  ngOnInit(): void {
    this.initLegSelectionControl();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['legSelection']) {
      this.legSelectionControl.setValue(this.legSelection, {emitEvent: false});
      console.log(this.legSelection);
    }
  }

  /**
   * Compares two leg selection objects for equality.
   * Used by Angular Material select to correctly match selected option.
   *
   * @param option - Option leg selection object
   * @param selection - Currently selected leg selection object
   * @returns True if both selections have the same set and leg numbers, false otherwise
   */
  compareLegSelection(option: LegSelection, selection: LegSelection): boolean {
    return option?.setEntry.setNumber === selection?.setEntry.setNumber &&
      option?.legEntry.legNumber === selection?.legEntry.legNumber;
  }

  /**
   * Initializes the FormControl for selected leg and sets up value change handling.
   */
  private initLegSelectionControl(): void {
    this.legSelectionControl.setValue(this.legSelection, {emitEvent: false});

    const sub = this.legSelectionControl.valueChanges.subscribe(value => {
      this.legSelection = value;
      this.legSelectionChange.emit(value);
    });
    this.subscription.add(sub);
  }

}
