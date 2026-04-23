import { IClubRepository, IMemberRepository } from "../../../domain/interfaces";
import { ClubNotFoundError, MemberNotFoundError } from "../../../domain/errors";
import { LicenseNumber } from "../../../domain/value-objects/LicenceNumber";
import { Member } from "../../../domain/entities/Member";

export interface AdjustLicenseNumberDTO {
  clubId?: string; // If provided, only adjust members of this club
  season?: number; // If provided, only adjust members of this season
}

export interface AdjustLicenseNumberResponseDTO {
  adjustedCount: number;
  skippedCount: number;
  totalProcessed: number;
}

/**
 * Use case to regenerate license numbers for existing members
 * based on the updated license number format.
 *
 * This is useful when the license number structure changes.
 * Extracts sequence from existing license and regenerates using new format.
 */
export class AdjustLicenseNumberUseCase {
  constructor(
    private readonly memberRepo: IMemberRepository,
    private readonly clubRepo: IClubRepository,
  ) {}

  async execute(
    dto: AdjustLicenseNumberDTO,
  ): Promise<AdjustLicenseNumberResponseDTO> {
    const filters: Record<string, unknown> = {};
    if (dto.clubId) filters.memberId = dto.clubId;
    if (dto.season) filters.season = dto.season;

    // Fetch all members with pagination
    const pageSize = 100;
    let page = 1;
    let adjustedCount = 0;
    let skippedCount = 0;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const result = await this.memberRepo.findAll(
        { page, limit: pageSize },
        filters,
      );

      for (const member of result.data) {
        try {
          const newLicenseNumber = await this.regenerateLicenseNumber(member);

          if (newLicenseNumber !== member.licenseNumber) {
            const updated = new Member({
              ...member.toProps(),
              licenseNumber: newLicenseNumber,
            });
            await this.memberRepo.save(updated);
            adjustedCount++;
          } else {
            skippedCount++;
          }
        } catch (error) {
          console.error(
            `Failed to adjust license for member ${member.id}:`,
            error,
          );
          skippedCount++;
        }
      }

      // Check if there are more pages
      if (result.data.length < pageSize) {
        break;
      }
      page++;
    }

    return {
      adjustedCount,
      skippedCount,
      totalProcessed: adjustedCount + skippedCount,
    };
  }

  private async regenerateLicenseNumber(member: Member): Promise<string> {
    // Extract sequence from current license number
    // Current format: {clubCode}{sequence}
    // E.g., "00001", "0142"
    const sequence = this.extractSequence(member.licenseNumber);

    let clubCode = "00";
    let clubShort = "FED";

    if (member.clubId) {
      const club = await this.clubRepo.findById(member.clubId);
      if (!club) {
        throw new ClubNotFoundError(member.clubId);
      }
      clubCode = club.code;
      clubShort = club.clubShort;
    }

    return LicenseNumber.generate(
      sequence,
      clubCode,
      clubShort,
      member.season,
      member.dateOfBirth.toISOString(),
    );
  }

  /**
   * Extract sequence number from license number.
   * Assumes license format is {clubCode}{sequence}
   * Latest format considers last 3 digits as sequence
   */
  private extractSequence(licenseNumber: string): number {
    // Extract last 3 digits as sequence
    const match = licenseNumber.match(/(\d{3})$/);
    if (match) {
      return parseInt(match[1], 10);
    }

    // Fallback: try parsing the entire numeric part
    const numMatch = licenseNumber.match(/\d+/);
    if (numMatch) {
      return parseInt(numMatch[0], 10);
    }

    // Default to 1 if unable to extract
    return 1;
  }
}
