import {
  EventDistance,
  Gender,
  MemberCategory,
  MemberStatus,
  PositionType,
} from "../../domain/value-objects";

export interface CreateMemberDTO {
  firstName: string;
  lastName: string;
  firstNameAr: string;
  lastNameAr: string;
  dateOfBirth: string; // ISO "YYYY-MM-DD"
  gender: Gender;
  email?: string;
  phone?: string;
  position?: PositionType;
  height?: number;
  cin?: string;
  armSpan?: number;
  weight?: number;
  clubId?: string;
}

export interface UpdateMemberDTO {
  firstName?: string;
  lastName?: string;
  firstNameAr?: string;
  lastNameAr?: string;
  dateOfBirth?: string; // ISO "YYYY
  phone?: string;
  height?: number;
  armSpan?: number;
  cin?: string;
  weight?: number;
  clubId?: string;
  status?: MemberStatus;
  position?: PositionType;
}

export interface ListMembersDTO {
  page?: number;
  limit?: number;
  status?: MemberStatus;
  gender?: Gender;
  cin?: string;
  category?: MemberCategory;
  clubId?: string;
  season?: number;
  search?: string;
}

export interface MemberResponseDTO {
  id: string;
  licenseNumber: string;
  fullName: string;
  fullNameAr: string;
  firstName: string;
  lastName: string;
  firstNameAr: string;
  lastNameAr: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  height?: number;
  dateOfBirth?: string;
  armSpan?: number;
  position?: string;
  weight?: number;
  cin?: string;
  gender: Gender;
  category: MemberCategory; // computed, not stored
  status: MemberStatus;
  season: number;
  clubId?: string;
  createdAt?: Date;
}

// ─── Member Competition History ───────────────────────────────────────────────
export interface CompetitionResultDTO {
  resultId: string;
  eventId: string;
  rank?: number;
  medal?: "gold" | "silver" | "bronze"; // awarded based on rank
  distance?: EventDistance;
  gender?: Gender;
  finalTime?: string;
  splitTime500?: string;
  strokeRate?: number;
  heartRate?: number;
  watts?: number;
  notes?: string;
}

export interface CompetitionHistoryItemDTO {
  competitionId: string;
  competitionName: string;
  competitionType: string;
  competitionStatus: string;
  location: string;
  city: string;
  startDate: Date;
  endDate: Date;
  season: number;
  description?: string;
  results: CompetitionResultDTO[];
}

export interface MemberHistoryDTO {
  memberId: string;
  licenseNumber: string;
  fullName: string;
  totalCompetitions: number;
  goldMedals: number;
  silverMedals: number;
  bronzeMedals: number;
  competitionHistory: CompetitionHistoryItemDTO[];
}
