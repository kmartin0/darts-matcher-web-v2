import {Component, input} from '@angular/core';
import {FormField, FormRoot} from '@angular/forms/signals';
import {MatIconButton} from '@angular/material/button';
import {MatFormField, MatInput, MatLabel, MatSuffix} from '@angular/material/input';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {FormError} from '../../../../shared/components/form-error/form-error';
import {createSubmittingForm} from '../../../../shared/forms/submitting-form.factory';
import * as MatchIdFormErrorResolver from './match-id-form-error.resolver';
import * as MatchIdFormModel from './match-id-form.model';
import {MATCH_ID_FORM_SCHEMA} from './match-id-form.schema';

@Component({
  selector: 'app-match-id-form',
  imports: [
    FormRoot,
    MatFormField,
    MatLabel,
    MatInput,
    MatSuffix,
    FormField,
    MatIconButton,
    MatTooltip,
    MatIcon,
    FormError
  ],
  templateUrl: './match-id-form.html',
  styleUrl: './match-id-form.scss',
})
export class MatchIdForm {
  readonly submitAction = input.required<MatchIdFormModel.SubmitAction>();

  private readonly submittingForm = createSubmittingForm({
    createInitialModel: MatchIdFormModel.createInitialFormModel,
    schema: MATCH_ID_FORM_SCHEMA,
    submitAction: this.submitAction,
    formErrorTargetResolver: MatchIdFormErrorResolver.resolveTargetFieldTree,
  });

  protected readonly matchIdForm = this.submittingForm.form;
}
