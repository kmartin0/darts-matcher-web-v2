import {Injectable} from '@angular/core';
import {X01Match} from '../../../../models/x01-match/x01-match';
import {
  InformationCardData,
  InformationCardSection
} from '../../../../shared/components/information-card/information-card-data';
import {X01ResultStatistics} from '../../../../models/x01-match/x01-result-statistics';
import {X01AverageStatistics} from '../../../../models/x01-match/x01-average-statistics';
import {X01Statistics} from '../../../../models/x01-match/x01-statistics';
import {X01CheckoutStatistics} from '../../../../models/x01-match/x01-checkout-statistics';


@Injectable({providedIn: 'root'})
export class X01MatchStatisticsCardMapperService {

  /**
   * Maps each player to their InformationCardData.
   *
   * @param match The match object containing player statistics.
   * @returns An array of InformationCardData for each player.
   */
  mapToCardsData(match: X01Match | null): InformationCardData[] | null {
    if (!match) return null;

    return match.players.flatMap(player => {
      const test: InformationCardData = {
        header: player.playerName,
        sections: [
          this.createResultSection(player.statistics.resultStatistics),
          this.createScoreSection(player.statistics),
          this.createAverageSection(player.statistics.averageStats),
          this.createCheckoutSection(player.statistics.checkoutStats, match.matchSettings.trackDoubles)
        ]
      };
      return test;
    });
  }

  /**
   * Creates the Result section for an information card.
   *
   * @param resultStatistics The result statistics of a player.
   * @returns An InformationCardSection for displaying result stats.
   */
  private createResultSection(resultStatistics: X01ResultStatistics): InformationCardSection {
    return {
      sectionHeader: 'Result',
      rows: [
        {label: 'Sets', value: resultStatistics.setsWon},
        {label: 'Legs', value: resultStatistics.legsWon},
      ]
    };
  }

  /**
   * Creates the Score section for an information card.
   *
   * @param playerStatistics The statistics of a player.
   * @returns An InformationCardSection for displaying score stats.
   */
  private createScoreSection(playerStatistics: X01Statistics): InformationCardSection {
    const scoreStatistics = playerStatistics.scoreStatistics;
    const averageStatistics = playerStatistics.averageStats;

    return {
      sectionHeader: 'Score',
      rows: [
        {label: '40+', value: scoreStatistics.fortyPlus},
        {label: '60+', value: scoreStatistics.sixtyPlus},
        {label: '80+', value: scoreStatistics.eightyPlus},
        {label: '100+', value: scoreStatistics.tonPlus},
        {label: '140+', value: scoreStatistics.tonFortyPlus},
        {label: '180', value: scoreStatistics.tonEighty},
        {label: 'Points thrown', value: averageStatistics.pointsThrown},
        {label: 'Darts thrown', value: averageStatistics.dartsThrown},
      ]
    };
  }

  /**
   * Creates the Average section for an information card.
   *
   * @param averageStatistics The average statistics of a player.
   * @returns An InformationCardSection for displaying average stats.
   */
  private createAverageSection(averageStatistics: X01AverageStatistics): InformationCardSection {
    return {
      sectionHeader: 'Average',
      rows: [
        {label: '3-Dart', value: averageStatistics.average},
        {label: 'First-9', value: averageStatistics.averageFirstNine},
      ]
    };
  }

  /**
   * Creates the Checkout section for an information card.
   *
   * @param checkoutStatistics The checkout statistics of a player.
   * @param trackDoubles Whether the match is tracking doubles.
   * @returns An InformationCardSection for displaying checkout stats.
   */
  private createCheckoutSection(checkoutStatistics: X01CheckoutStatistics, trackDoubles: boolean): InformationCardSection {
    return {
      sectionHeader: 'Checkout',
      rows: [
        {label: 'Highest', value: checkoutStatistics.checkoutHighest},
        {label: '100+', value: checkoutStatistics.checkoutTonPlus},
        {label: 'Doubles Hit', value: checkoutStatistics.checkoutsHit},
        ...(trackDoubles) ? [
          {label: 'Doubles Missed', value: checkoutStatistics.checkoutsMissed},
          {label: 'Doubles Percentage', value: checkoutStatistics.checkoutPercentage ?? 0 + '%'},
        ] : []
      ]
    };
  }
}
