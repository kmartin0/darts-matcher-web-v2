/**
 * Checks whether a value is a valid MongoDB ObjectId.
 *
 * @param value - Value to check.
 * @returns Whether the value is a 24-character hexadecimal ObjectId.
 */
export function isValidObjectId(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-fA-F]{24}$/.test(value);
}
