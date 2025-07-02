import {X01Match} from '../../models/x01-match/x01-match';
import {X01Set} from '../../models/x01-match/x01-set';
import {X01Leg} from '../../models/x01-match/x01-leg';
import {X01LegRoundScore} from '../../models/x01-match/x01-leg-round-score';
import {X01LegEntry} from '../../models/x01-match/x01-leg-entry';
import {X01LegRoundEntry} from '../../models/x01-match/x01-leg-round-entry';
import {X01SetEntry} from '../../models/x01-match/x01-set-entry';
import {X01MatchPlayer} from '../../models/x01-match/x01-match-player';

export function getSetInPlay(match: X01Match): X01SetEntry | null {
  const currentSetNumber = match.matchProgress.currentSet;
  return currentSetNumber !== null ? getSet(match, currentSetNumber) : null;
}

export function getLegInPlay(match: X01Match, setInPlay: X01Set | null): X01LegEntry | null {
  const currentLegNumber = match.matchProgress.currentLeg;
  if (setInPlay === null || currentLegNumber === null) return null;
  return getLeg(setInPlay, currentLegNumber);
}

export function getRemainingForCurrentPlayer(match: X01Match): number {
  const setInPlayEntry = getSetInPlay(match);
  const legInPlayEntry = getLegInPlay(match, setInPlayEntry?.set ?? null);
  const currentPlayer = match.matchProgress.currentThrower;

  if (!setInPlayEntry || !legInPlayEntry || !currentPlayer) throw new Error('Remaining for current player not found.');

  return getRemainingForPlayer(legInPlayEntry.leg, match.matchSettings.x01, currentPlayer);
}

export function getRemainingForPlayer(leg: X01Leg, x01: number, playerId: string) {
  let remaining = x01;
  leg.rounds.forEach(roundEntry => {
    if (Object.hasOwn(roundEntry.round.scores, playerId)) remaining -= roundEntry.round.scores[playerId].score;
  });

  return remaining;
}

export function getPlayer(match: X01Match, playerId: string | null): X01MatchPlayer | null {
  return match.players.find(player => player.playerId === playerId) ?? null;
}

export function getCurrentThrower(match: X01Match | null | undefined): X01MatchPlayer | null {
  if (!match) return null;
  return getPlayer(match, match.matchProgress.currentThrower);
}

export function isCheckoutPossible(remaining: number): boolean {
  return remaining <= 170 && !(remaining in [169, 168, 166, 165, 163, 162, 159]);
}

export function getSet(match: X01Match | null, setNumber: number): X01SetEntry | null {
  if (!match) return null;
  return match.sets.find(set => set.setNumber === setNumber) ?? null;
}

export function getLeg(set: X01Set | null, legNumber: number): X01LegEntry | null {
  if (!set) return null;
  return set.legs.find(leg => leg.legNumber === legNumber) ?? null;
}

export function getRound(leg: X01Leg | null, roundNumber: number): X01LegRoundEntry | null {
  if (!leg) return null;
  return leg.rounds.find(round => round.roundNumber === roundNumber) ?? null;
}

export function findLastPlayerScore(leg: X01Leg, playerId: string): X01LegRoundScore | null {

  for (const roundEntry of leg.rounds.slice().reverse()) {
    if (Object.hasOwn(roundEntry.round.scores, playerId)) {
      return roundEntry.round.scores[playerId];
    }
  }

  return null;
}

