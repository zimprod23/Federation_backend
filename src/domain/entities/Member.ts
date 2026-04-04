import {
  Discipline,
  Gender,
  MemberLevel,
  MemberStatus,
} from "../value-objects";
import { MemberSuspendedError, MemberExpiredError } from "../errors";

export interface MemberProps {
  id?: string;
  licenseNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: Gender;
  email: string;
  phone?: string;
  photoUrl?: string;
  disciplines: Discipline[];
  level: MemberLevel;
  status: MemberStatus;
  clubId?: string;
  season: number;
  qrToken?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Member {
  readonly id?: string;
  readonly licenseNumber: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly dateOfBirth: Date;
  readonly gender: Gender;
  readonly email: string;
  readonly phone?: string;
  readonly photoUrl?: string;
  readonly disciplines: Discipline[];
  readonly level: MemberLevel;
  readonly status: MemberStatus;
  readonly clubId?: string;
  readonly season: number;
  readonly qrToken?: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(props: MemberProps) {
    this.id = props.id;
    this.licenseNumber = props.licenseNumber;
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.dateOfBirth = props.dateOfBirth;
    this.gender = props.gender;
    this.email = props.email;
    this.phone = props.phone;
    this.photoUrl = props.photoUrl;
    this.disciplines = props.disciplines;
    this.level = props.level;
    this.status = props.status;
    this.clubId = props.clubId;
    this.season = props.season;
    this.qrToken = props.qrToken;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  // ─── Computed ───────────────────────────────────────────────────────────────
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  isActive(): boolean {
    return this.status === MemberStatus.ACTIVE;
  }

  // ─── Guard — call before any verification ───────────────────────────────────
  assertVerifiable(): void {
    if (this.status === MemberStatus.SUSPENDED) {
      throw new MemberSuspendedError(this.licenseNumber);
    }
    if (this.status === MemberStatus.EXPIRED) {
      throw new MemberExpiredError(this.licenseNumber);
    }
  }

  // ─── Immutable updates ──────────────────────────────────────────────────────
  withStatus(status: MemberStatus): Member {
    return new Member({ ...this.toProps(), status });
  }

  withPhoto(photoUrl: string): Member {
    return new Member({ ...this.toProps(), photoUrl });
  }

  withQrToken(qrToken: string): Member {
    return new Member({ ...this.toProps(), qrToken });
  }

  // ─── Serialisation ──────────────────────────────────────────────────────────
  toProps(): MemberProps {
    return {
      id: this.id,
      licenseNumber: this.licenseNumber,
      firstName: this.firstName,
      lastName: this.lastName,
      dateOfBirth: this.dateOfBirth,
      gender: this.gender,
      email: this.email,
      phone: this.phone,
      photoUrl: this.photoUrl,
      disciplines: this.disciplines,
      level: this.level,
      status: this.status,
      clubId: this.clubId,
      season: this.season,
      qrToken: this.qrToken,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
