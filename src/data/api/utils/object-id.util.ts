/**
 * Checks whether a value is a valid MongoDB ObjectId.
 *
 * @param value - Value to check.
 * @returns Whether the value is a 24-character hexadecimal ObjectId.
 */
export function isValidObjectId(value: string | null): value is string {
  return value !== null && /^[0-9a-fA-F]{24}$/.test(value);
}
