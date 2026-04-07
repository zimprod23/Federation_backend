import {
  IMemberRepository,
  ICardRepository,
  ITokenSigner,
} from "../../../domain/interfaces";
import { InvalidTokenError } from "../../../domain/errors";
import { MemberStatus } from "../../../domain/value-objects";
import { VerificationResponseDTO } from "../../dtos";

export class VerifyTokenUseCase {
  constructor(
    private readonly memberRepo: IMemberRepository,
    private readonly cardRepo: ICardRepository,
    private readonly tokenSigner: ITokenSigner,
  ) {}

  async execute(token: string): Promise<VerificationResponseDTO> {
    // 1. Decode and verify signature
    let payload: { memberId: string; licenseNumber: string; season: number };
    try {
      payload = this.tokenSigner.verify(token);
    } catch {
      throw new InvalidTokenError();
    }

    // 2. Check card exists and is valid in DB
    const card = await this.cardRepo.findByQrPayload(token);
    if (!card || !card.isValid) {
      return { result: "not_found" };
    }

    // 3. Fetch member
    const member = await this.memberRepo.findById(payload.memberId);
    if (!member) {
      return { result: "not_found" };
    }

    // 4. Determine result
    let result: VerificationResponseDTO["result"] = "valid";

    if (member.status === MemberStatus.SUSPENDED) {
      result = "suspended";
    } else if (member.status === MemberStatus.EXPIRED) {
      result = "expired";
    } else if (!card.isCurrentlyValid()) {
      result = "expired";
    }

    return {
      result,
      member: {
        fullName: member.fullName,
        licenseNumber: member.licenseNumber,
        photoUrl: member.photoUrl,
        category: member.getCategory(),
        gender: member.gender,
        status: member.status,
        season: member.season,
      },
    };
  }
}
