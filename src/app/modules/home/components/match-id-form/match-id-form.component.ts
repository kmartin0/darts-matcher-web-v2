import {Component, inject} from '@angular/core';
import {BaseFormComponent} from '../../../../shared/components/base-form/base-form.component';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CustomValidators} from '../../../../shared/validators/custom-validators';
import {FormErrorComponent} from '../../../../shared/components/form-error/form-error.component';
import {MatFormField, MatInput, MatLabel, MatSuffix} from '@angular/material/input';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {ApiErrorBody} from '../../../../api/error/api-error-body';
import {ApiErrorEnum} from '../../../../api/error/api-error-enum';
import {ERROR_DETAIL_KEYS} from '../../../../api/error/error-detail-keys';

export interface MatchIdForm {
  matchId: FormControl<string>;
}

@Component({
  selector: 'app-match-id-form',
  imports: [
    ReactiveFormsModule,
    FormErrorComponent,
    MatFormField,
    MatInput,
    MatLabel,
    MatFormField,
    MatIconButton,
    MatIcon,
    MatSuffix,
    MatTooltip
  ],
  standalone: true,
  templateUrl: './match-id-form.component.html',
  styleUrl: './match-id-form.component.scss'
})
export class MatchIdFormComponent extends BaseFormComponent<string> {
  private fb = inject(FormBuilder);
  private readonly _form: FormGroup<MatchIdForm>;

  constructor() {
    super();

    this._form = this.fb.nonNullable.group({
        matchId: ['', [Validators.required, CustomValidators.validObjectId]]
      }
    );
  }

  override get form(): FormGroup<MatchIdForm> {
    return this._form;
  }

  override handleApiError(apiError?: ApiErrorBody) {
    super.handleApiError(apiError);

    if (apiError?.error === ApiErrorEnum.RESOURCE_NOT_FOUND) {
      this.setError(this.form.controls.matchId, apiError.details?.[ERROR_DETAIL_KEYS.X01_MATCH] ?? 'Match ID not found.');
    }
  }

  protected override createFormResult(): string {
    return this.form.getRawValue().matchId;
  }
}
