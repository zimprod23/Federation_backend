import {
  Gender,
  MemberStatus,
  MemberCategory,
  computeCategory,
  PositionType,
} from "../value-objects";
import { MemberSuspendedError, MemberExpiredError } from "../errors";

export interface MemberProps {
  id?: string;
  licenseNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: Gender;
  email?: string;
  phone?: string;
  photoUrl?: string;
  cin?: string;
  height?: number; // cm
  armSpan?: number; // cm
  weight?: number; // kg
  position?: PositionType;
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
  readonly email?: string;
  readonly cin?: string;
  readonly phone?: string;
  readonly photoUrl?: string;
  readonly height?: number;
  readonly armSpan?: number;
  readonly weight?: number;
  readonly position?: PositionType;
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
    this.height = props.height;
    this.armSpan = props.armSpan;
    this.position = props.position;
    this.weight = props.weight;
    this.status = props.status;
    this.clubId = props.clubId;
    this.season = props.season;
    this.cin = props.cin;
    this.qrToken = props.qrToken;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  // ─── Computed ────────────────────────────────────────────────────────────────
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // Category is always computed from DOB, never stored
  getCategory(referenceDate?: Date): MemberCategory {
    return computeCategory(this.dateOfBirth, referenceDate);
  }

  isActive(): boolean {
    return this.status === MemberStatus.ACTIVE;
  }

  // ─── Guard ───────────────────────────────────────────────────────────────────
  assertVerifiable(): void {
    if (this.status === MemberStatus.SUSPENDED) {
      throw new MemberSuspendedError(this.licenseNumber);
    }
    if (this.status === MemberStatus.EXPIRED) {
      throw new MemberExpiredError(this.licenseNumber);
    }
  }

  // ─── Immutable updates ───────────────────────────────────────────────────────
  withStatus(status: MemberStatus): Member {
    return new Member({ ...this.toProps(), status });
  }

  withPhoto(photoUrl: string): Member {
    return new Member({ ...this.toProps(), photoUrl });
  }

  withQrToken(qrToken: string): Member {
    return new Member({ ...this.toProps(), qrToken });
  }

  // ─── Serialisation ───────────────────────────────────────────────────────────
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
      height: this.height,
      armSpan: this.armSpan,
      position: this.position,
      weight: this.weight,
      status: this.status,
      clubId: this.clubId,
      season: this.season,
      cin: this.cin,
      qrToken: this.qrToken,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
