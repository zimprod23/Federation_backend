export class LicenseNumber {
  private constructor(public readonly value: string) {}

  /**
   * Generates a license number matching the federation format:
   * CNPR/PR014  →  {clubCode}/{clubShort}{sequence}
   *
   * Example:
   *   clubCode  = "CNPR"
   *   clubShort = "PR"
   *   sequence  = 14
   *   result    = "CNPR/PR014"
   *
   * If no club — falls back to federation-level format:
   *   FED/FED00042
   */
  static generate(
    sequence: number,
    clubCode?: string,
    clubShort?: string,
  ): string {
    const padded = String(sequence).padStart(3, "0");

    if (clubCode && clubShort) {
      return `${clubCode.toUpperCase()}/${clubShort.toUpperCase()}${padded}`;
    }

    // No club assigned — use federation prefix
    const paddedFed = String(sequence).padStart(5, "0");
    return `FED/FED${paddedFed}`;
  }

  static isValid(raw: string): boolean {
    // Accepts: CNPR/PR014  or  FED/FED00042
    return /^[A-Z]+\/[A-Z]+\d+$/.test(raw);
  }
}
