import { IMemberRepository } from "../../../domain/interfaces";
import { MemberNotFoundError } from "../../../domain/errors";
import { MemberResponseDTO } from "../../dtos";
import { toMemberResponse } from "./toMemberResponse";

export class GetMemberUseCase {
  constructor(private readonly memberRepo: IMemberRepository) {}

  async execute(id: string): Promise<MemberResponseDTO> {
    const member = await this.memberRepo.findById(id);
    if (!member) throw new MemberNotFoundError(id);
    return toMemberResponse(member);
  }
}
