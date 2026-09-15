import {CreateTurnInput} from '../model/turn-input';
import {X01CreateTurnRequestDto} from '../../../data/dto/x01-create-turn-request.dto';

/**
 * Maps create-turn input to the API request DTO.
 *
 * @param input - Create-turn input to map.
 * @returns Create-turn request DTO.
 */
export function mapToCreateTurnRequestDto(input: CreateTurnInput): X01CreateTurnRequestDto {
  return {
    score: input.score,
    doublesMissed: input.doublesMissed,
    checkoutDartsUsed: input.checkoutDartsUsed
  };
}
