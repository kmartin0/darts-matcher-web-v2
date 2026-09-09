/**
 * Parses a JSON string when possible.
 *
 * @param value - Value to parse.
 * @returns Parsed JSON value, or the original string when parsing fails.
 */
export function tryParseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}
