import {Dart} from '../../dartboard/dart';

export interface X01Checkout {
  checkout: number;
  minDarts: number;
  suggested: Dart[];
}

export type X01CheckoutsMap = ReadonlyMap<number, X01Checkout>;

export const MINIMUM_CHECKOUT = 2;
export const MAXIMUM_CHECKOUT = 170;

export const IMPOSSIBLE_CHECKOUTS: ReadonlySet<number> = new Set<number>([169, 168, 166, 165, 163, 162, 159]);

/**
 * Checks whether a checkout is possible for a remaining score.
 *
 * @param remaining - Remaining score to check.
 * @returns Whether the remaining score can be checked out.
 */
export function isCheckoutPossible(remaining: number): boolean {
  return remaining >= MINIMUM_CHECKOUT &&
    remaining <= MAXIMUM_CHECKOUT &&
    !IMPOSSIBLE_CHECKOUTS.has(remaining);
}
