import {FieldTree, ReadonlyFieldTree} from '@angular/forms/signals';
import * as CreateX01MatchFormModel from './create-x01-match-form.model';

/**
 * Resolves a form error target to its corresponding Signal Forms field tree.
 *
 * @param formErrorTarget - Form error target to resolve.
 * @param fieldTree - Root field tree of the create X01 match form.
 * @returns The matching field tree, or undefined for root-level errors or invalid targets.
 */
export function resolveTargetFieldTree(
  formErrorTarget: CreateX01MatchFormModel.FormErrorTarget,
  fieldTree: FieldTree<CreateX01MatchFormModel.FormModel>
): ReadonlyFieldTree<unknown> | undefined {
  if (isPlayerErrorTarget(formErrorTarget)) {
    return resolvePlayerTargetFieldTree(formErrorTarget, fieldTree);
  }

  return resolveStaticTargetFieldTree(formErrorTarget, fieldTree);
}

/**
 * Resolves a static form error target to its corresponding field tree.
 *
 * @param formErrorTarget - Static form error target to resolve.
 * @param fieldTree - Root field tree of the create X01 match form.
 * @returns The matching field tree, or undefined for a root-level error.
 */
function resolveStaticTargetFieldTree(
  formErrorTarget: CreateX01MatchFormModel.StaticFormErrorTarget,
  fieldTree: FieldTree<CreateX01MatchFormModel.FormModel>
): ReadonlyFieldTree<unknown> | undefined {
  switch (formErrorTarget) {
    case 'root':
      return undefined;
    case 'x01':
      return fieldTree.x01;
    case 'bestOf.sets':
      return fieldTree.bestOf.sets;
    case 'bestOf.legs':
      return fieldTree.bestOf.legs;
    case 'clearByTwo.setLimit':
      return fieldTree.clearByTwo.setLimit;
    case 'clearByTwo.legLimit':
      return fieldTree.clearByTwo.legLimit;
    case 'clearByTwo.finalSetLegLimit':
      return fieldTree.clearByTwo.finalSetLegLimit;
    case 'players':
      return fieldTree.players;
  }
}

/**
 * Resolves an indexed player error target to its corresponding field tree.
 *
 * @param formErrorTarget - Player error target to resolve.
 * @param fieldTree - Root field tree of the create X01 match form.
 * @returns The matching player field tree, or undefined if the player index or field is invalid.
 */
function resolvePlayerTargetFieldTree(
  formErrorTarget: CreateX01MatchFormModel.PlayerFormErrorTarget,
  fieldTree: FieldTree<CreateX01MatchFormModel.FormModel>
): ReadonlyFieldTree<unknown> | undefined {
  const segments = formErrorTarget.split('.');
  const player = fieldTree.players[Number(segments[1])];

  if (!player) {
    return undefined;
  }

  switch (segments[2]) {
    case 'playerType':
      return player.playerType;
    case 'playerName':
      return player.playerName;
    case 'threeDartAverage':
      return player.threeDartAverage;
    default:
      return undefined;
  }
}

/**
 * Checks whether a form error target refers to an indexed player field.
 *
 * @param formErrorTarget - Form error target to check.
 * @returns True when the target is a player error target.
 */
function isPlayerErrorTarget(
  formErrorTarget: CreateX01MatchFormModel.FormErrorTarget
): formErrorTarget is CreateX01MatchFormModel.PlayerFormErrorTarget {
  return formErrorTarget.startsWith('players.');
}
