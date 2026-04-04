import { IMemberRepository } from "../../../domain/interfaces";
import { Member } from "../../../domain/entities/Member";
import { MemberNotFoundError } from "../../../domain/errors";
import { UpdateMemberDTO, MemberResponseDTO } from "../../dtos";
import { toMemberResponse } from "./toMemberResponse";

export class UpdateMemberUseCase {
  constructor(private readonly memberRepo: IMemberRepository) {}

  async execute(id: string, dto: UpdateMemberDTO): Promise<MemberResponseDTO> {
    const member = await this.memberRepo.findById(id);
    if (!member) throw new MemberNotFoundError(id);

    const updated = new Member({
      ...member.toProps(),
      ...dto,
    });

    const saved = await this.memberRepo.save(updated);
    return toMemberResponse(saved);
  }
}
