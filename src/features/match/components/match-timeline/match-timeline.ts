import {Component, computed, input} from '@angular/core';
import {X01Match} from '../../../../data/model/x01/match/x01-match';
import {MatchTimelineLegCard} from '../match-timeline-leg-card/match-timeline-leg-card';
import {
  MatchTimelineData,
  resolveMatchTimeline
} from './match-timeline.resolver';

@Component({
  selector: 'app-match-timeline',
  imports: [
    MatchTimelineLegCard
  ],
  templateUrl: './match-timeline.html',
  styleUrl: './match-timeline.scss'
})
export class MatchTimeline {
  readonly match = input.required<X01Match>();

  protected readonly timeline = computed<MatchTimelineData>(() =>
    resolveMatchTimeline(this.match())
  );
}
