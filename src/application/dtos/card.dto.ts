export interface CardResponseDTO {
  id: string;
  memberId: string;
  licenseNumber: string;
  season: number;
  cardNumber: string;
  pdfUrl?: string;
  isValid: boolean;
  validFrom: Date;
  validUntil: Date;
  generatedAt?: Date;
  qrPayload: string;
}
