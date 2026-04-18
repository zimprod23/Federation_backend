// export class LicenseNumber {
//   private constructor(public readonly value: string) {}

//   /**
//    * Generates a license number matching the federation format:
//    * CNPR/PR014  →  {clubCode}/{clubShort}{sequence}
//    *
//    * Example:
//    *   clubCode  = "CNPR"
//    *   clubShort = "PR"
//    *   sequence  = 14
//    *   result    = "CNPR/PR014"
//    *
//    * If no club — falls back to federation-level format:
//    *   FED/FED00042
//    */
//   static generate(
//     sequence: number,
//     clubCode?: string,
//     clubShort?: string,
//     season?: number,
//     dateOfBirth?: string,
//   ): string {
//     const padded = String(sequence).padStart(3, "0");

//     if (clubCode && clubShort) {
//       return `${clubCode.toUpperCase()}/${clubShort.toUpperCase()}${padded}`;
//     }

//     // No club assigned — use federation prefix
//     const paddedFed = String(sequence).padStart(5, "0");
//     return `FED/FED${paddedFed}`;
//   }

//   static isValid(raw: string): boolean {
//     // Accepts: CNPR/PR014  or  FED/FED00042
//     return /^[A-Z]+\/[A-Z]+\d+$/.test(raw);
//   }
// }
export class LicenseNumber {
  private constructor(public readonly value: string) {}

  /**
   * Format: {clubShort}-{seasonYY}{clubCodeYY}{birthYY}{sequence00000}
   * Example: CNPR-26019200001
   */
  static generate(
    sequence: number,
    clubCode: string, // Now required based on your example
    clubShort: string, // Now required based on your example
    season: number,
    dateOfBirth: string,
  ): string {
    // 1. Get last two digits of season (e.g., 2026 -> 26)
    const seasonYY = String(season).slice(-2);

    // 2. Ensure clubCode is 2 digits (e.g., "1" -> "01")
    const paddedClubCode = String(clubCode).padStart(2, "0");

    // 3. Get last two digits of birth year (e.g., 1992 -> 92)
    const birthDate = new Date(dateOfBirth);
    const birthYY = String(birthDate.getFullYear()).slice(-2);

    // 4. Pad sequence to 4 digits
    const paddedSeq = String(sequence).padStart(4, "0");

    // Construct: CNPR-26019200001
    // return `${clubShort.toUpperCase()}-${seasonYY}${paddedClubCode}${birthYY}${paddedSeq}`;
    // return `${seasonYY}${paddedClubCode}${birthYY}${paddedSeq}`;
    return `${paddedClubCode}${paddedSeq}`;
  }

  static isValid(raw: string): boolean {
    // Regex: Letters-Digits (at least 11 digits following the dash)
    return /^[A-Z]+-\d{11}$/.test(raw);
  }
}
