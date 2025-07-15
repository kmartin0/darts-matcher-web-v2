export function appendInteger(currentInt: number, appendInt: number): number {
  if (!Number.isInteger(currentInt) || !Number.isInteger(appendInt)) {
    throw new Error('Both arguments must be integers.');
  }

  if (appendInt && appendInt < 0) {
    throw new Error('appendInt must be non-negative.');
  }

  return parseInt(currentInt.toString() + appendInt.toString(), 10);
}

export function removeLastDigit(currentInt: number | undefined): number | undefined {
  if (currentInt == undefined) return undefined;

  if (!Number.isInteger(currentInt)) {
    throw new Error('Argument must be an integer.');
  }

  const newInt = parseInt(currentInt.toString().slice(0, -1), 10);

  return Number.isNaN(newInt) ? undefined : newInt;
}

/**
 * Converts an epoch timestamp in seconds to a Date object. Returns null if input is invalid.
 *
 * @param epochSeconds - Unix timestamp in seconds
 */
export function epochSecondsToDate(epochSeconds: number): Date | null {
  if (isNaN(epochSeconds)) return null;

  const date = new Date(epochSeconds * 1000);
  return isNaN(date.getTime()) ? null : date;
}
