import {X01Match} from '../../../../models/x01-match/x01-match';
import {X01MatchTableDataSource, X01PlayerRoundInfo, X01RoundTableRow} from './x01-match-table-data-source';
import {ResultType} from '../../../../models/basematch/result-type';
import {X01Leg} from '../../../../models/x01-match/x01-leg';
import {X01MatchPlayer} from '../../../../models/x01-match/x01-match-player';
import {X01Set} from '../../../../models/x01-match/x01-set';
import {PlayerMap} from '../../../../types/player-map';
import {X01MatchTableColumnDefinitions} from './models/x01-match-table-column-definitions';
import {X01MatchViewData} from './models/x01-match-view-data';
import {PlayerWinTracker} from '../../../../models/common/player-win-tracker';
import {X01MatchPlayerSummary} from './models/x01-match-player-summary';
import {X01SetViewData} from './models/x01-set-view-data';
import {X01LegViewData} from './models/x01-leg-view-data';
import {X01MatchPlayerLegStats} from './models/x01-match-player-leg-stats';
import {X01LegRound} from '../../../../models/x01-match/x01-leg-round';
import {Injectable} from '@angular/core';
import {X01CheckoutService} from '../../../../shared/services/x01-checkout-service/x01-checkout-service';
import {getAreaPrefix} from '../../../../models/dartboard/dartboard-section-area';
import {DartboardSectionToNumber} from '../../../../models/dartboard/dartboard-section';

@Injectable({
  providedIn: 'root'
})
export class X01MatchViewDataTransformer {

  constructor(private checkoutService: X01CheckoutService) {
  }

  async createX01MatchViewData(match: X01Match | null | undefined): Promise<X01MatchViewData | null> {
    if (!match) return null;

    const columnDefinitions = this.createColumnDefinitions(match.players);

    return {
      matchInformation: this.createMatchInfoString(match),
      columnDefinitions: columnDefinitions,
      displayedColumns: this.createDisplayedColumns(columnDefinitions),
      matchTableDataSource: new X01MatchTableDataSource([]),
      playerSummaries: this.createMatchPlayerSummaries(match),
      sets: await this.createSetsViewData(match),
    };
  }

  /**
   * Creates the column order. The round and darts column are in the middle. Half of the players to the left and the other
   * half to the right.
   *
   * @param columnDefinitions Containing the metadata about the columns that should be displayed.
   */
  private createDisplayedColumns(columnDefinitions: X01MatchTableColumnDefinitions): string[] {
    const playerColumns = columnDefinitions.playerColumns;
    const nonPlayerColumns = [columnDefinitions.round.id, columnDefinitions.darts.id];

    // Split the players into left hand side and right hand side
    const half = Math.floor(playerColumns.length / 2);
    const leftPlayers = playerColumns.slice(0, half);
    const rightPlayers = playerColumns.slice(half);

    // Helper to flatten player columns into ids
    const flattenPlayerCols = (playersArray: typeof playerColumns) =>
      playersArray.flatMap(player => [player.score.id, player.remaining.id]);

    return [...flattenPlayerCols(leftPlayers), ...nonPlayerColumns, ...flattenPlayerCols(rightPlayers),];
  }

  /**
   * Creates a column definition object used for defining the leg rounds table.
   * Containing standard columns for round and darts as well as player-specific columns for score and remaining points.
   *
   * @param players - An array of player objects representing the players in the match.
   * @returns A X01MatchTableColumnDefinitions object including standard and player columns.
   */
  private createColumnDefinitions(players: X01MatchPlayer[]): X01MatchTableColumnDefinitions {
    // Create the column definitions containing column label and if per column.
    const columnDefinitions: X01MatchTableColumnDefinitions = {
      round: {id: 'round', label: 'Round'},
      darts: {id: 'darts', label: 'Darts'},
      playerColumns: []
    };

    // Populate the player columns where each player has a score and to go column.
    players.forEach(player => {
      const playerId = player.playerId.toString();
      columnDefinitions.playerColumns.push({
        playerId: playerId,
        score: {id: this.createScoreColId(playerId), label: 'Score'},
        remaining: {id: this.createRemainingColId(playerId), label: 'To Go'}
      });
    });

    // Return the column definitions.
    return columnDefinitions;
  }

  /**
   * Generates a unique score column ID for a given player.
   *
   * @param playerId The player's ID.
   * @returns The score column ID string.
   */
  private createScoreColId(playerId: string) {
    return `score_${playerId}`;
  }

  /**
   * Generates a unique remaining column ID for a given player.
   *
   * @param playerId The player's ID.
   * @returns The remaining column ID string.
   */
  private createRemainingColId(playerId: string) {
    return `remaining_${playerId}`;
  }

