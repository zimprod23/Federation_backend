import crypto from "crypto";
import QRCode from "qrcode";
import {
  IMemberRepository,
  ICardRepository,
  ITokenSigner,
} from "../../../domain/interfaces";
import { MembershipCard } from "../../../domain/entities/MembershipCard";
import { MemberNotFoundError } from "../../../domain/errors";
import { MemberStatus } from "../../../domain/value-objects";
import { ForbiddenError } from "../../../shared/errors";
import { CardResponseDTO } from "../../dtos";
import { toCardResponse } from "./toCardResponse";

export interface GenerateCardInput {
  memberId: string;
  validFrom: Date;
  validUntil: Date;
}

export class GenerateCardUseCase {
  constructor(
    private readonly memberRepo: IMemberRepository,
    private readonly cardRepo: ICardRepository,
    private readonly tokenSigner: ITokenSigner,
  ) {}

  async execute(input: GenerateCardInput): Promise<CardResponseDTO> {
    const { memberId, validFrom, validUntil } = input;

    const member = await this.memberRepo.findById(memberId);
    if (!member) throw new MemberNotFoundError(memberId);

    if (member.status === MemberStatus.SUSPENDED) {
      throw new ForbiddenError(
        `Cannot generate card for a suspended member: ${member.licenseNumber}`,
      );
    }

    if (member.status === MemberStatus.EXPIRED) {
      throw new ForbiddenError(
        `Cannot generate card for an expired member: ${member.licenseNumber}`,
      );
    }

    // Invalidate any existing card for this season
    await this.cardRepo.invalidatePrevious(memberId, member.season);

    // Sign QR payload
    const qrPayload = this.tokenSigner.sign({
      memberId: member.id!,
      licenseNumber: member.licenseNumber,
      season: member.season,
    });

    // Generate QR as base64 data URL for the frontend to embed in the card
    const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 300 });

    const cardNumber = `CARD-${member.season}-${crypto
      .randomBytes(4)
      .toString("hex")
      .toUpperCase()}`;

    const card = new MembershipCard({
      memberId,
      licenseNumber: member.licenseNumber,
      season: member.season,
      cardNumber,
      qrPayload,
      qrDataUrl, // ← frontend uses this to render the QR
      isValid: true,
      validFrom,
      validUntil,
      generatedAt: new Date(),
    });

    const updatedMember = member.withQrToken(qrPayload);
    await this.memberRepo.save(updatedMember);

    const saved = await this.cardRepo.save(card);
    return toCardResponse(saved);
  }
}
