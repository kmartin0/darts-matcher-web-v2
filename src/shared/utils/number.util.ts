/**
 * Converts an epoch timestamp in seconds to a Date object.
 *
 * @param epochSeconds - Unix timestamp in seconds.
 * @returns Converted Date object, or null when the input is invalid.
 */
export function epochSecondsToDate(epochSeconds: number | null): Date | null {
  if (epochSeconds === null || Number.isNaN(epochSeconds)) {
    return null;
  }

  const date = new Date(epochSeconds * 1000);

  return Number.isNaN(date.getTime())
    ? null
    : date;
}

/**
 * Formats a count with its matching singular or plural label.
 *
 * @param count - Count to format.
 * @param singular - Label used when the count is 1.
 * @param plural - Label used for any other count.
 * @returns Count followed by the matching label.
 */
export function formatCount(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