  /**
   * Generates a user-friendly string describing the match format, best-of settings, match type, starting score (x01).
   *
   * @param match The match object.
   * @returns A user-friendly string summarizing the match configuration.
   */
  private createMatchInfoString(match: X01Match): string {
    const matchSettings = match.matchSettings;
    const bestOf = matchSettings.bestOf.sets > 1
      ? `Best of ${matchSettings.bestOf.sets} sets (BO${matchSettings.bestOf.legs})`
      : `Best of ${matchSettings.bestOf.legs} legs`;

    const matchType = match.matchType;
    const x01 = matchSettings.x01;
    return `${bestOf} | ${matchType} (${x01})`;
  }

  /**
   * Initializes the match view data object with player summaries and
   * transformed set/leg/round data.
   *
   * @param match The X01 match to process and transform.
   */
  private async createSetsViewData(match: X01Match): Promise<{ [set: number]: X01SetViewData }> {
    const x01 = match.matchSettings.x01;
    const players = match.players;
    const setsViewData: { [set: number]: X01SetViewData } = {};

    // For each player keep track how many legs and sets they won after each leg.
    const playerWinTrackerMap = this.createPlayerWinTracker(players);

    // Iterate through the sets. For each set create set data and it to the match view data sets property.
    for (const set of match.sets) {
      setsViewData[set.set] = await this.createSetViewData(set, x01, players, playerWinTrackerMap);
      this.resetLegsWonTracker(playerWinTrackerMap); // Only track the legs won in a set for each player.
    }

    // Initialize the fully constructed view data to the class property
    return setsViewData;
  }

  /**
   * Generates summary data for each player in the match. This consists of their name, 3-dart average and first-9 average.
   *
   * @param match The match from which to extract player statistics.
   * @returns A map of player IDs to their summary data.
   */
  private createMatchPlayerSummaries(match: X01Match): PlayerMap<X01MatchPlayerSummary> {
    const playerOverviews: PlayerMap<X01MatchPlayerSummary> = {};
    match.players.forEach(player => {
      playerOverviews[player.playerId] = {
        name: player.playerName,
        threeDartAvg: player.statistics.averageStats.average,
        firstNineAvg: player.statistics.averageStats.averageFirstNine,
      };
    });

    return playerOverviews;
  }

