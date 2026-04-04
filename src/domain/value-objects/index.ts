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
export type Gender = "male" | "female" | "other";

// ─── Verification result ──────────────────────────────────────────────────────
export type VerificationResult =
  | "valid"
  | "suspended"
  | "expired"
  | "not_found";
