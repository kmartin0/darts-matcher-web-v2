import {Injectable} from '@angular/core';
import {X01LegTableDataSource, X01LegTableRow, X01LegTableRowPlayerData} from '../x01-leg-table-data-source';
import {X01Match} from '../../../../../models/x01-match/x01-match';
import {X01MatchPlayer} from '../../../../../models/x01-match/x01-match-player';
import {X01Set} from '../../../../../models/x01-match/x01-set';
import {X01Leg} from '../../../../../models/x01-match/x01-leg';
import {X01LegRound} from '../../../../../models/x01-match/x01-leg-round';
import {PlayerMap} from '../../../../../types/player-map';
import {X01MatchLegTableViewData} from './x01-match-leg-table-view-data';
import {X01LegTableSetsMap} from './x01-match-leg-table-sets-map';
import {X01LegTableLegsMap} from './x01-leg-table-legs-map';
import {LegSelection} from '../../../../../models/common/leg-selection';
import {X01MatchLegTableColumnDefinitions} from './x01-match-leg-table-column-definitions';
import {X01MatchProgress} from '../../../../../models/x01-match/x01-match-progress';

@Injectable({providedIn: 'root'})
export class X01MatchLegTableViewDataTransformer {

  /**
   * Transforms a match and leg selection into table view data used for rendering.
   *
   * @param match The full X01 match object.
   * @param legSelection The currently selected set/leg combination.
   * @returns The view data structure or null if no match is provided.
   */
  transform(match: X01Match | null, legSelection: LegSelection | null): X01MatchLegTableViewData | null {
    if (!match) return null;

    const columnDefinitions = this.createColumnDefinitions(match.players);
    const displayedColumns = this.createDisplayedColumns(columnDefinitions);
    const tables = this.createMatchTablesMap(match);
    const selectedLegTable = this.getSelectedLegTable(tables, legSelection?.set ?? 0, legSelection?.leg ?? 0);

    return {
      columnDefinitions: columnDefinitions,
      displayedColumns: displayedColumns,
      matchTableDataSource: new X01LegTableDataSource(selectedLegTable),
      tables: tables,
    };
  }

  /**
   * Retrieves a leg table for a given set and leg number.
   *
   * @param tables The complete tables map for all sets and legs.
   * @param selectedSet The set number to access.
   * @param selectedLeg The leg number within the selected set.
   * @returns An array of table rows for the selected leg, or an empty array.
   */
  getSelectedLegTable(tables: X01LegTableSetsMap, selectedSet: number, selectedLeg: number) {
    return tables.sets[selectedSet]?.legs[selectedLeg] ?? [];
  }

  /**
   * Generates column metadata for all table columns. A table consists of a round and a darts column. And
   * for each player a score and to go column.
   *
   * @param players The list of match players.
   * @returns The column definitions.
   */
  private createColumnDefinitions(players: X01MatchPlayer[]): X01MatchLegTableColumnDefinitions {
    // Create the column definitions containing column label and if per column.
    const columnDefinitions: X01MatchLegTableColumnDefinitions = {
      default: {
        id: 'default',
        labels: {
          round: 'Round',
          darts: 'Darts'
        }
      },
      players: {}
    };

    // Populate the player columns where each player has a score and to go column.
    players.forEach(player => {
      const playerId = player.playerId.toString();
      columnDefinitions.players[playerId] = {
        score: 'Score',
        remaining: 'To Go'
      };
    });

    // Return the column definitions.
    return columnDefinitions;
  }

  /**
   * Constructs an ordered array of displayed column IDs from the column definitions.
   * Splits player columns around the non-player columns (round and darts).
   *
   * @param columnDefinitions The definitions for all table columns.
   * @returns An ordered list of column IDs for rendering.
   */
  private createDisplayedColumns(columnDefinitions: X01MatchLegTableColumnDefinitions): string[] {
    const playerCols = Object.keys(columnDefinitions.players);

    // Split player IDs into two halves
    const half = Math.floor(playerCols.length / 2);
    const leftPlayers = playerCols.slice(0, half);
    const rightPlayers = playerCols.slice(half);

    return [...leftPlayers, columnDefinitions.default.id, ...rightPlayers];
  }

