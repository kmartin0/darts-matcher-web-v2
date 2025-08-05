import {inject, Injectable} from '@angular/core';
import {X01CheckoutService} from '../../../../../shared/services/x01-checkout-service/x01-checkout.service';
import {PlayerMap} from '../../../../../types/player-map';
import {X01MatchPlayer} from '../../../../../models/x01-match/x01-match-player';
import {X01Match} from '../../../../../models/x01-match/x01-match';
import {PlayerWinTracker} from '../../../../../models/common/player-win-tracker';
import {X01Set} from '../../../../../models/x01-match/x01-set';
import {X01Leg} from '../../../../../models/x01-match/x01-leg';
import {ResultType} from '../../../../../models/basematch/result-type';
import {getAreaPrefix} from '../../../../../models/dartboard/dartboard-section-area';
import {DartboardSectionToNumber} from '../../../../../models/dartboard/dartboard-section';
import {X01PlayerCardsViewData} from './x01-player-cards-view-data';
import {X01PlayerCardData} from './x01-player-card-data';
import {X01PlayerCardSet} from './x01-player-card-set';
import {X01PlayerCardLegStats} from './x01-player-card-leg-stats';
import {SetMap} from '../../../../../types/set-map';
import {X01PlayerCardLeg} from './x01-player-card-leg';
import {X01LegEntry} from '../../../../../models/x01-match/x01-leg-entry';

@Injectable({providedIn: 'root'})
export class X01MatchPlayerCardsViewDataTransformer {
  private checkoutService = inject(X01CheckoutService);

  /**
   * Creates the full view data for each player cards.
   *
   * @param match The X01 match data.
   * @returns A promise resolving to the view data or null if no match.
   */
  async transform(match: X01Match | null): Promise<X01PlayerCardsViewData | null> {
    if (!match) return null;

    return {
      playerInfo: this.createPlayersInfoMap(match.players),
      sets: await this.createSetsViewData(match),
      currentPlayer: match.matchProgress.currentThrower,
    };
  }

  /**
   * Maps players to their base info and averages.
   *
   * @param players The list of match players.
   * @returns A map of player IDs to their card data.
   */
  private createPlayersInfoMap(players: X01MatchPlayer[]): PlayerMap<X01PlayerCardData> {
    const playerInfoMap: PlayerMap<X01PlayerCardData> = {};
    players.forEach(player => {
      playerInfoMap[player.playerId.toString()] = {
        name: player.playerName,
        threeDartAvg: player.statistics.averageStats.average,
        firstNineAvg: player.statistics.averageStats.averageFirstNine,
        matchResult: player.resultType
      };
    });

    return playerInfoMap;
  }

  /**
   * Builds the full set view data for each set in the match.
   *
   * @param match The match to extract sets from.
   * @returns A promise resolving to a set map of player card sets.
   */
  private async createSetsViewData(match: X01Match): Promise<SetMap<X01PlayerCardSet>> {
    const setsMap: SetMap<X01PlayerCardSet> = {};
    const players = match.players;
    const x01 = match.matchSettings.x01;
    const playerWinTrackerMap = this.createPlayerWinTrackerMap(players);

    // Create an entry of SetViewData in the sets map for each set.
    // Reset legs won tracker after each set to only keep track of legs won within a set.
    for (const setEntry of match.sets) {
      setsMap[setEntry.setNumber] = await this.createSetViewData(setEntry.set, players, x01, playerWinTrackerMap);
      this.resetLegsWonTracker(playerWinTrackerMap);
    }

    return setsMap;
  }

  /**
   * Creates a tracker map to track sets and legs won for each player.
   *
   * @param players The list of players.
   * @returns A player win tracker map.
   */
  private createPlayerWinTrackerMap(players: X01MatchPlayer[]): PlayerMap<PlayerWinTracker> {
    const playerWinTrackerMap: PlayerMap<PlayerWinTracker> = {};

    players.forEach(player => {
      playerWinTrackerMap[player.playerId] = {
        setsWon: 0,
        legsWon: 0
      };
    });

    return playerWinTrackerMap;
  }

  /**
   * Resets only the legs won count in the tracker map.
   *
   * @param playerWinTrackerMap The tracker map to reset.
   */
  private resetLegsWonTracker(playerWinTrackerMap: PlayerMap<PlayerWinTracker>) {
    Object.keys(playerWinTrackerMap).forEach(playerId => {
      playerWinTrackerMap[playerId].legsWon = 0;
    });
  }

  /**
   * Creates view data for all legs within a single set.
   *
   * @param set The set being processed.
   * @param players The match players.
   * @param x01 The starting score (e.g., 501).
   * @param playerWinTrackerMap The win tracker for players.
   * @returns A promise resolving to a player card set map.
   */
  private async createSetViewData(set: X01Set, players: X01MatchPlayer[], x01: number, playerWinTrackerMap: PlayerMap<PlayerWinTracker>): Promise<X01PlayerCardSet> {
    const legsMap: Record<number, X01PlayerCardLeg> = {};

    for (const legEntry of set.legs) {
      legsMap[legEntry.legNumber] = await this.createLegViewData(set, legEntry, players, x01, playerWinTrackerMap);
    }

    return {legs: legsMap};
  }

