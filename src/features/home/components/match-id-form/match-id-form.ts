import {Component, input} from '@angular/core';
import * as MatchIdFormModel from './match-id-form.model';
import * as MatchIdFormErrorResolver from './match-id-form-error.resolver';
import {matchIdFormSchema} from './match-id-form.schema';
import {createSubmittingForm} from '../../../../shared/forms/submitting-form.factory';
import {FormField, FormRoot} from '@angular/forms/signals';
import {MatFormField, MatInput, MatLabel, MatSuffix} from '@angular/material/input';
import {MatIconButton} from '@angular/material/button';
import {MatTooltip} from '@angular/material/tooltip';
import {MatIcon} from '@angular/material/icon';
import {FormError} from '../../../../shared/components/form-error/form-error';

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
    schema: matchIdFormSchema,
    submitAction: this.submitAction,
    formErrorTargetResolver: MatchIdFormErrorResolver.resolveTargetFieldTree,
  });

  readonly matchIdForm = this.submittingForm.form;
}
