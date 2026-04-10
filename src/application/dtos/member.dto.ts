import {
  Gender,
  MemberCategory,
  MemberStatus,
  PositionType,
} from "../../domain/value-objects";

export interface CreateMemberDTO {
  firstName: string;
  lastName: string;
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
  firstName: string;
  lastName: string;
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
