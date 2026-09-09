import {Signal, signal, WritableSignal} from '@angular/core';
import {FieldTree, form, FormOptions, Schema, TreeValidationResult} from '@angular/forms/signals';
import {FormErrorTargetResolver, FormSubmitAction, mapToTreeValidationResult} from './form-submit';

/**
 * Configuration for creating a submitting Signal Form.
 *
 * @typeParam TFormModel - Type of the submitted form model.
 * @typeParam TFormErrorTarget - Type describing the valid form error targets.
 */
export interface SubmittingFormOptions<TFormModel, TFormErrorTarget extends string> {
  createInitialModel: () => TFormModel;
  schema: Schema<TFormModel>;
  submitAction: Signal<FormSubmitAction<TFormModel, TFormErrorTarget>>;
  formErrorTargetResolver: FormErrorTargetResolver<TFormModel, TFormErrorTarget>;
}

/**
 * Represents a configured submitting Signal Form.
 *
 * @typeParam TFormModel - Type of the form model.
 */
export interface SubmittingForm<TFormModel> {
  readonly formModel: WritableSignal<TFormModel>;
  readonly form: FieldTree<TFormModel>;

  reset(): void;
}

/**
 * Creates a Signal Form configured with shared submission-error handling.
 *
 * @typeParam TFormModel - Type of the submitted form model.
 * @typeParam TFormErrorTarget - Type describing the valid form error targets.
 * @param options - Configuration for the submitting form.
 * @returns The form model signal and configured Signal Form field tree.
 */
export function createSubmittingForm<TFormModel, TFormErrorTarget extends string>(
  options: SubmittingFormOptions<TFormModel, TFormErrorTarget>
): SubmittingForm<TFormModel> {
  const formModel = signal<TFormModel>(options.createInitialModel());
  const formFieldTree = form(formModel, options.schema, createFormOptions(options));

  return {
    formModel: formModel,
    form: formFieldTree,
    reset: () => {
      formModel.set(options.createInitialModel());
      formFieldTree().reset();
    }
  };
}

/**
 * Creates the Signal Forms options for a submitting form.
 *
 * @typeParam TFormModel - Type of the submitted form model.
 * @typeParam TFormErrorTarget - Type describing the valid form error targets.
 * @param options - Configuration for the submitting form.
 * @returns Form options containing the submission action.
 */
function createFormOptions<TFormModel, TFormErrorTarget extends string>(
  options: SubmittingFormOptions<TFormModel, TFormErrorTarget>
): FormOptions<TFormModel> {
  return {
    submission: {
      action: fieldTree => submit(fieldTree, options),
    },
  };
}

/**
 * Submits the current form model and maps returned submission errors to a Signal Forms validation result.
 *
 * @typeParam TFormModel - Type of the submitted form model.
 * @typeParam TFormErrorTarget - Type describing the valid form error targets.
 * @param fieldTree - Root field tree of the form.
 * @param options - Configuration containing the submit action and form error target resolver.
 * @returns Signal Forms validation result for the submission.
 */
async function submit<TFormModel, TFormErrorTarget extends string>(
  fieldTree: FieldTree<TFormModel>,
  options: SubmittingFormOptions<TFormModel, TFormErrorTarget>
): Promise<TreeValidationResult> {
  const submitErrors = await options.submitAction()(fieldTree().value());

  return mapToTreeValidationResult(submitErrors, fieldTree, options.formErrorTargetResolver);
}
