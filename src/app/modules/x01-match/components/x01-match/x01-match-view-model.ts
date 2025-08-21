import {LegSelection} from '../../../../models/common/leg-selection';

export interface X01MatchViewModel {
  legSelection: LegSelection | null;
  errorMsg: string | undefined;
  editScoreMode: boolean;
  displayScoreInput: boolean;
  displayUndoScore: boolean;
}
