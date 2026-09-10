import {X01Turn} from '../../../../data/model/x01/round/x01-turn';
import {PlayerMap} from '../../../../shared/types/player-map';

export interface MatchScoreTableRow {
  roundNumber: number;
  dartsThrown: number;
  turns: PlayerMap<X01Turn>;
  currentThrowerId: string | null;
}