  /**
   * Creates a map to track how many sets and legs each player has won.
   *
   * @param players The list of players participating in the match.
   * @returns A map of player IDs to their win tracker objects.
   */
  private createPlayerWinTracker(players: X01MatchPlayer[]): PlayerMap<PlayerWinTracker> {
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
   * Resets the legsWon count for each player in the win tracker map.
   *
   * @param playerWinTrackerMap The map of player win trackers to reset.
   */
  private resetLegsWonTracker(playerWinTrackerMap: PlayerMap<PlayerWinTracker>) {
    Object.keys(playerWinTrackerMap).forEach(playerId => {
      playerWinTrackerMap[playerId].legsWon = 0;
    });
  }

  /**
   * Transforms a set into a structured view format
   *
   * @param set The set to transform.
   * @param x01 The starting score for the match.
   * @param players The list of players in the match.
   * @param playerWinTrackerMap A map tracking wins per player.
   * @returns The transformed set view data.
   */
  private async createSetViewData(
    set: X01Set, x01: number, players: X01MatchPlayer[], playerWinTrackerMap: PlayerMap<PlayerWinTracker>
  ): Promise<X01SetViewData> {
    const setViewData: X01SetViewData = {legs: {}};

    // Iterate through the legs, create leg view data for each leg and add it to the legs property in setViewData.
    for (const leg of set.legs) {
      setViewData.legs[leg.leg] = await this.createLegViewData(set, leg, x01, players, playerWinTrackerMap);
    }

    return setViewData;
  }

  /**
   * Transforms a leg into a structured view format.
   *
   * @param set The parent set containing the leg.
   * @param leg The leg to transform.
   * @param x01 The starting score for the match.
   * @param players The list of players.
   * @param playerWinTrackerMap A map tracking wins per player.
   * @returns The transformed leg view data.
   */
  private async createLegViewData(
    set: X01Set, leg: X01Leg, x01: number, players: X01MatchPlayer[], playerWinTrackerMap: PlayerMap<PlayerWinTracker>
  ): Promise<X01LegViewData> {
    // Convert the leg rounds into a row-based format for table display.
    const legRows = this.createLegRounds(leg, x01);

    // Get each player's most recent round info.
    const latestPlayerRoundInfoMap = this.createLatestPlayerRoundInfoMap(legRows, players);

    // For each player create their leg statistics (legs won, sets won, remaining score etc.).
    const playerStats: PlayerMap<X01MatchPlayerLegStats> = {};
    for (const player of players) {
      const playerId = player.playerId;
      const latestPlayerRoundInfo = latestPlayerRoundInfoMap[playerId];
      playerStats[playerId] = await this.createPlayerLegStats(player, set, leg, x01, playerWinTrackerMap[playerId], latestPlayerRoundInfo);
    }

    // Create the leg view data and return it.
    return {playerStats: playerStats, rounds: legRows};
  }

  /**
   * Converts a leg's list of rounds into a structured array of table rows.
   *
   * Each row includes round number, number of darts thrown, and each player's score and remaining points.
   *
   * @param leg The leg whose rounds should be transformed.
   * @param x01 The initial starting score (e.g., 501 or 301).
   * @returns An array of round-level table rows for the leg.
   */
  private createLegRounds(leg: X01Leg, x01: number): X01RoundTableRow[] {
    const legRounds: X01RoundTableRow[] = [];

    // For each leg round create a table row.
    leg.rounds.forEach(round => {
      const row = this.createRoundTableRow(round, x01, legRounds.at(-1));
      legRounds.push(row);
    });

    return legRounds;
  }

  /**
   * Creates a single round table row from a round's raw score data.
   *
   * @param round The round data to transform.
   * @param x01 The initial starting score.
   * @param previousRow The previous round's table row (used to calculate running totals).
   * @returns A formatted round row with per-player score and remaining values.
   */
  private createRoundTableRow(round: X01LegRound, x01: number, previousRow?: X01RoundTableRow) {
    // Initialize the players round info map and default number of darts thrown.
    const playersRoundInfoMap: PlayerMap<X01PlayerRoundInfo> = {};
    let minDartsThrown = 3;

    // Create row player round info for each player that scored in the round.
    Object.entries(round.scores).forEach(([playerId, roundScore]) => {
      const remainingBeforeScore = previousRow?.players?.[playerId]?.remaining ?? x01;
      const remainingAfterScore = remainingBeforeScore - roundScore.score;
      playersRoundInfoMap[playerId] = {
        score: roundScore.score,
        remaining: remainingAfterScore
      };

      // Set the darts thrown of the row to the least darts thrown.
      minDartsThrown = Math.min(minDartsThrown, roundScore.dartsUsed);
    });

    return {
      round: round.round,
      dartsThrown: (previousRow?.dartsThrown ?? 0) + minDartsThrown,
      players: playersRoundInfoMap
    };
  }

  /**
   * Finds the latest round information for each player based on the round rows.
   *
   * @param rows The full list of round rows for the leg.
   * @param players The list of players in the match.
   * @returns A map from player ID to their most recent round info.
   */
  private createLatestPlayerRoundInfoMap(rows: X01RoundTableRow[], players: X01MatchPlayer[]): PlayerMap<X01PlayerRoundInfo> {
    const latestPlayerRoundInfoMap: PlayerMap<X01PlayerRoundInfo> = {};
    const playersToFind = new Set(players.map(player => player.playerId));
    const reversedRows = rows.slice().reverse();

    // Iterate through the rows in reverse order to find the most recent round info for each player. Stop when all players are found.
    for (const row of reversedRows) {
      Object.entries(row.players).forEach(([playerId, playerRoundInfo]) => {
        if (playersToFind.has(playerId)) {
          latestPlayerRoundInfoMap[playerId] = playerRoundInfo;
          playersToFind.delete(playerId);
        }
      });

      if (playersToFind.size === 0) break;
    }

    return latestPlayerRoundInfoMap;
  }

  /**
   * Generates leg statistics for a player
   *
   * @param player The player whose stats are being generated.
   * @param set The parent set.
   * @param leg The current leg.
   * @param x01 The starting score for the leg.
   * @param playerWinTracker Optional tracker for updating legs/sets won.
   * @param latestPlayerRoundInfo The latest round score and remaining info for the player.
   * @returns Leg stats for the player.
   */
  private async createPlayerLegStats(
    player: X01MatchPlayer, set: X01Set, leg: X01Leg, x01: number,
    playerWinTracker?: PlayerWinTracker, latestPlayerRoundInfo?: X01PlayerRoundInfo
  ): Promise<X01MatchPlayerLegStats> {
    // Get the remaining score at the players' latest round. If the player doesn't have a round yet set it to the match x01.
    const remaining = latestPlayerRoundInfo?.remaining ?? x01;

    if (playerWinTracker) {
      // Increment legs won if the player has won this leg.
      if (leg.winner === player.playerId) playerWinTracker.legsWon++;

      // Increment sets won if this is the last leg in a set and the player won or drawn the set.
      if (set.legs.length === leg.leg && set.result) {
        const playerResult = set.result[player.playerId];
        if (playerResult === ResultType.WIN || playerResult === ResultType.DRAW) playerWinTracker.setsWon++;
      }
    }

    // Create and return the player leg stats.
    return {
      legsWonInSet: playerWinTracker?.legsWon ?? 0,
      setsWon: playerWinTracker?.setsWon ?? 0,
      remainingInLeg: remaining,
      lastScore: latestPlayerRoundInfo?.score,
      suggestedCheckout: await this.createCheckoutMessage(remaining)
    };
  }

  /**
   * Creates a user-friendly formatted checkout string.
   *
   * @param remaining The remaining points a user needs to finish the leg
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
