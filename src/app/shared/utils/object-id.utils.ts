/**
 * Validate if a string value is a valid ObjectId.
 * A valid object id is a 24-character hexadecimal string (a to f in lower and uppercase or number 0 to 9).
 *
 * @param value - The value to be checked
 */
export function isValidObjectId(value: string): boolean {
  // ObjectId must be 24 characters long and match the pattern [a-fA-F0-9]
  return /^[a-fA-F0-9]{24}$/.test(value);
}
