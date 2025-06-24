export interface X01EditScoreDialogData {
  playerId: string;
  playerName: string;
  matchId: string;
  set: number;
  leg: number;
  round: number;
  currentScore: number;
  doublesMissed: number | null;
}

export function isX01EditScoreDialogData(obj: any): obj is X01EditScoreDialogData {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    typeof obj.playerId === 'string' &&
    typeof obj.playerName === 'string' &&
    typeof obj.matchId === 'string' &&
    typeof obj.set === 'number' &&
    typeof obj.leg === 'number' &&
    typeof obj.round === 'number' &&
    typeof obj.currentScore === 'number' &&
    (typeof obj.doublesMissed === 'number' || obj.doublesMissed === null)
  );
}

export interface X01EditScoreDialogResult {
  playerId: string;
  matchId: string;
  set: number;
  leg: number;
  round: number;
  oldScore: number;
  newScore: number;
  oldDoublesMissed: number | null;
  newDoublesMissed: number | null;
}
