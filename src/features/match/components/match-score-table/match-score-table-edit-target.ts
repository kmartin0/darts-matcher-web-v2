import {X01Turn} from '../../../../data/model/x01/round/x01-turn';

export interface MatchScoreTableEditTarget {
  playerId: string;
  playerName: string;
  setNumber: number;
  legNumber: number;
  roundNumber: number;
  currentTurn: X01Turn;
}
