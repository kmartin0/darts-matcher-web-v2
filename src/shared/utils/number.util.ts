/**
 * Converts an epoch timestamp in seconds to a Date object. Returns null if input is invalid.
 *
 * @param epochSeconds - Unix timestamp in seconds
 */
export function epochSecondsToDate(epochSeconds: number | null): Date | null {
  if (!epochSeconds || Number.isNaN(epochSeconds)) {
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
 * @param singular - Label used when count is 1.
 * @param plural - Label used for any other count.
 * @returns The count followed by the matching label.
 */
export function formatCount(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
