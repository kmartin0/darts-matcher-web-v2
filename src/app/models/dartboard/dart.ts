import {DartboardSection} from './dartboard-section';
import {DartboardSectionArea} from './dartboard-section-area';

export interface Dart {
  section: DartboardSection;
  area: DartboardSectionArea;
  score: number;
}

