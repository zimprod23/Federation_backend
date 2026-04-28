import { Member } from "../entities/Member";
import { Club } from "../entities/Club";
import { User } from "../entities/User";
import { MembershipCard } from "../entities/MembershipCard";
import { VerificationLog } from "../entities/VerificationLog";
import {
  Gender,
  MemberStatus,
  CompetitionStatus,
  EventDistance,
  MemberCategory,
} from "../value-objects";
import { Competition } from "../entities/Competition";
import { CompetitionEvent } from "../entities/CompetitionEvent";
import { Registration } from "../entities/Registration";
import { Result } from "../entities/Result";

// ─── Shared ───────────────────────────────────────────────────────────────────
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ─── Filters ──────────────────────────────────────────────────────────────────
export interface MemberFilters {
  status?: MemberStatus;
  gender?: Gender;
  category?: string;
  clubId?: string;
  season?: number;
  search?: string;
}
// ─── IMemberRepository ────────────────────────────────────────────────────────
export interface IMemberRepository {
  findById(id: string): Promise<Member | null>;
  findByLicenseNumber(ln: string): Promise<Member | null>;
  findByEmail(email: string): Promise<Member | null>;
  findByCin(cin: string): Promise<Member | null>;
  findAll(
    pagination: PaginationParams,
    filters: MemberFilters,
  ): Promise<PaginatedResult<Member>>;
  nextSequence(year: number): Promise<number>;
  save(member: Member): Promise<Member>;
  delete(id: string): Promise<void>;
}

// ─── IClubRepository ─────────────────────────────────────────────────────────
export interface IClubRepository {
  findById(id: string): Promise<Club | null>;
  findByCode(code: string): Promise<Club | null>;
  findAll(pagination: PaginationParams): Promise<PaginatedResult<Club>>;
  save(club: Club): Promise<Club>;
  delete(id: string): Promise<void>;
}

// ─── IUserRepository ─────────────────────────────────────────────────────────
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
}

// ─── ICardRepository ─────────────────────────────────────────────────────────
export interface ICardRepository {
  findByMemberId(
    memberId: string,
    season?: number,
  ): Promise<MembershipCard | null>;
  findByQrPayload(qrPayload: string): Promise<MembershipCard | null>;
  save(card: MembershipCard): Promise<MembershipCard>;
  invalidatePrevious(memberId: string, season: number): Promise<void>;
}

// ─── IVerificationLogRepository ──────────────────────────────────────────────
export interface IVerificationLogRepository {
  save(log: VerificationLog): Promise<VerificationLog>;
  findByMemberId(memberId: string): Promise<VerificationLog[]>;
}

// ─── IStorageService ─────────────────────────────────────────────────────────
export interface IStorageService {
  upload(key: string, buffer: Buffer, mimeType: string): Promise<string>;
  delete(key: string): Promise<void>;
}

// ─── ICardRenderer ───────────────────────────────────────────────────────────
export interface CardRenderInput {
  fullName: string;
  licenseNumber: string;
  photoUrl?: string;
  gender: string;
  category: string;
  season: number;
  qrDataUrl: string;
  validFrom?: Date;
  validUntil?: Date;
}

export interface ICardRenderer {
  render(input: CardRenderInput): Promise<Buffer>;
}

// ─── ITokenSigner — QR codes ─────────────────────────────────────────────────
export interface QrTokenPayload {
  memberId: string;
  licenseNumber: string;
  season: number;
}

export interface ITokenSigner {
  sign(payload: QrTokenPayload): string;
  verify(token: string): QrTokenPayload;
}

// ─── IAuthTokenService — user login JWTs ─────────────────────────────────────
export interface AuthTokenPayload {
  userId: string;
  role: string;
  isAdmin: boolean;
}

export interface IAuthTokenService {
  sign(payload: AuthTokenPayload): string;
  verify(token: string): AuthTokenPayload;
}

// ─── IPasswordHasher ─────────────────────────────────────────────────────────
export interface IPasswordHasher {
  hash(plain: string): Promise<string>;
  compare(plain: string, hashed: string): Promise<boolean>;
}

// ─── ICompetitionRepository ───────────────────────────────────────────────────
export interface CompetitionFilters {
  status?: CompetitionStatus;
  season?: number;
  type?: string;
}

export interface ICompetitionRepository {
  findById(id: string): Promise<Competition | null>;
  findAll(
    pagination: PaginationParams,
    filters: CompetitionFilters,
  ): Promise<PaginatedResult<Competition>>;
  save(competition: Competition): Promise<Competition>;
  delete(id: string): Promise<void>;
}

// ─── IEventRepository ────────────────────────────────────────────────────────
export interface IEventRepository {
  findById(id: string): Promise<CompetitionEvent | null>;
  findByCompetitionId(competitionId: string): Promise<CompetitionEvent[]>;
  findByCompetitionAndFilter(
    competitionId: string,
    distance?: EventDistance,
    category?: MemberCategory,
    gender?: Gender,
  ): Promise<CompetitionEvent[]>;
  save(event: CompetitionEvent): Promise<CompetitionEvent>;
  delete(id: string): Promise<void>;
}

// ─── IRegistrationRepository ─────────────────────────────────────────────────
export interface IRegistrationRepository {
  findById(id: string): Promise<Registration | null>;
  findByEventId(eventId: string): Promise<Registration[]>;
  findByMemberId(memberId: string): Promise<Registration[]>;
  findByMemberAndEvent(
    memberId: string,
    eventId: string,
  ): Promise<Registration | null>;
  findByMemberAndCompetition(
    memberId: string,
    competitionId: string,
  ): Promise<Registration[]>;
  save(registration: Registration): Promise<Registration>;
  deleteByEventId(eventId: string): Promise<void>;
}

// ─── IResultRepository ───────────────────────────────────────────────────────
export interface IResultRepository {
  findByEventId(eventId: string): Promise<Result[]>;
  findByMemberAndEvent(
    memberId: string,
    eventId: string,
  ): Promise<Result | null>;
  findByCompetitionId(competitionId: string): Promise<Result[]>;
  save(result: Result): Promise<Result>;
  deleteByEventId(eventId: string): Promise<void>;
}
