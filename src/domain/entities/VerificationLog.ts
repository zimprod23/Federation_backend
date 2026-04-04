import { VerificationResult } from "../value-objects";

export interface VerificationLogProps {
  id?: string;
  memberId?: string;
  scannedBy: string;
  scannedAt: Date;
  location?: string;
  result: VerificationResult;
  rawToken: string;
  createdAt?: Date;
}

export class VerificationLog {
  readonly id?: string;
  readonly memberId?: string;
  readonly scannedBy: string;
  readonly scannedAt: Date;
  readonly location?: string;
  readonly result: VerificationResult;
  readonly rawToken: string;
  readonly createdAt?: Date;

  constructor(props: VerificationLogProps) {
    this.id = props.id;
    this.memberId = props.memberId;
    this.scannedBy = props.scannedBy;
    this.scannedAt = props.scannedAt;
    this.location = props.location;
    this.result = props.result;
    this.rawToken = props.rawToken;
    this.createdAt = props.createdAt;
  }

  // Factory — always stamps the current time
  static create(
    params: Omit<VerificationLogProps, "scannedAt" | "id">,
  ): VerificationLog {
    return new VerificationLog({
      ...params,
      scannedAt: new Date(),
    });
  }

  toProps(): VerificationLogProps {
    return {
      id: this.id,
      memberId: this.memberId,
      scannedBy: this.scannedBy,
      scannedAt: this.scannedAt,
      location: this.location,
      result: this.result,
      rawToken: this.rawToken,
      createdAt: this.createdAt,
    };
  }
}
