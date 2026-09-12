import {X01LegRoundEntry} from '../round/x01-leg-round-entry';
import {X01Turn} from '../round/x01-turn';

export interface X01Leg {
  winner: string | null;
  throwsFirst: string;
  checkoutDartsUsed: number | null;
  rounds: X01LegRoundEntry[];
}

/**
 * Gets the last round in a leg containing a turn for the specified player.
 *
 * @param leg - Leg containing the rounds.
 * @param playerId - ID of the player to get the last round for.
 * @returns The last round entry containing a turn for the player, or null when none exists.
 */
export function getLastRoundForPlayerInLeg(leg: X01Leg, playerId: string): X01LegRoundEntry | null {
  const roundEntry = leg.rounds.findLast(roundEntry => roundEntry.round.turns[playerId] !== undefined);
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
