// ─── Base ─────────────────────────────────────────────────────────────────────
export abstract class DomainError extends Error {
  constructor(
    public override readonly name: string,
    public override readonly message: string,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── Member ───────────────────────────────────────────────────────────────────
export class MemberNotFoundError extends DomainError {
  constructor(identifier: string) {
    super("MemberNotFoundError", `Member not found: ${identifier}`);
  }
}

export class MemberSuspendedError extends DomainError {
  constructor(licenseNumber: string) {
    super("MemberSuspendedError", `Member is suspended: ${licenseNumber}`);
  }
}

export class MemberExpiredError extends DomainError {
  constructor(licenseNumber: string) {
    super("MemberExpiredError", `Member license is expired: ${licenseNumber}`);
  }
}

export class MemberAlreadyExistsError extends DomainError {
  constructor(email: string) {
    super("MemberAlreadyExistsError", `Member already exists: ${email}`);
  }
}

// ─── Club ─────────────────────────────────────────────────────────────────────
export class ClubNotFoundError extends DomainError {
  constructor(identifier: string) {
    super("ClubNotFoundError", `Club not found: ${identifier}`);
  }
}

export class ClubAlreadyExistsError extends DomainError {
  constructor(code: string) {
    super("ClubAlreadyExistsError", `Club code already exists: ${code}`);
  }
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export class CardNotFoundError extends DomainError {
  constructor(memberId: string) {
    super("CardNotFoundError", `No active card found for member: ${memberId}`);
  }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export class UserNotFoundError extends DomainError {
  constructor(identifier: string) {
    super("UserNotFoundError", `User not found: ${identifier}`);
  }
}

export class UserAlreadyExistsError extends DomainError {
  constructor(email: string) {
    super("UserAlreadyExistsError", `User already exists: ${email}`);
  }
}

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super("InvalidCredentialsError", "Invalid email or password");
  }
}

// ─── Token ────────────────────────────────────────────────────────────────────
export class InvalidTokenError extends DomainError {
  constructor() {
    super("InvalidTokenError", "Token is invalid or malformed");
  }
}

export class CompetitionNotFoundError extends DomainError {
  constructor(identifier: string) {
    super("CompetitionNotFoundError", `Competition not found: ${identifier}`);
  }
}

export class EventNotFoundError extends DomainError {
  constructor(identifier: string) {
    super("EventNotFoundError", `Event not found: ${identifier}`);
  }
}

export class RegistrationNotFoundError extends DomainError {
  constructor(identifier: string) {
    super("RegistrationNotFoundError", `Registration not found: ${identifier}`);
  }
}

export class AlreadyRegisteredError extends DomainError {
  constructor(memberId: string, eventId: string) {
    super(
      "AlreadyRegisteredError",
      `Member ${memberId} is already registered for event ${eventId}`,
    );
  }
}

export class CompetitionClosedError extends DomainError {
  constructor(name: string) {
    super(
      "CompetitionClosedError",
      `Competition is not open for registration: ${name}`,
    );
  }
}
