export interface ApiTargetErrors {
  [target: string]: string;
}

/**
 * Checks whether a value matches the API target errors contract.
 *
 * @param value - Value to check.
 * @returns Whether the value contains valid API target errors.
 */
export function isApiTargetErrors(value: unknown): value is ApiTargetErrors {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every(error => typeof error === 'string')
  );
}
