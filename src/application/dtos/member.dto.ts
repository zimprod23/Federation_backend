import {
  Gender,
  MemberCategory,
  MemberStatus,
} from "../../domain/value-objects";

export interface CreateMemberDTO {
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO "YYYY-MM-DD"
  gender: Gender;
  email: string;
  phone?: string;
  height?: number;
  armSpan?: number;
  weight?: number;
  clubId?: string;
}

export interface UpdateMemberDTO {
  firstName?: string;
  lastName?: string;
  phone?: string;
  height?: number;
  armSpan?: number;
  weight?: number;
  clubId?: string;
  status?: MemberStatus;
}

export interface ListMembersDTO {
  page?: number;
  limit?: number;
  status?: MemberStatus;
  gender?: Gender;
  category?: MemberCategory;
  clubId?: string;
  season?: number;
  search?: string;
}

export interface MemberResponseDTO {
  id: string;
  licenseNumber: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  height?: number;
  armSpan?: number;
  weight?: number;
  gender: Gender;
  category: MemberCategory; // computed, not stored
  status: MemberStatus;
  season: number;
  clubId?: string;
  createdAt?: Date;
}
