import {
  IMemberRepository,
  ICardRepository,
  IVerificationLogRepository,
  ITokenSigner,
} from "../../../domain/interfaces";
import { VerificationLog } from "../../../domain/entities/VerificationLog";
import {
  MemberStatus,
  VerificationResult,
} from "../../../domain/value-objects";
import { LogScanDTO, VerificationResponseDTO } from "../../dtos";
import { Member } from "../../../domain/entities/Member";
import { MembershipCard } from "../../../domain/entities/MembershipCard";

export class LogScanUseCase {
  constructor(
    private readonly memberRepo: IMemberRepository,
    private readonly cardRepo: ICardRepository,
    private readonly verificationRepo: IVerificationLogRepository,
    private readonly tokenSigner: ITokenSigner,
  ) {}

  async execute(dto: LogScanDTO): Promise<VerificationResponseDTO> {
    let result: VerificationResult = "not_found";
    let memberId: string | undefined;
    let member: Member | null = null;
    let card: MembershipCard | null = null;

    try {
      const payload = this.tokenSigner.verify(dto.token);
      memberId = payload.memberId;

      [member, card] = await Promise.all([
        this.memberRepo.findById(payload.memberId),
        this.cardRepo.findByQrPayload(dto.token),
      ]);

      if (!member || !card || !card.isValid) {
        result = "not_found";
      } else if (member.status === MemberStatus.SUSPENDED) {
        result = "suspended";
      } else if (member.status === MemberStatus.EXPIRED) {
        result = "expired";
      } else if (!card.isCurrentlyValid()) {
        // ← same check as VerifyTokenUseCase
        result = "expired";
      } else {
        result = "valid";
      }
    } catch {
      result = "not_found";
    }

    // Always write audit log
    await this.verificationRepo.save(
      VerificationLog.create({
        memberId,
        scannedBy: dto.scannedBy,
        location: dto.location,
        result,
        rawToken: dto.token,
      }),
    );

    // Always return member info if we found them
    if (member) {
      return {
        result,
        member: {
          fullName: member.fullName,
          licenseNumber: member.licenseNumber,
          photoUrl: member.photoUrl,
          disciplines: member.disciplines,
          status: member.status,
          season: member.season,
        },
      };
    }

    return { result };
  }
}
