import { IClubRepository, IMemberRepository } from "../../../domain/interfaces";
import { Member } from "../../../domain/entities/Member";
import { ClubNotFoundError, MemberNotFoundError } from "../../../domain/errors";
import { UpdateMemberDTO, MemberResponseDTO } from "../../dtos";
import { toMemberResponse } from "./toMemberResponse";
import { LicenseNumber } from "../../../domain/value-objects/LicenceNumber";

export class UpdateMemberUseCase {
  constructor(
    private readonly memberRepo: IMemberRepository,
    private readonly clubRepo: IClubRepository,
  ) {}

  async execute(id: string, dto: UpdateMemberDTO): Promise<MemberResponseDTO> {
    const member = await this.memberRepo.findById(id);
    if (!member) throw new MemberNotFoundError(id);

    let newLicense = member.licenseNumber;

    // HIDDEN SYNC: If club changes, regenerate license
    if (dto.clubId && dto.clubId !== member.clubId) {
      const club = await this.clubRepo.findById(dto.clubId);
      if (!club) throw new ClubNotFoundError(dto.clubId);

      // Get the existing sequence from the old license
      const sequence = parseInt(member.licenseNumber.slice(-5));

      newLicense = LicenseNumber.generate(
        sequence,
        club.code,
        club.clubShort,
        member.season, // or new Date().getFullYear() if season renews
        member.dateOfBirth.toISOString(),
      );
    }
    const updated = new Member({
      ...member.toProps(),
      ...dto,
      licenseNumber: newLicense,
    });

    const saved = await this.memberRepo.save(updated);
    return toMemberResponse(saved);
  }
}
