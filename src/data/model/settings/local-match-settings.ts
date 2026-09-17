import {MatchPlayer} from '../base-match/match-player';
import {isValidObjectId} from '../../api/utils/object-id.util';

export interface LocalMatchSettings {
  matchId: string;
  scoreForPlayerIds: string[];
}

/**
 * Checks whether a value is a local match settings object.
 *
 * @param value - Value to check.
 * @returns Whether the value has the expected local match settings structure.
 */
export function isLocalMatchSettings(value: unknown): value is LocalMatchSettings {
  if (typeof value !== 'object' || value === null) return false;

  const settings = value as Record<string, unknown>;
  const matchId = settings['matchId'];
  const scoreForPlayerIds = settings['scoreForPlayerIds'];

  return isValidObjectId(matchId) &&
    Array.isArray(scoreForPlayerIds) &&
    scoreForPlayerIds.every(isValidObjectId);
}

/**
 * Creates default local settings with every match player selected.
 *
 * @param matchId - Match ID to include in the settings.
 * @param players - Match players to select.
 * @returns Default local match settings.
 */
export function createDefaultLocalMatchSettings(matchId: string, players: readonly MatchPlayer[]): LocalMatchSettings {
  return {
    matchId: matchId,
    scoreForPlayerIds: players.map(player => player.playerId)
  };
}

/**
 * Checks whether two local match settings contain the same match ID and selected player IDs in the same order.
 *
 * @param first - First local match settings to compare.
 * @param second - Second local match settings to compare.
 * @returns Whether both settings are equal.
 */
export function isSameLocalSettings(first: LocalMatchSettings, second: LocalMatchSettings): boolean {
  if (first.matchId !== second.matchId) return false;
  if (first.scoreForPlayerIds.length !== second.scoreForPlayerIds.length) return false;

  return first.scoreForPlayerIds.every(
    (playerId, index) => playerId === second.scoreForPlayerIds[index]
  );
}
