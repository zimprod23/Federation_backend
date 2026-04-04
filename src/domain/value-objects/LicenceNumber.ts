export class LicenseNumber {
  private constructor(public readonly value: string) {}

  /**
   * Generates a license number like  FED-2025-00042
   */
  static generate(sequence: number, year: number): string {
    const padded = String(sequence).padStart(5, "0");
    return `FED-${year}-${padded}`;
  }

  static isValid(raw: string): boolean {
    return /^FED-\d{4}-\d{5}$/.test(raw);
  }
}
