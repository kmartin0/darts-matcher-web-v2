import {isWinOrDrawResult} from '../../../data/model/base-match/result-type';
import {getDartsUsedForPlayerInRound, getLastTurnForPlayerInLeg, X01Leg} from '../../../data/model/x01/leg/x01-leg';
import {X01LegEntry} from '../../../data/model/x01/leg/x01-leg-entry';
import {X01Match} from '../../../data/model/x01/match/x01-match';
import {isLastLegInSet, X01Set} from '../../../data/model/x01/set/x01-set';
import {X01SetEntry} from '../../../data/model/x01/set/x01-set-entry';
import {isFirstNineRound} from '../../../data/model/x01/statistics/x01-average-statistics';
import {
  X01MatchTimeline,
  X01MatchTimelineLegEntry,
  X01MatchTimelinePlayerEntry,
  X01MatchTimelineSetEntry,
  X01PlayerLegValues
} from '../../../data/model/x01/timeline/x01-match-timeline';
import {PlayerMap} from '../../../shared/types/player-map';

/**
 * Builds match values through every recorded leg, grouped by set.
 *
 * Sets and legs retain their recorded order. Each leg entry contains
 * independent player values through that leg, inclusive.
 */
export class MatchTimelineBuilder {
  private readonly playerValuesMap: Map<string, X01MatchTimelinePlayerEntry>;

  private constructor(private readonly match: X01Match) {
    this.playerValuesMap = this.createInitialPlayerValues();
  }

  /**
   * Builds all set entries using this instance's accumulated player values.
   *
   * @returns Complete match timeline.
   */
  static build(match: X01Match): X01MatchTimeline {
    return new MatchTimelineBuilder(match).build();
  }

  /**
   * Builds all set entries using this instance's accumulated player values.
   *
   * @returns Complete match timeline.
   */
  private build(): X01MatchTimeline {
    const setEntries = new Map<number, X01MatchTimelineSetEntry>();

    for (const setEntry of this.match.sets) {
      setEntries.set(setEntry.setNumber, this.buildSetEntry(setEntry));
    }

    return {
      setEntries: setEntries
    };
  }

  /**
   * Builds a set's leg entries while advancing the accumulated player values.
   *
   * Leg wins restart for the set. Recorded set results are included when its
   * final leg is reached, before that leg's entry is created.
   *
   * @param setEntry - Set containing the recorded legs and results.
   * @returns Set entry with legs keyed by leg number in recorded order.
   */
  private buildSetEntry(setEntry: X01SetEntry): X01MatchTimelineSetEntry {
    const legEntries = new Map<number, X01MatchTimelineLegEntry>();

    this.resetLegsWon();

    for (const legEntry of setEntry.set.legs) {
      this.resetLegValues(this.match.matchSettings.x01);
      this.updateScoringValuesForLeg(legEntry.leg);
      this.updateLegsWon(legEntry.leg);

      if (isLastLegInSet(setEntry.set, legEntry.legNumber)) {
        this.updateSetsWon(setEntry.set);
      }

      legEntries.set(legEntry.legNumber, this.createLegEntry(legEntry));
    }

    return {
      setNumber: setEntry.setNumber,
      legEntries: legEntries
    };
  }

  /**
   * Creates initial standings, cumulative totals, and leg values for every player.
   *
   * @returns Mutable player values keyed by player ID.
   */
  private createInitialPlayerValues(): Map<string, X01MatchTimelinePlayerEntry> {
    return new Map(
      this.match.players.map(player => [
        player.playerId,
        {
          standing: {
            setsWon: 0,
            legsWonInCurrentSet: 0
          },
          cumulativeValues: {
            pointsThrown: 0,
            dartsThrown: 0,
            pointsThrownFirstNine: 0,
            dartsThrownFirstNine: 0
          },
          legValues: this.createInitialLegValues(this.match.matchSettings.x01)
        }
      ])
    );
  }

  /**
   * Creates leg values for a player who has not thrown.
   *
   * @param x01 - Starting score of the leg.
   * @returns Zeroed totals, the starting remaining score, and no last score.
   */
  private createInitialLegValues(x01: number): X01PlayerLegValues {
    return {
      pointsThrown: 0,
      dartsThrown: 0,
      remaining: x01,
      lastScore: null,
      doublesMissed: 0
    };
  }

