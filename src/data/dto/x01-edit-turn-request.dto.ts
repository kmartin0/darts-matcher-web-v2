import {X01CreateTurnRequestDto} from './x01-create-turn-request.dto';

export interface X01EditTurnRequestDto extends X01CreateTurnRequestDto {
  playerId: string;
  set: number;
  leg: number;
  round: number;
}
