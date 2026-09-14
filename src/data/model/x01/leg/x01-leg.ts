import {X01LegRoundEntry} from '../round/x01-leg-round-entry';
import {X01Turn} from '../round/x01-turn';

export interface X01Leg {
  winner: string | null;
  throwsFirst: string;
  checkoutDartsUsed: number | null;
  rounds: X01LegRoundEntry[];
}

/**
 * Finished leg with a known winner and checkout darts used.
 */
export interface X01FinishedLeg extends X01Leg {
  winner: string;
  checkoutDartsUsed: number;
}

/**
 * Gets the first round in a leg.
 *
 * @param leg - Leg containing the rounds.
 * @returns The first round entry, or null when the leg has no rounds.
 */
export function getFirstRoundInLeg(leg: X01Leg): X01LegRoundEntry | null {
  return leg.rounds.at(0) ?? null;
}

/**
 * Gets the last round in a leg.
 *
 * @param leg - Leg containing the rounds.
 * @returns The last round entry, or null when the leg has no rounds.
 */
export function getLastRoundInLeg(leg: X01Leg): X01LegRoundEntry | null {
  return leg.rounds.at(-1) ?? null;
}

/**
 * Gets the last round in a leg containing a turn for the specified player.
 *
 * @param leg - Leg containing the rounds.
 * @param playerId - ID of the player to get the last round for.
 * @returns The last round entry containing a turn for the player, or null when none exists.
 */
export function getLastRoundForPlayerInLeg(leg: X01Leg, playerId: string): X01LegRoundEntry | null {
  const roundEntry = leg.rounds.findLast(
    roundEntry => roundEntry.round.turns[playerId] !== undefined
  );

  return roundEntry ?? null;
}

/**
 * Gets the last turn played by the specified player in a leg.
 *
 * @param leg - Leg containing the player's turns.
 * @param playerId - ID of the player to get the last turn for.
 * @returns The player's last turn, or null when no turn exists.
 */
export function getLastTurnForPlayerInLeg(leg: X01Leg, playerId: string): X01Turn | null {
  const roundEntry = getLastRoundForPlayerInLeg(leg, playerId);
  return roundEntry?.round.turns[playerId] ?? null;
}

/**
 * Checks whether the specified round is the last round in the leg.
 *
 * @param leg - Leg containing the rounds.
 * @param roundNumber - Number of the round to check.
 * @returns Whether the round is the last round in the leg.
 */
export function isLastRoundInLeg(leg: X01Leg, roundNumber: number): boolean {
  const lastRound = getLastRoundInLeg(leg);
  return lastRound?.roundNumber === roundNumber;
}

/**
 * Checks whether the specified round is the last round containing a turn
 * for the specified player.
 *
 * @param leg - Leg containing the rounds.
 * @param playerId - ID of the player to check.
 * @param roundNumber - Number of the round to check.
 * @returns Whether the round is the player's last round in the leg.
 */
export function isLastRoundForPlayerInLeg(leg: X01Leg, playerId: string, roundNumber: number): boolean {
  const lastRound = getLastRoundForPlayerInLeg(leg, playerId);
  return lastRound?.roundNumber === roundNumber;
}

/**
 * Checks whether the specified player starts the leg.
 *
 * @param leg - Leg to check.
 * @param playerId - ID of the player to check.
 * @returns Whether the player starts the leg.
 */
export function doesPlayerStartLeg(leg: X01Leg, playerId: string): boolean {
  return leg.throwsFirst === playerId;
}

/**
 * Checks whether a leg is finished.
 *
 * A finished leg has both a winner and the number of darts used for the checkout.
 *
 * @param leg - Leg to check.
 * @returns Whether the leg is finished.
 */
export function isLegFinished(leg: X01Leg): leg is X01FinishedLeg {
  return leg.winner !== null && leg.checkoutDartsUsed !== null;
}

/**
 * Gets the number of darts used by a player in a round.
 *
 * Normal turns count as three darts. If the turn is the checkout turn, the
 * recorded checkout darts used are counted instead.
 *
 * @param leg - Leg containing the round.
 * @param roundEntry - Round containing the player's turn.
 * @param playerId - ID of the player to calculate darts used for.
 * @returns Number of darts used by the player in the round, or zero when the player has no turn.
 */
export function getDartsUsedForPlayerInRound(leg: X01Leg, roundEntry: X01LegRoundEntry, playerId: string): number {
  const turn = roundEntry.round.turns[playerId];

  if (turn === undefined) {
    return 0;
  }

  if (isLastRoundInLeg(leg, roundEntry.roundNumber) && isLegFinished(leg) && leg.winner === playerId) {
    return leg.checkoutDartsUsed;
  }

  return 3;
}
