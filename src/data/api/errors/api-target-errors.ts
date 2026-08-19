export interface ApiTargetErrors {
  [target: string]: string;
}

/**
 * @param value - Value to check.
 * @returns Whether the value contains valid API target errors.
 */
export function isApiTargetErrors(value: unknown): value is ApiTargetErrors {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.values(value).every(error => typeof error === 'string')
  );
}
