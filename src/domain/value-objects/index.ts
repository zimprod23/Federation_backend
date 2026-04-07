// ─── User roles ───────────────────────────────────────────────────────────────
export type UserRole =
  | "super_admin"
  | "federation_admin"
  | "club_manager"
  | "scanner"
  | "member";

// ─── Member status ────────────────────────────────────────────────────────────
export enum MemberStatus {
  ACTIVE = "active",
  PENDING = "pending",
  SUSPENDED = "suspended",
  EXPIRED = "expired",
}

// ─── Member category — computed from date of birth ───────────────────────────
export enum MemberCategory {
  JUNIOR = "junior", // under 18
  U23 = "u23", // 18 to 22
  SENIOR = "senior", // 23 and above
}

// ─── Club status ──────────────────────────────────────────────────────────────
export enum ClubStatus {
  ACTIVE = "active",
  PENDING = "pending",
  SUSPENDED = "suspended",
}

// ─── Discipline ───────────────────────────────────────────────────────────────
export enum Discipline {
  SURFING = "surfing",
  PADDLING = "paddling",
  BODYBOARD = "bodyboard",
  KITESURFING = "kitesurfing",
  WINDSURFING = "windsurfing",
}

// ─── Member level ─────────────────────────────────────────────────────────────
export enum MemberLevel {
  AMATEUR = "amateur",
  SEMI_PRO = "semi-pro",
  PRO = "pro",
}

// ─── Gender ───────────────────────────────────────────────────────────────────
export type Gender = "male" | "female";

// ─── Verification result ──────────────────────────────────────────────────────
export type VerificationResult =
  | "valid"
  | "suspended"
  | "expired"
  | "not_found";

// ─── Competition types ────────────────────────────────────────────────────────
export enum CompetitionType {
  TEST_FISA = "test_fisa",
  CHAMPIONSHIP = "championship",
  FRIENDLY = "friendly",
}

// ─── Competition status ───────────────────────────────────────────────────────
export enum CompetitionStatus {
  DRAFT = "draft",
  OPEN = "open",
  CLOSED = "closed",
  COMPLETED = "completed",
}

// ─── Event distances ─────────────────────────────────────────────────────────
export enum EventDistance {
  M150 = "150m",
  M2000 = "2000m",
  M6000 = "6000m",
  M10000 = "10000m",
  M15000 = "15000m",
}

// ─── Event status ─────────────────────────────────────────────────────────────
export enum EventStatus {
  SCHEDULED = "scheduled",
  ONGOING = "ongoing",
  COMPLETED = "completed",
}

// ─── Category calculator ──────────────────────────────────────────────────────
export function computeCategory(
  dateOfBirth: Date,
  referenceDate?: Date,
): MemberCategory {
  const ref = referenceDate ?? new Date();
  const age = ref.getFullYear() - dateOfBirth.getFullYear();

  // Adjust for birthday not yet reached this year
  const hasBirthdayPassed =
    ref.getMonth() > dateOfBirth.getMonth() ||
    (ref.getMonth() === dateOfBirth.getMonth() &&
      ref.getDate() >= dateOfBirth.getDate());

  const exactAge = hasBirthdayPassed ? age : age - 1;

  if (exactAge < 18) return MemberCategory.JUNIOR;
  if (exactAge < 23) return MemberCategory.U23;
  return MemberCategory.SENIOR;
}
