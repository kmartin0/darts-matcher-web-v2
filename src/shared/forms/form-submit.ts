import {FieldTree, ReadonlyFieldTree, TreeValidationResult} from '@angular/forms/signals';

/**
 * Represents a form submission error targeted at a specific form field.
 *
 * @typeParam ErrorTargetType - Type describing the valid form error targets.
 */
export interface FormSubmitError<ErrorTargetType extends string> {
  target: ErrorTargetType;
  message: string;
}

/**
 * Represents a form submission action that returns form submission errors.
 *
 * @typeParam FormModelType - Type of the submitted form model.
 * @typeParam ErrorTargetType - Type describing the valid form error targets.
 */
export type FormSubmitAction<FormModelType, ErrorTargetType extends string> =
  (value: FormModelType) => Promise<FormSubmitError<ErrorTargetType>[]>;

/**
 * Maps form submission errors to Signal Forms validation results.
 *
 * Each error target is resolved to its corresponding field tree. When no
 * specific field tree is resolved, the error is applied at the form root.
 *
 * @typeParam FormModelType - Type of the form model.
 * @typeParam ErrorTargetType - Type describing the valid form error targets.
 * @param fieldTree - Root field tree of the submitted form.
 * @param errors - Form submission errors to map.
 * @param resolveTarget - Resolves an error target to its corresponding field tree.
 * @returns Signal Forms validation results for the submission errors.
 */
export function mapFormSubmitErrors<FormModelType, ErrorTargetType extends string>(
  fieldTree: FieldTree<FormModelType>,
  errors: FormSubmitError<ErrorTargetType>[],
  resolveTarget: (fieldTree: FieldTree<FormModelType>, target: ErrorTargetType) => ReadonlyFieldTree<unknown> | undefined
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
