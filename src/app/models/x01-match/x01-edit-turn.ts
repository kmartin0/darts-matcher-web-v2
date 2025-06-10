import {X01Turn} from './x01-turn';

export interface X01EditTurn extends X01Turn {
  playerId: string;
  set: number;
  leg: number;
  round: number;
}
