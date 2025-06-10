import {X01Match} from '../../models/x01-match/x01-match';
import {X01Set} from '../../models/x01-match/x01-set';
import {X01Leg} from '../../models/x01-match/x01-leg';
import {X01LegRound} from '../../models/x01-match/x01-leg-round';

export function getSetInPlay(match: X01Match): X01Set | null {
  const currentSetNumber = match.matchProgress.currentSet;
  return currentSetNumber !== null ? getSet(match, currentSetNumber) : null;
}

export function getLegInPlay(match: X01Match, setInPlay: X01Set | null): X01Leg | null {
  const currentLegNumber = match.matchProgress.currentLeg;
  if (setInPlay === null || currentLegNumber === null) return null;
  return getLeg(setInPlay, currentLegNumber);
}

export function getRemainingForCurrentPlayer(match: X01Match): number | null {
  const setInPlay = getSetInPlay(match);
  const legInPlay = getLegInPlay(match, setInPlay);
  const currentPlayer = match.matchProgress.currentThrower;

  if (!setInPlay || !legInPlay || !currentPlayer) return null;

  let remaining = match.matchSettings.x01;
  legInPlay.rounds.forEach(round => {
    if (Object.hasOwn(round.scores, currentPlayer)) remaining -= round.scores[currentPlayer].score;
  });

  return remaining;
}

export function isCheckoutPossible(remaining: number): boolean {
  return remaining <= 170 && !(remaining in [169, 168, 166, 165, 163, 162, 159]);
}

export function getSet(match: X01Match, setNumber: number): X01Set | null {
  return match.sets.find(set => set.set === setNumber) ?? null;
}

export function getLeg(set: X01Set, legNumber: number): X01Leg | null {
  return set.legs.find(leg => leg.leg === legNumber) ?? null;
}

export function getRound(leg: X01Leg, roundNumber: number): X01LegRound | null {
  return leg.rounds.find(round => round.round === roundNumber) ?? null;
}

