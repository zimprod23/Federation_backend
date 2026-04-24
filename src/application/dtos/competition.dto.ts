import {
  CompetitionType,
  CompetitionStatus,
  EventDistance,
  EventStatus,
  MemberCategory,
  Gender,
} from "../../domain/value-objects";
import { RegistrationStatus } from "../../domain/entities/Registration";

// ─── Competition DTOs ─────────────────────────────────────────────────────────
export interface CreateCompetitionDTO {
  name: string;
  type: CompetitionType;
  location: string;
  city: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  season: number;
  description?: string;
}

export interface UpdateCompetitionStatusDTO {
  status: CompetitionStatus;
}

export interface CompetitionResponseDTO {
  id: string;
  name: string;
  type: CompetitionType;
  status: CompetitionStatus;
  location: string;
  city: string;
  startDate: Date;
  endDate: Date;
  season: number;
  description?: string;
  createdBy: string;
  createdAt?: Date;
}

export interface ListCompetitionsDTO {
  page?: number;
  limit?: number;
  status?: CompetitionStatus;
  season?: number;
  type?: CompetitionType;
}

// ─── Event DTOs ───────────────────────────────────────────────────────────────
export interface CreateEventDTO {
  competitionId: string;
  distance: EventDistance;
  category: MemberCategory;
  gender: Gender;
  scheduledAt?: string; // ISO datetime
}

export interface EventResponseDTO {
  id: string;
  competitionId: string;
  distance: EventDistance;
  category: MemberCategory;
  gender: Gender;
  status: EventStatus;
  label: string;
  scheduledAt?: Date;
  createdAt?: Date;
}

// ─── Registration DTOs ────────────────────────────────────────────────────────
export interface CreateRegistrationDTO {
  competitionId: string;
  eventId: string;
  memberId: string;
}

export interface UpdateRegistrationStatusDTO {
  status: RegistrationStatus;
}

export interface RegistrationResponseDTO {
  id: string;
  competitionId: string;
  eventId: string;
  memberId: string;
  clubId?: string;
  status: RegistrationStatus;
  lane?: number;
  bib?: number;
  registeredBy: string;
  createdAt?: Date;
}

// ─── Result DTOs ──────────────────────────────────────────────────────────────
export interface RecordResultDTO {
  competitionId: string;
  eventId: string;
  memberId: string;
  registrationId: string;
  rank?: number;
  status?: RegistrationStatus;
  finalTime?: string;
  splitTime500?: string;
  strokeRate?: number;
  heartRate?: number;
  watts?: number;
  notes?: string;
}

export interface ResultResponseDTO {
  id: string;
  competitionId: string;
  eventId: string;
  memberId: string;
  registrationId: string;
  rank?: number;
  finalTime?: string;
  splitTime500?: string;
  strokeRate?: number;
  heartRate?: number;
  watts?: number;
  notes?: string;
  recordedBy: string;
  createdAt?: Date;
}
