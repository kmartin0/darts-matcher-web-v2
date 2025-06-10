import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {MatFormField} from '@angular/material/input';
import {MatOptgroup, MatOption, MatSelect} from '@angular/material/select';
import {MatLabel} from '@angular/material/form-field';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {LegSelection} from '../../../../models/common/leg-selection';
import {Subscription} from 'rxjs';
import {X01Match} from '../../../../models/x01-match/x01-match';
import {NgIf} from '@angular/common';

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
export class SelectLegFormComponent implements OnInit, OnChanges, OnDestroy {
  readonly selectedLegControl = new FormControl<LegSelection>({set: 0, leg: 0});

  private subscription = new Subscription();

  @Input() match: X01Match | null = null;
  @Input() selectedLeg: LegSelection = {set: 0, leg: 0};
  @Output() selectedLegChange = new EventEmitter<LegSelection>();

  /**
   * Lifecycle hook that is called after the component's view has been initialized.
   * Initializes the selected leg FormControl and its value change handling.
   */
  ngOnInit(): void {
    this.initSelectedLegControl();
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes['selectedLeg']) {
      this.selectedLegControl.setValue(this.selectedLeg, {emitEvent: false});
    }
  }

  /**
   * Lifecycle hook that is called just before the component's view has been destroyed.
   * Used to clean up subscriptions and avoid memory leaks.
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
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

  /**
   * Initializes the FormControl for selected leg and sets up value change handling.
   */
  private initSelectedLegControl(): void {
    this.selectedLegControl.setValue(this.selectedLeg, {emitEvent: false});

    this.subscription.add(
      this.selectedLegControl.valueChanges.subscribe(value => {
        if (value) {
          this.selectedLeg = value;
          this.selectedLegChange.emit(value);
        }
      })
    );
  }

}
