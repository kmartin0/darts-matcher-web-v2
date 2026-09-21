import {Component, computed, input} from '@angular/core';
import {MatCard, MatCardContent} from '@angular/material/card';
import {MatIcon} from '@angular/material/icon';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable
} from '@angular/material/table';
import {X01BestOfType} from '../../../../data/model/x01/rules/x01-best-of-type';
import {
  MatchTimelineLegCardData,
  MatchTimelineLegCardPlayerData
} from './match-timeline-leg-card-data';

interface MatchTimelineLegCardRow {
  playerId: string;
  initials: string;

  startsLeg: boolean;
  winsLeg: boolean;

  setsWon: number;
  legsWonInSet: number;

  dartsUsed: number;
  average: number | null;
  remaining: number;
  doublesMissed: number;
}

@Component({
  selector: 'app-match-timeline-leg-card',
  imports: [
    MatCard,
    MatCardContent,
    MatTable,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatCell,
    MatCellDef,
    MatIcon
  ],
  templateUrl: './match-timeline-leg-card.html',
  styleUrl: './match-timeline-leg-card.scss'
})
export class MatchTimelineLegCard {
  readonly data = input.required<MatchTimelineLegCardData>();

  protected readonly X01BestOfType = X01BestOfType;

  protected readonly displayedColumns = computed<string[]>(() =>
    this.createDisplayedColumns(this.data().trackDoubles)
  );

  protected readonly starterInitials = computed<string | null>(() =>
    this.getStarterInitials(this.data())
  );

  protected readonly winnerInitials = computed<string | null>(() =>
    this.getWinnerInitials(this.data())
  );

  protected readonly rows = computed<MatchTimelineLegCardRow[]>(() =>
    this.createRows(this.data())
  );

  /**
   * Tracks table rows by player ID.
   *
   * @param _index - Row index, which is not used.
   * @param row - Player row being tracked.
   * @returns Player ID identifying the row.
   */
  protected trackByPlayerId(_index: number, row: MatchTimelineLegCardRow): string {
    return row.playerId;
  }

  /**
   * Creates the table columns enabled by the match settings.
   *
   * @param trackDoubles - Whether to include the checkout column.
   * @returns Ordered table column IDs.
   */
  private createDisplayedColumns(trackDoubles: boolean): string[] {
    return [
      'player',
      'score',
      'darts',
      'average',
      'remaining',
      ...(trackDoubles ? ['checkout'] : [])
    ];
  }

  /**
   * Gets the initials of the player who starts the leg.
   *
   * @param data - Timeline leg-card data.
   * @returns Starter initials, or null when the player cannot be found.
   */
  private getStarterInitials(data: MatchTimelineLegCardData): string | null {
    return data.players.find(
      player => player.playerId === data.throwsFirst
    )?.playerTag ?? null;
  }

  /**
   * Gets the initials of the player who wins the leg.
   *
   * @param data - Timeline leg-card data.
   * @returns Winner initials, or null when no matching winner is available.
   */
  private getWinnerInitials(data: MatchTimelineLegCardData): string | null {
    return data.players.find(
      player => player.playerId === data.winner
    )?.playerTag ?? null;
  }

  /**
   * Creates player rows in the supplied player order.
   *
   * @param data - Timeline leg-card data.
   * @returns Table rows for the displayed leg.
   */
  private createRows(data: MatchTimelineLegCardData): MatchTimelineLegCardRow[] {
    return data.players.map(player => this.createRow(data, player));
  }

  /**
   * Creates a table row from the player's resolved values.
   *
   * @param data - Timeline leg-card data.
   * @param player - Player identity, standing, and leg statistics.
   * @returns Table row for the player.
   */
  private createRow(
    data: MatchTimelineLegCardData,
    player: MatchTimelineLegCardPlayerData
  ): MatchTimelineLegCardRow {
    return {
      playerId: player.playerId,
      initials: player.playerTag,

      startsLeg: data.throwsFirst === player.playerId,
      winsLeg: data.winner === player.playerId,

      setsWon: player.standing.setsWon,
      legsWonInSet: player.standing.legsWonInCurrentSet,

      dartsUsed: player.dartsUsed,
      average: player.average,
      remaining: player.remaining,
      doublesMissed: player.doublesMissed
    };
  }
}
