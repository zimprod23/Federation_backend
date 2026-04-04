import { ICardRepository, IMemberRepository } from "../../../domain/interfaces";
import { CardNotFoundError, MemberNotFoundError } from "../../../domain/errors";
import { MemberStatus } from "../../../domain/value-objects";
import { ForbiddenError } from "../../../shared/errors";
import { CardResponseDTO } from "../../dtos";
import { toCardResponse } from "./toCardResponse";

export class GetCardUseCase {
  constructor(
    private readonly cardRepo: ICardRepository,
    private readonly memberRepo: IMemberRepository,
  ) {}

  async execute(memberId: string, season?: number): Promise<CardResponseDTO> {
    // 1. Fetch member first
    const member = await this.memberRepo.findById(memberId);
    if (!member) throw new MemberNotFoundError(memberId);

    // 2. Guard — suspended or expired members cannot retrieve their card
    if (member.status === MemberStatus.SUSPENDED) {
      throw new ForbiddenError(
        `Cannot retrieve card for a suspended member: ${member.licenseNumber}`,
      );
    }

    if (member.status === MemberStatus.EXPIRED) {
      throw new ForbiddenError(
        `Cannot retrieve card for an expired member: ${member.licenseNumber}`,
      );
    }

    // 3. Fetch card
    const card = await this.cardRepo.findByMemberId(memberId, season);
    if (!card) throw new CardNotFoundError(memberId);

    return toCardResponse(card);
  }
}
