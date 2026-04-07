import {
  Gender,
  MemberCategory,
  MemberStatus,
  VerificationResult,
} from "../../domain/value-objects";

export interface LogScanDTO {
  token: string;
  location?: string;
  scannedBy: string;
}

export interface VerificationResponseDTO {
  result: VerificationResult;
  member?: {
    fullName: string;
    licenseNumber: string;
    photoUrl?: string;
    category: MemberCategory;
    gender: Gender;
    status: MemberStatus;
    season: number;
  };
}