  /**
   * Resets leg wins at the start of a set while retaining set wins.
   */
  private resetLegsWon(): void {
    this.playerValuesMap.forEach(playerValues => {
      playerValues.standing.legsWonInCurrentSet = 0;
    });
  }

  /**
   * Resets each player's leg values while retaining cumulative values and standings.
   *
   * @param x01 - Starting score of the new leg.
   */
  private resetLegValues(x01: number): void {
    this.playerValuesMap.forEach(playerValues => {
      playerValues.legValues = this.createInitialLegValues(x01);
    });
  }

  /**
   * Accumulates recorded turns into leg values and cumulative scoring totals.
   *
   * Checkout turns use their recorded dart count. First-nine totals include
   * rounds one through three of each leg. Unrecorded doubles missed count as zero.
   *
   * @param leg - Leg containing the turns to accumulate.
   */
  private updateScoringValuesForLeg(leg: X01Leg): void {
    for (const roundEntry of leg.rounds) {
      for (const [playerId, turn] of Object.entries(roundEntry.round.turns)) {
        const playerValues = this.playerValuesMap.get(playerId);

        if (playerValues === undefined) {
          continue;
        }

        const dartsUsed = getDartsUsedForPlayerInRound(leg, roundEntry, playerId);
        const legValues = playerValues.legValues;
        const cumulativePlayerValues = playerValues.cumulativeValues;

        // Accumulate values within this leg and retain the latest turn values.
        legValues.pointsThrown += turn.score;
        legValues.dartsThrown += dartsUsed;
        legValues.remaining = turn.remaining;
        legValues.lastScore = turn.score;
        legValues.doublesMissed += turn.doublesMissed ?? 0;

        // Accumulate scoring totals through this leg.
        cumulativePlayerValues.pointsThrown += turn.score;
        cumulativePlayerValues.dartsThrown += dartsUsed;

        if (isFirstNineRound(roundEntry.roundNumber)) {
          cumulativePlayerValues.pointsThrownFirstNine += turn.score;
          cumulativePlayerValues.dartsThrownFirstNine += dartsUsed;
        }
      }
    }
  }

  /**
   * Adds a leg win to the winner's standing when a winner is recorded.
   *
   * @param leg - Leg containing the recorded winner.
   */
  private updateLegsWon(leg: X01Leg): void {
    if (leg.winner === null) {
      return;
    }

    const winnerValues = this.playerValuesMap.get(leg.winner);

    if (winnerValues !== undefined) {
      winnerValues.standing.legsWonInCurrentSet++;
    }
  }

  /**
   * Adds recorded set wins and draws to the players' standings.
   *
   * @param set - Set containing the recorded player results.
   */
  private updateSetsWon(set: X01Set): void {
    if (set.result === null) {
      return;
    }

    for (const [playerId, result] of Object.entries(set.result)) {
      if (!isWinOrDrawResult(result)) {
        continue;
      }

      const playerValues = this.playerValuesMap.get(playerId);

      if (playerValues !== undefined) {
        playerValues.standing.setsWon++;
      }
    }
  }

  /**
   * Creates a timeline leg entry from the accumulated player values.
   *
   * @param legEntry - Leg identifying the timeline position.
   * @returns Independent timeline leg entry.
   */
  private createLegEntry(legEntry: X01LegEntry): X01MatchTimelineLegEntry {
    const leg = legEntry.leg;
    const checkoutScore = leg.winner === null
      ? null
      : getLastTurnForPlayerInLeg(leg, leg.winner)?.score ?? null;

    return {
      legNumber: legEntry.legNumber,
      throwsFirst: leg.throwsFirst,
      winner: leg.winner,
      checkoutScore: checkoutScore,
      players: this.copyPlayerValues()
    };
  }

  /**
   * Copies player values so later accumulation cannot change an existing entry.
   *
   * @returns Player entries with independent standings, cumulative values, and leg values.
   */
  private copyPlayerValues(): PlayerMap<X01MatchTimelinePlayerEntry> {
    return Object.fromEntries(
      Array.from(this.playerValuesMap, ([playerId, playerValues]) => [
        playerId,
        {
          standing: {...playerValues.standing},
          cumulativeValues: {...playerValues.cumulativeValues},
          legValues: {...playerValues.legValues}
        }
      ])
    );
  }
}
