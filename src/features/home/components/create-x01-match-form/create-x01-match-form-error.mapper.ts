import {FieldTree, ReadonlyFieldTree} from '@angular/forms/signals';
import * as CreateX01MatchFormModel from './create-x01-match-form.model';

/**
 * Maps a form error target to its corresponding Signal Forms field tree.
 *
 * @param fieldTree - Root field tree of the create X01 match form.
 * @param target - Form error target to map.
 * @returns The matching field tree, or undefined for root-level errors or invalid targets.
 */
export function mapErrorTargetToFieldTree(
  fieldTree: FieldTree<CreateX01MatchFormModel.FormModel>,
  target: CreateX01MatchFormModel.FormErrorTarget
): ReadonlyFieldTree<unknown> | undefined {
  if (isPlayerErrorTarget(target)) {
    return mapPlayerErrorTargetToFieldTree(fieldTree, target);
  }

  return mapStaticErrorTargetToFieldTree(fieldTree, target);
}

/**
 * Maps a static form error target to its corresponding field tree.
 *
 * @param fieldTree - Root field tree of the create X01 match form.
 * @param target - Static form error target to map.
 * @returns The matching field tree, or undefined for a root-level error.
 */
function mapStaticErrorTargetToFieldTree(
  fieldTree: FieldTree<CreateX01MatchFormModel.FormModel>,
  target: CreateX01MatchFormModel.StaticFormErrorTarget
): ReadonlyFieldTree<unknown> | undefined {
  switch (target) {
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
 * Maps an indexed player error target to its corresponding field tree.
 *
 * @param fieldTree - Root field tree of the create X01 match form.
 * @param target - Player error target to map.
 * @returns The matching player field tree, or undefined if the player index or field is invalid.
 */
function mapPlayerErrorTargetToFieldTree(
  fieldTree: FieldTree<CreateX01MatchFormModel.FormModel>,
  target: CreateX01MatchFormModel.PlayerFormErrorTarget
): ReadonlyFieldTree<unknown> | undefined {
  const segments = target.split('.');
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
 * @param target - Form error target to check.
 * @returns True when the target is a player error target.
 */
function isPlayerErrorTarget(
  target: CreateX01MatchFormModel.FormErrorTarget
): target is CreateX01MatchFormModel.PlayerFormErrorTarget {
  return target.startsWith('players.');
}
