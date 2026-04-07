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
