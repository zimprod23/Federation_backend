import {
  Discipline,
  Gender,
  MemberLevel,
  MemberStatus,
} from "../../domain/value-objects";

export interface CreateMemberDTO {
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO string "YYYY-MM-DD" from HTTP
  gender: Gender;
  email: string;
  phone?: string;
  disciplines: Discipline[];
  level: MemberLevel;
  clubId?: string;
}

export interface UpdateMemberDTO {
  firstName?: string;
  lastName?: string;
  phone?: string;
  disciplines?: Discipline[];
  level?: MemberLevel;
  clubId?: string;
  status?: MemberStatus;
}

export interface ListMembersDTO {
  page?: number;
  limit?: number;
  status?: MemberStatus;
  discipline?: string;
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
  disciplines: Discipline[];
  level: MemberLevel;
  status: MemberStatus;
  season: number;
  clubId?: string;
  createdAt?: Date;
}
