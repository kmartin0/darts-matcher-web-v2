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
 * Resolves a form error target to its corresponding Signal Forms field tree.
 *
 * @typeParam TFormModel - Type of the form model.
 * @typeParam TFormErrorTarget - Type describing the valid form error targets.
 */
export type FormErrorTargetResolver<TFormModel, TFormErrorTarget extends string> =
  (formErrorTarget: TFormErrorTarget, fieldTree: FieldTree<TFormModel>) => ReadonlyFieldTree<unknown> | undefined;

/**
 * Maps form submission errors to a Signal Forms validation result.
 *
 * Each form error target is resolved to its corresponding field tree. When no
 * specific field tree is resolved, the error is applied at the form root.
 *
 * @typeParam TFormModel - Type of the form model.
 * @typeParam TFormErrorTarget - Type describing the valid form error targets.
 * @param submitErrors - Form submission errors to map.
 * @param fieldTree - Root field tree of the submitted form.
 * @param formErrorTargetResolver - Resolves a form error target to its corresponding field tree.
 * @returns Signal Forms validation result for the submission errors.
 */
export function mapToTreeValidationResult<TFormModel, TFormErrorTarget extends string>(
  submitErrors: FormSubmitError<TFormErrorTarget>[],
  fieldTree: FieldTree<TFormModel>,
  formErrorTargetResolver: FormErrorTargetResolver<TFormModel, TFormErrorTarget>
): TreeValidationResult {
  return submitErrors.map(error => {
    const targetFieldTree = formErrorTargetResolver(error.target, fieldTree);

    return {
      ...(targetFieldTree !== undefined && {fieldTree: targetFieldTree}),
      kind: 'server',
      message: error.message,
    };
  });
}
