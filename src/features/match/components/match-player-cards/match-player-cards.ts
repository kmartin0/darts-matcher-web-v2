import {Component, computed, ElementRef, input, viewChildren} from '@angular/core';
import {X01CheckoutsMap} from '../../../../data/model/x01/checkout/x01-checkout';
import {X01Match} from '../../../../data/model/x01/match/x01-match';
import {LegSelection} from '../match-board/leg-selection';
import {MatchPlayerCard} from '../match-player-card/match-player-card';
import {MatchPlayerCardData} from '../match-player-card/match-player-card-data';
import {resolveMatchPlayerCards} from './match-player-cards.resolver';
import {X01MatchTimeline, X01MatchTimelineLegEntry} from '../../../../data/model/x01/timeline/x01-match-timeline';
import {MatchTimelineBuilder} from '../../builders/match-timeline.builder';

@Component({
  selector: 'app-match-player-cards',
  imports: [
    MatchPlayerCard
  ],
  templateUrl: './match-player-cards.html',
  styleUrl: './match-player-cards.scss'
})
export class MatchPlayerCards {
  readonly match = input.required<X01Match>();
  readonly legSelection = input.required<LegSelection>();
  readonly checkouts = input.required<X01CheckoutsMap>();

  private readonly playerCardElements = viewChildren(
    'playerCardElement',
    {read: ElementRef<HTMLElement>}
  );

  private readonly timeline = computed<X01MatchTimeline>(() =>
    MatchTimelineBuilder.build(this.match())
  );

  protected readonly playerCards = computed<MatchPlayerCardData[]>(() =>
    resolveMatchPlayerCards(
      this.match(),
      this.legSelection().setEntry.setNumber,
      this.getSelectedTimelineLegEntry(this.timeline(), this.legSelection()),
      this.checkouts()
    )
  );

  /**
   * Gets the rendered card for the current thrower.
   *
   * @returns Current thrower's card element, or null when none is displayed.
   */
  getCurrentThrowerElement(): HTMLElement | null {
    const index = this.playerCards().findIndex(
      playerCard => playerCard.isCurrentThrower
    );

    return index === -1
      ? null
      : this.playerCardElements().at(index)?.nativeElement ?? null;
  }

  /**
   * Gets the timeline entry for the selected leg.
   *
   * @param timeline - Timeline built from the match.
   * @param legSelection - Selected set and leg.
   * @returns Timeline entry for the selected leg.
   * @throws When the selected leg has no timeline entry.
   */
  private getSelectedTimelineLegEntry(timeline: X01MatchTimeline, legSelection: LegSelection): X01MatchTimelineLegEntry {
    const setNumber = legSelection.setEntry.setNumber;
    const legNumber = legSelection.legEntry.legNumber;
    const timelineLegEntry = timeline.setEntries.get(setNumber)?.legEntries.get(legNumber);

    if (timelineLegEntry === undefined) {
      throw new Error(
        `Missing timeline entry for set '${setNumber}', leg '${legNumber}'.`
      );
    }

    return timelineLegEntry;
  }
}
