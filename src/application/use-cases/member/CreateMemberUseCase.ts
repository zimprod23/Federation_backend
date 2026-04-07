import { IMemberRepository } from "../../../domain/interfaces";
import { Member } from "../../../domain/entities/Member";
import { MemberAlreadyExistsError } from "../../../domain/errors";
import { MemberStatus } from "../../../domain/value-objects";
import { CreateMemberDTO, MemberResponseDTO } from "../../dtos";
import { toMemberResponse } from "./toMemberResponse";
import { LicenseNumber } from "../../../domain/value-objects/LicenceNumber";

export class CreateMemberUseCase {
  constructor(private readonly memberRepo: IMemberRepository) {}

  async execute(dto: CreateMemberDTO): Promise<MemberResponseDTO> {
    const existing = await this.memberRepo.findByEmail(dto.email);
    if (existing) throw new MemberAlreadyExistsError(dto.email);

    const season = new Date().getFullYear();
    const seq = await this.memberRepo.nextSequence(season);
    const license = LicenseNumber.generate(seq, season);

    const member = new Member({
      licenseNumber: license,
      firstName: dto.firstName,
      lastName: dto.lastName,
      dateOfBirth: new Date(dto.dateOfBirth),
      gender: dto.gender,
      email: dto.email,
      phone: dto.phone,
      height: dto.height,
      armSpan: dto.armSpan,
      weight: dto.weight,
      status: MemberStatus.PENDING,
      clubId: dto.clubId,
      season,
    });

    const saved = await this.memberRepo.save(member);
    return toMemberResponse(saved);
  }
}