  /**
   * Builds a nested map of leg tables for each set and leg in the match.
   *
   * @param match The match containing sets and legs.
   * @returns A nested mapping structure of leg tables.
   */
  private createMatchTablesMap(match: X01Match): X01LegTableSetsMap {
    const setsMap: Record<number, X01LegTableLegsMap> = {};
    match.sets.forEach(set => {
      setsMap[set.set] = this.createLegsMap(match, set);
    });

    return {sets: setsMap};
  }

  /**
   * Builds a map of leg tables for a specific set.
   *
   * @param match Match metadata for the legs map
   * @param set The set containing multiple legs.
   * @returns A map of leg number to table rows.
   */
  private createLegsMap(match: X01Match, set: X01Set): X01LegTableLegsMap {
    const legTableMap: Record<number, X01LegTableRow[]> = {};
    set.legs.forEach(leg => {
      legTableMap[leg.leg] = this.createLegTable(match, set, leg);
    });

    return {legs: legTableMap};
  }

  /**
   * Builds a leg table for a leg.
   *
   * @param match Match metadata for the leg table
   * @param set Set metadata for the leg table
   * @param leg The leg to transform into a table.
   * @returns A list of rows representing each round in the leg.
   */
  private createLegTable(match: X01Match, set: X01Set, leg: X01Leg): X01LegTableRow[] {
    const legTable: X01LegTableRow[] = [];
    let previousRow: X01LegTableRow | null = null;

    // Each round represents a table row.
    Object.entries(leg.rounds).forEach(([roundNumber, round]) => {
      const row = this.createRoundTableRow(match, set, leg, round, Number(roundNumber), previousRow);
      previousRow = row;
      legTable.push(row);
    });

    return legTable;
  }

  /**
   * builds a single round into a table row. A row consists of the round number, minimum number of darts thrown.
   * And for each player their score and remaining (after score).
   *
   * @param match Match metadata for row
   * @param set Set metadata for the row
   * @param leg Leg metadata for the row
   * @param round The round to transform.
   * @param roundNumber The number of the round.
   * @param previousRow The previous round row (for cumulative data).
   * @returns A single table row representing the round.
   */
  private createRoundTableRow(
    match: X01Match,
    set: X01Set,
    leg: X01Leg,
    round: X01LegRound,
    roundNumber: number,
    previousRow: X01LegTableRow | null
  ): X01LegTableRow {
    // Initialize the players round info map and default number of darts thrown.
    const playersRoundInfoMap: PlayerMap<X01LegTableRowPlayerData> = {};

    // Create row player round info for each player that scored in the round.
    Object.entries(round.scores).forEach(([playerId, roundScore]) => {
      const remainingBeforeScore = previousRow?.players?.[playerId]?.remaining ?? match.matchSettings.x01;
      const remainingAfterScore = remainingBeforeScore - roundScore.score;
      playersRoundInfoMap[playerId] = {
        score: roundScore.score,
        remaining: remainingAfterScore,
        doublesMissed: roundScore.doublesMissed
      };
    });

    // Set the darts thrown of the row to the least darts thrown.
    const dartsUsedThisRound = leg.winner != null && leg.checkoutDartsUsed != null // TODO: CHANGED
      ? (roundNumber === Object.keys(leg.rounds).length ? leg.checkoutDartsUsed : 3)
      : 3;

    return {
      round: roundNumber,
      dartsThrown: (previousRow?.dartsThrown ?? 0) + dartsUsedThisRound,
      players: playersRoundInfoMap,
      currentThrower: this.getActiveThrowerForRound(match.matchProgress, set.set, leg.leg, roundNumber)
    };
  }

  /**
   * Determines if the given round corresponds to the currently active turn in the match.
   * If this round is the `current` round, it will return the current players' ID.
   *
   * @param matchProgress The progress for the match
   * @param setNumber The set number in the match.
   * @param legNumber The leg number in the set.
   * @param roundNumber The round number in the leg.
   * @returns The ID of the current thrower if the round matches the `current` round, otherwise `undefined`.
   */
  private getActiveThrowerForRound(matchProgress: X01MatchProgress, setNumber: number, legNumber: number, roundNumber: number): string | undefined {
    if (!matchProgress.currentThrower) return undefined;

    const isCurrentRound =
      matchProgress.currentSet === setNumber &&
      matchProgress.currentLeg === legNumber &&
      matchProgress.currentRound === roundNumber;

    return isCurrentRound ? matchProgress.currentThrower : undefined;
  }

}
