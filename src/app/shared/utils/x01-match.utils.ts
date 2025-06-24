import {X01Match} from '../../models/x01-match/x01-match';
import {X01Set} from '../../models/x01-match/x01-set';
import {X01Leg} from '../../models/x01-match/x01-leg';
import {X01LegRound} from '../../models/x01-match/x01-leg-round';
import {X01LegRoundScore} from '../../models/x01-match/x01-leg-round-score';

export function getSetInPlay(match: X01Match): X01Set | null {
  const currentSetNumber = match.matchProgress.currentSet;
  return currentSetNumber !== null ? getSet(match, currentSetNumber) : null;
}

export function getLegInPlay(match: X01Match, setInPlay: X01Set | null): X01Leg | null {
  const currentLegNumber = match.matchProgress.currentLeg;
  if (setInPlay === null || currentLegNumber === null) return null;
  return getLeg(setInPlay, currentLegNumber);
}

export function getRemainingForCurrentPlayer(match: X01Match): number {
  const setInPlay = getSetInPlay(match);
  const legInPlay = getLegInPlay(match, setInPlay);
  const currentPlayer = match.matchProgress.currentThrower;

  if (!setInPlay || !legInPlay || !currentPlayer) throw new Error('Remaining for current player not found.');

  return getRemainingForPlayer(legInPlay, match.matchSettings.x01, currentPlayer);
}

export function getRemainingForPlayer(leg: X01Leg, x01: number, playerId: string) {
  let remaining = x01;
  Object.entries(leg.rounds).forEach(([, round]) => {
    if (Object.hasOwn(round.scores, playerId)) remaining -= round.scores[playerId].score;
  });

  return remaining;
}

export function isCheckoutPossible(remaining: number): boolean {
  return remaining <= 170 && !(remaining in [169, 168, 166, 165, 163, 162, 159]);
}

export function getSet(match: X01Match | null, setNumber: number): X01Set | null {
  if (!match) return null;
  return match.sets.find(set => set.set === setNumber) ?? null;
}

export function getLeg(set: X01Set | null, legNumber: number): X01Leg | null {
  if (!set) return null;
  return set.legs.find(leg => leg.leg === legNumber) ?? null;
}

export function getRound(leg: X01Leg | null, roundNumber: number): X01LegRound | null {
  if (!leg) return null;
  return leg.rounds[roundNumber] ?? null;
}

export function findLastPlayerScore(leg: X01Leg, playerId: string): X01LegRoundScore | null {

  for(const round of Object.values(leg.rounds).reverse()) {
    if (Object.hasOwn(round.scores, playerId)) {
      return round.scores[playerId];
    }
  }

  return null;
}

