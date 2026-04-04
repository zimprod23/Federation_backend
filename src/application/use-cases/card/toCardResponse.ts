import { MembershipCard } from "../../../domain/entities/MembershipCard";
import { CardResponseDTO } from "../../dtos";

export function toCardResponse(card: MembershipCard): CardResponseDTO {
  return {
    id: card.id!,
    memberId: card.memberId,
    licenseNumber: card.licenseNumber,
    season: card.season,
    cardNumber: card.cardNumber,
    pdfUrl: card.pdfUrl,
    isValid: card.isValid,
    validFrom: card.validFrom,
    validUntil: card.validUntil,
    generatedAt: card.generatedAt,
    qrPayload: card.qrPayload,
  };
}
