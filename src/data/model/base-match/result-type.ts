export enum ResultType {
  WIN = 'WIN',
  LOSS = 'LOSS',
  DRAW = 'DRAW',
}

/**
 * Checks whether a result represents a win or draw.
 *
 * @param resultType - Result type to check.
 * @returns Whether the result is a win or draw.
 */
export function isWinOrDrawResult(resultType: ResultType | null): boolean {
  return resultType === ResultType.WIN || resultType === ResultType.DRAW;
}
