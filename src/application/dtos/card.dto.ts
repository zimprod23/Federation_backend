export interface CardResponseDTO {
  id: string;
  memberId: string;
  licenseNumber: string;
  season: number;
  cardNumber: string;
  isValid: boolean;
  validFrom: Date;
  validUntil: Date;
  qrPayload: string;
  qrDataUrl?: string; // ← frontend renders this as the QR image
  generatedAt?: Date;
}
