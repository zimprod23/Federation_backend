import {
  Discipline,
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
    disciplines: Discipline[];
    status: MemberStatus;
    season: number;
  };
}
