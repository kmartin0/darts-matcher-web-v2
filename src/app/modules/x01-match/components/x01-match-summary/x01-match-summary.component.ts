import {Component, Input} from '@angular/core';
import {BaseComponent} from '../../../../shared/components/base/base.component';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import {X01MatchInformationComponent} from '../x01-match-information/x01-match-information.component';
import {X01MatchStatisticsComponent} from '../x01-match-statistics/x01-match-statistics.component';
import {X01MatchTimelineComponent} from '../x01-match-timeline/x01-match-timeline.component';
import {X01Match} from '../../../../models/x01-match/x01-match';

@Component({
  selector: 'app-x01-match-summary',
  imports: [
    MatTabGroup,
    MatTab,
    X01MatchInformationComponent,
    X01MatchStatisticsComponent,
    X01MatchTimelineComponent
  ],
  standalone: true,
  templateUrl: './x01-match-summary.component.html',
  styleUrl: './x01-match-summary.component.scss'
})
export class X01MatchSummaryComponent extends BaseComponent {
  @Input() match: X01Match | null = null;
}
