import {FieldTree, ReadonlyFieldTree} from '@angular/forms/signals';
import * as MatchIdFormModel from './match-id-form.model';

/**
 * Resolves a form error target to its corresponding Signal Forms field tree.
 *
 * @param formErrorTarget - Form error target to resolve.
 * @param fieldTree - Root field tree of the match ID form.
 * @returns The matching field tree.
 */
export function resolveTargetFieldTree(
  formErrorTarget: MatchIdFormModel.FormErrorTarget,
  fieldTree: FieldTree<MatchIdFormModel.FormModel>
): ReadonlyFieldTree<unknown> {
  switch (formErrorTarget) {
    case 'matchId':
      return fieldTree.matchId;
  }
}
