export function isValidObjectId(value: string | null): value is string {
  return value !== null && /^[0-9a-fA-F]{24}$/.test(value);
}
