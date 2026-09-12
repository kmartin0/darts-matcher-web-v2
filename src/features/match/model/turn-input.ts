export interface TurnInput {
  score: number;
  checkoutDartsUsed: number | null;
  doublesMissed: number | null;
}

export type CreateTurnInput = TurnInput;

export interface EditTurnInput extends TurnInput {
  playerId: string;
  setNumber: number;
  legNumber: number;
  roundNumber: number;
}
