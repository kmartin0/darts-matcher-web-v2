import {X01Match} from '../../models/x01-match/x01-match';
import {X01Set} from '../../models/x01-match/x01-set';
import {X01Leg} from '../../models/x01-match/x01-leg';
import {Dart} from '../../models/dartboard/dart';

export function getSetInPlay(match: X01Match): X01Set | null {
  return match.sets.find(set => set.set === match.matchProgress.currentSet) ?? null;
}

export function getLegInPlay(match: X01Match, setInPlay: X01Set | null): X01Leg | null {
  return setInPlay?.legs.find(leg => leg.leg === match.matchProgress.currentLeg) ?? null;
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
  return remaining <= 170 && !(remaining in [169, 168, 166, 165, 163, 162, 159])
}