  /**
   * Creates view data for a single leg.
   *
   * @param set The set the leg belongs to.
   * @param legEntry The leg being transformed.
   * @param players All players in the match.
   * @param x01 The starting score.
   * @param playerWinTrackerMap The win tracker.
   * @returns A promise resolving to player card leg data map.
   */
  private async createLegViewData(set: X01Set, legEntry: X01LegEntry, players: X01MatchPlayer[], x01: number, playerWinTrackerMap: PlayerMap<PlayerWinTracker>): Promise<X01PlayerCardLeg> {
    // Update the win trackers.
    this.updatePlayerWinTrackerMap(set, legEntry, playerWinTrackerMap);

    // Initialize a map containing the remaining and last score for each player.
    const legProgressMap = this.createLegProgressMap(legEntry.leg, x01);

    // Iterate through the players and their leg stats to the map.
    const playerStatsMap: PlayerMap<X01PlayerCardLegStats> = {};
    for (const player of players) {
      const playerId = player.playerId;
      const remaining = legProgressMap[playerId]?.remaining ?? x01;

      playerStatsMap[player.playerId] = {
        remaining: remaining,
        setsWon: playerWinTrackerMap[playerId]?.setsWon ?? 0,
        legsWonInSet: playerWinTrackerMap[playerId]?.legsWon ?? 0,
        lastScore: legProgressMap[playerId]?.lastScore,
        dartsUsed: legProgressMap[playerId]?.dartsUsed ?? 0,
        suggestedCheckout: await this.createCheckoutMessage(remaining)
      };
    }

    // Return the map containing the leg stats for each player.
    return {startsLeg: legEntry.leg.throwsFirst, players: playerStatsMap};
  }

  /**
   * Builds a progress map of players’ remaining scores and last scores for a leg.
   *
   * @param leg The leg to analyze.
   * @param x01 The starting score (e.g., 501).
   * @returns A map of player progress in the leg.
   */
  private createLegProgressMap(leg: X01Leg, x01: number): PlayerMap<{
    remaining: number,
    lastScore: number,
    dartsUsed: number
  }> {
    const legProgressMap: PlayerMap<{ remaining: number, lastScore: number, dartsUsed: number }> = {};
    leg.rounds.forEach(roundEntry => {
      Object.entries(roundEntry.round.scores).forEach(([playerId, roundScore]) => {
        legProgressMap[playerId] = {
          remaining: (legProgressMap[playerId]?.remaining ?? x01) - roundScore.score,
          lastScore: roundScore.score,
          dartsUsed: (legProgressMap[playerId]?.dartsUsed ?? 0) + 3
        };
      });
    })

    if(leg.winner != null && leg.checkoutDartsUsed != null && Object.hasOwn(legProgressMap, leg.winner)) {
      legProgressMap[leg.winner].dartsUsed += leg.checkoutDartsUsed - 3;
    }

    return legProgressMap;
  }

  /**
   * Updates the win tracker based on the outcome of a legEntry. If it's the last legEntry of a set, also updates
   * the sets won.
   *
   * @param set The set that contains the legEntry.
   * @param legEntry The legEntry that just finished.
   * @param winTrackers The current player win tracker map.
   */
  private updatePlayerWinTrackerMap(set: X01Set, legEntry: X01LegEntry, winTrackers: PlayerMap<PlayerWinTracker>) {
    // Increment legs won for the player that has won this legEntry.
    const leg: X01Leg = legEntry.leg;
    if (leg.winner && leg.winner in winTrackers) winTrackers[leg.winner].legsWon++;

    // Increment sets won if this is the last legEntry in a set for each player that has won or drawn the set.
    if (set.legs.at(-1)?.legNumber === legEntry.legNumber && set.result) {
      Object.entries(winTrackers).forEach(([playerId, tracker]) => {
        const playerResult = set.result?.[playerId];
        if (playerResult === ResultType.WIN || playerResult === ResultType.DRAW) tracker.setsWon++;
      });
    }
  }

  /**
   * Generates a formatted checkout message (e.g., "T20, D10") based on remaining score.
   *
   * @param remaining The score left to check out.
   * @returns A promise resolving to a checkout string or an empty string.
   */
  private async createCheckoutMessage(remaining: number): Promise<string> {
    const checkout = await this.checkoutService.getCheckout(remaining);
    if (!checkout) return '';

    // Concatenate the dartboard area and section for each dart.
    const targets = checkout.suggested.map(dart =>
      `${getAreaPrefix(dart.area)}${DartboardSectionToNumber[dart.section]}`
    );

    // Concatenate the targets seperated by a comma
    return targets.join(', ');
  }

}
