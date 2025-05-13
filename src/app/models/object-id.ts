export class ObjectId {
  private readonly value: string;

  constructor(value: string) {
    // Check that the value is a valid ObjectId (24 hexadecimal characters)
    if (!ObjectId.isValid(value)) {
      throw new Error(`Invalid ObjectId format: ${value}`);
    }
    this.value = value;
  }

  /**
   * Validate if a string value is a valid ObjectId.
   * A valid object id is a 24-character hexadecimal string (a to f in lower and uppercase or number 0 to 9).
   *
   * @param value - The value to be checked
   */
  static isValid(value: string): boolean {
    // ObjectId must be 24 characters long and match the pattern [a-fA-F0-9]
    return /^[a-fA-F0-9]{24}$/.test(value);
  }

  /**
   * Get the ObjectId value as a string.
   */
  get valueAsString(): string {
    return this.value;
  }

  /**
   * Override the toString method to return the ObjectId as a string
   */
  toString(): string {
    return this.valueAsString;
  }
}
