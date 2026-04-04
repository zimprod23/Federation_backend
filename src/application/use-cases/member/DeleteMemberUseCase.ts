import { IMemberRepository } from "../../../domain/interfaces";
import { MemberNotFoundError } from "../../../domain/errors";
import { MemberStatus } from "../../../domain/value-objects";

export class DeleteMemberUseCase {
  constructor(private readonly memberRepo: IMemberRepository) {}

  async execute(id: string): Promise<void> {
    const member = await this.memberRepo.findById(id);
    if (!member) throw new MemberNotFoundError(id);

    // Soft delete — suspended, never hard deleted
    const suspended = member.withStatus(MemberStatus.SUSPENDED);
    await this.memberRepo.save(suspended);
  }
}
