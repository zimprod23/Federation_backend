import { MembershipCard } from "../../../domain/entities/MembershipCard";
import { CardResponseDTO } from "../../dtos";

export function toCardResponse(card: MembershipCard): CardResponseDTO {
  return {
    id: card.id!,
    memberId: card.memberId,
    licenseNumber: card.licenseNumber,
    season: card.season,
    cardNumber: card.cardNumber,
    isValid: card.isValid,
    validFrom: card.validFrom,
    validUntil: card.validUntil,
    qrPayload: card.qrPayload,
    qrDataUrl: card.qrDataUrl,
    generatedAt: card.generatedAt,
  };
}
