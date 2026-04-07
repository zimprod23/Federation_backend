export interface MembershipCardProps {
  id?: string;
  memberId: string;
  licenseNumber: string;
  season: number;
  cardNumber: string;
  pdfUrl?: string;
  qrPayload: string;
  isValid: boolean;
  validFrom: Date; // ← new
  validUntil: Date; // ← new
  qrDataUrl?: string;
  generatedAt?: Date;
  downloadedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class MembershipCard {
  readonly id?: string;
  readonly memberId: string;
  readonly licenseNumber: string;
  readonly season: number;
  readonly cardNumber: string;
  readonly pdfUrl?: string;
  readonly qrPayload: string;
  readonly isValid: boolean;
  readonly validFrom: Date;
  readonly validUntil: Date;
  readonly qrDataUrl?: string;
  readonly generatedAt?: Date;
  readonly downloadedAt?: Date;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(props: MembershipCardProps) {
    this.id = props.id;
    this.memberId = props.memberId;
    this.licenseNumber = props.licenseNumber;
    this.season = props.season;
    this.cardNumber = props.cardNumber;
    this.pdfUrl = props.pdfUrl;
    this.qrPayload = props.qrPayload;
    this.isValid = props.isValid;
    this.validFrom = props.validFrom;
    this.validUntil = props.validUntil;
    this.qrDataUrl = props.qrDataUrl;
    this.generatedAt = props.generatedAt;
    this.downloadedAt = props.downloadedAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  // ── Business logic ──────────────────────────────────────────────────────────
  isExpiredNow(): boolean {
    return new Date() > this.validUntil;
  }

  isNotYetValid(): boolean {
    return new Date() < this.validFrom;
  }

  isCurrentlyValid(): boolean {
    const now = new Date();
    return this.isValid && now >= this.validFrom && now <= this.validUntil;
  }

  withPdfUrl(pdfUrl: string): MembershipCard {
    return new MembershipCard({ ...this.toProps(), pdfUrl });
  }

  invalidate(): MembershipCard {
    return new MembershipCard({ ...this.toProps(), isValid: false });
  }

  markDownloaded(): MembershipCard {
    return new MembershipCard({
      ...this.toProps(),
      downloadedAt: new Date(),
    });
  }

  toProps(): MembershipCardProps {
    return {
      id: this.id,
      memberId: this.memberId,
      licenseNumber: this.licenseNumber,
      season: this.season,
      cardNumber: this.cardNumber,
      pdfUrl: this.pdfUrl,
      qrPayload: this.qrPayload,
      isValid: this.isValid,
      validFrom: this.validFrom,
      validUntil: this.validUntil,
      generatedAt: this.generatedAt,
      downloadedAt: this.downloadedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
