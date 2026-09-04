export enum ValidationErrorKey {
  REQUIRED = 'required',
  MIN_LENGTH = 'minLength',
  MAX_LENGTH = 'maxLength',
  MIN = 'min',
  MAX = 'max',
  MIN_LENGTH_ARRAY = 'minLengthArray',
  MAX_LENGTH_ARRAY = 'maxLengthArray',
  MAX_ONE_BOT = 'maxOneBot',
  BOT_REQUIRES_HUMAN = 'botRequiresHuman',
  INVALID_MATCH_ID = 'invalidMatchId',
  RESOURCE_NOT_FOUND = 'resourceNotFound',
  CUSTOM_ERROR = 'customError',
  UNKNOWN = 'unknown',
}

export type ValidationErrorType =
  | { key: ValidationErrorKey.REQUIRED }
  | { key: ValidationErrorKey.MIN_LENGTH; requiredLength: number }
  | { key: ValidationErrorKey.MAX_LENGTH; requiredLength: number }
  | { key: ValidationErrorKey.MIN; min: number }
  | { key: ValidationErrorKey.MAX; max: number }
  | { key: ValidationErrorKey.MIN_LENGTH_ARRAY; min: number; name: string }
  | { key: ValidationErrorKey.MAX_LENGTH_ARRAY; max: number; name: string }
  | { key: ValidationErrorKey.MAX_ONE_BOT }
  | { key: ValidationErrorKey.BOT_REQUIRES_HUMAN }
  | { key: ValidationErrorKey.INVALID_MATCH_ID }
  | { key: ValidationErrorKey.RESOURCE_NOT_FOUND; resourceName: string; }
  | { key: ValidationErrorKey.CUSTOM_ERROR; message: string }
  | { key: ValidationErrorKey.UNKNOWN };

export class ValidationErrorMessageUtil {
  static getErrorMessage(error: ValidationErrorType): string {
    switch (error.key) {
      case ValidationErrorKey.REQUIRED:
        return this.required();
      case ValidationErrorKey.MIN_LENGTH:
        return this.minLength(error.requiredLength);
      case ValidationErrorKey.MAX_LENGTH:
        return this.maxLength(error.requiredLength);
      case ValidationErrorKey.MIN:
        return this.min(error.min);
      case ValidationErrorKey.MAX:
        return this.max(error.max);
      case ValidationErrorKey.MIN_LENGTH_ARRAY:
        return this.minLengthArray(error.min, error.name);
      case ValidationErrorKey.MAX_LENGTH_ARRAY:
        return this.maxLengthArray(error.max, error.name);
      case ValidationErrorKey.MAX_ONE_BOT:
        return this.maxOneBot();
      case ValidationErrorKey.BOT_REQUIRES_HUMAN:
        return this.botRequiresHuman();
      case ValidationErrorKey.INVALID_MATCH_ID:
        return this.invalidMatchId();
      case ValidationErrorKey.RESOURCE_NOT_FOUND:
        return this.resourceNotFound(error.resourceName);
      case ValidationErrorKey.CUSTOM_ERROR:
        return this.customError(error.message);
      case ValidationErrorKey.UNKNOWN:
        return this.unknown();
    }
  }

  private static required(): string {
    return 'This field is required.';
  }

  private static minLength(requiredLength: number): string {
    return `This field requires a minimum of ${requiredLength} characters.`;
  }

  private static maxLength(requiredLength: number): string {
    return `This field requires a maximum of ${requiredLength} characters.`;
  }

  private static min(min: number): string {
    return `Must be at least ${min}.`;
  }

  private static max(max: number): string {
    return `Must not exceed ${max}.`;
  }

  private static minLengthArray(min: number, name: string): string {
    return `Must be at least ${min} ${name}.`;
  }

  private static maxLengthArray(max: number, name: string): string {
    return `Must not be more than ${max} ${name}.`;
  }

  private static maxOneBot(): string {
    return 'A maximum of one bot is allowed.';
  }

  private static botRequiresHuman(): string {
    return 'A bot game requires a human player.';
  }

  private static invalidMatchId(): string {
    return 'Invalid Match ID';
  }

  private static resourceNotFound(resourceName: string): string {
    return `${resourceName} not found.`;
  }

  private static customError(message: string): string {
    return message;
  }

  private static unknown(): string {
    return 'An unknown error has occurred.';
  }
}
