import {FieldTree, ReadonlyFieldTree, TreeValidationResult} from '@angular/forms/signals';

/**
 * Represents a form submission error targeted at a specific form field.
 *
 * @typeParam TFormErrorTarget - Type describing the valid form error targets.
 */
export interface FormSubmitError<TFormErrorTarget extends string> {
  target: TFormErrorTarget;
  message: string;
}

/**
 * Represents a form submission action that returns form submission errors.
 *
 * @typeParam TFormModel - Type of the submitted form model.
 * @typeParam TFormErrorTarget - Type describing the valid form error targets.
 */
export type FormSubmitAction<TFormModel, TFormErrorTarget extends string> =
  (value: TFormModel) => Promise<FormSubmitError<TFormErrorTarget>[]>;

/**
 * Maps form submission errors to Signal Forms validation results.
 *
 * Each error target is resolved to its corresponding field tree. When no
 * specific field tree is resolved, the error is applied at the form root.
 *
 * @typeParam TFormModel - Type of the form model.
 * @typeParam TFormErrorTarget - Type describing the valid form error targets.
 * @param fieldTree - Root field tree of the submitted form.
 * @param errors - Form submission errors to map.
 * @param resolveTarget - Resolves an error target to its corresponding field tree.
 * @returns Signal Forms validation results for the submission errors.
 */
export function mapFormSubmitErrors<TFormModel, TFormErrorTarget extends string>(
  fieldTree: FieldTree<TFormModel>,
  errors: FormSubmitError<TFormErrorTarget>[],
  resolveTarget: (
    fieldTree: FieldTree<TFormModel>,
    target: TFormErrorTarget
  ) => ReadonlyFieldTree<unknown> | undefined
): TreeValidationResult {
  return errors.map(error => {
    const targetFieldTree = resolveTarget(fieldTree, error.target);

    return {
      ...(targetFieldTree !== undefined && {fieldTree: targetFieldTree}),
      kind: 'server',
      message: error.message,
    };
  });
}
