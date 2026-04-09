import { Member } from "../../../domain/entities/Member";
import {
  ClubNotFoundError,
  MemberAlreadyExistsError,
} from "../../../domain/errors";
import { IClubRepository, IMemberRepository } from "../../../domain/interfaces";
import { MemberStatus } from "../../../domain/value-objects";
import { LicenseNumber } from "../../../domain/value-objects/LicenceNumber";
import { CreateMemberDTO, MemberResponseDTO } from "../../dtos";
import { toMemberResponse } from "./toMemberResponse";

// export class CreateMemberUseCase {
//   constructor(
//     private readonly memberRepo: IMemberRepository,
//     private readonly clubRepo: IClubRepository,
//   ) {}

//   async execute(dto: CreateMemberDTO): Promise<MemberResponseDTO> {
//     const existing = await this.memberRepo.findByEmail(dto.email);
//     if (existing) throw new MemberAlreadyExistsError(dto.email);

//     const season = new Date().getFullYear();
//     const seq = await this.memberRepo.nextSequence(season);

//     // Fetch club to get clubShort for license number
//     let clubCode: string | undefined;
//     let clubShort: string | undefined;

//     if (dto.clubId) {
//       const club = await this.clubRepo.findById(dto.clubId);
//       if (!club) throw new ClubNotFoundError(dto.clubId);
//       clubCode = club.code;
//       clubShort = club.clubShort;
//     }

//     const licenseNumber = LicenseNumber.generate(
//       seq,
//       clubCode,
//       clubShort,
//       season,
//       dto.dateOfBirth,
//     );

//     const member = new Member({
//       licenseNumber,
//       firstName: dto.firstName,
//       lastName: dto.lastName,
//       dateOfBirth: new Date(dto.dateOfBirth),
//       gender: dto.gender,
//       email: dto.email,
//       phone: dto.phone,
//       height: dto.height,
//       armSpan: dto.armSpan,
//       weight: dto.weight,
//       cin: dto.cin,
//       status: MemberStatus.PENDING,
//       clubId: dto.clubId,
//       season,
//     });

//     const saved = await this.memberRepo.save(member);
//     return toMemberResponse(saved);
//   }
// }
export class CreateMemberUseCase {
  constructor(
    private readonly memberRepo: IMemberRepository,
    private readonly clubRepo: IClubRepository,
  ) {}

  async execute(dto: CreateMemberDTO): Promise<MemberResponseDTO> {
    if (dto.email) {
      const existingEmail = await this.memberRepo.findByEmail(dto.email);
      if (existingEmail)
        throw new MemberAlreadyExistsError(
          `Email ${dto.email} already registered`,
        );
    }

    // 2. Check existence by CIN (Only if provided)
    if (dto.cin) {
      // Assuming you add findByCin to your repository
      const existingCin = await this.memberRepo.findByCin(dto.cin);
      if (existingCin)
        throw new MemberAlreadyExistsError(`CIN ${dto.cin} already registered`);
    }

    const season = new Date().getFullYear();
    const seq = await this.memberRepo.nextSequence(season);

    // Default values for Federation-level members (no club)
    let clubCode = "00";
    let clubShort = "FED";

    if (dto.clubId) {
      const club = await this.clubRepo.findById(dto.clubId);
      if (!club) throw new ClubNotFoundError(dto.clubId);

      // Use club code and short name from database
      clubCode = club.code;
      clubShort = club.clubShort;
    }

    const licenseNumber = LicenseNumber.generate(
      seq,
      clubCode,
      clubShort,
      season,
      dto.dateOfBirth,
    );

    const member = new Member({
      licenseNumber,
      firstName: dto.firstName,
      lastName: dto.lastName,
      dateOfBirth: new Date(dto.dateOfBirth),
      gender: dto.gender,
      email: dto.email,
      phone: dto.phone,
      height: dto.height,
      armSpan: dto.armSpan,
      weight: dto.weight,
      cin: dto.cin,
      status: MemberStatus.PENDING,
      clubId: dto.clubId,
      season,
    });

    const saved = await this.memberRepo.save(member);
    return toMemberResponse(saved);
  }
}
