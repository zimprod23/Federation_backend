import { Request, Response, NextFunction } from "express";
import { Error as MongooseError } from "mongoose";
import { BaseError } from "../../../shared/errors";
import {
  AlreadyRegisteredError,
  CompetitionClosedError,
  CompetitionNotFoundError,
  DomainError,
  EventNotFoundError,
  RegistrationNotFoundError,
} from "../../../domain/errors";
import {
  NotFoundError,
  ConflictError,
  ForbiddenError,
  AuthenticationError,
  ValidationError,
  InternalError,
} from "../../../shared/errors";
import {
  MemberNotFoundError,
  ClubNotFoundError,
  CardNotFoundError,
  UserNotFoundError,
  MemberSuspendedError,
  MemberExpiredError,
  MemberAlreadyExistsError,
  ClubAlreadyExistsError,
  UserAlreadyExistsError,
  InvalidCredentialsError,
  InvalidTokenError,
} from "../../../domain/errors";
import { logger } from "../../../shared/logger";

function mapDomainError(err: DomainError): BaseError {
  if (
    err instanceof MemberNotFoundError ||
    err instanceof ClubNotFoundError ||
    err instanceof CardNotFoundError ||
    err instanceof UserNotFoundError
  ) {
    return new NotFoundError(err.message);
  }

  if (
    err instanceof MemberSuspendedError ||
    err instanceof MemberExpiredError
  ) {
    return new ForbiddenError(err.message);
  }

  if (
    err instanceof MemberAlreadyExistsError ||
    err instanceof ClubAlreadyExistsError ||
    err instanceof UserAlreadyExistsError
  ) {
    return new ConflictError(err.message);
  }

  if (
    err instanceof InvalidCredentialsError ||
    err instanceof InvalidTokenError
  ) {
    return new AuthenticationError(err.message);
  }

  if (
    err instanceof CompetitionNotFoundError ||
    err instanceof EventNotFoundError ||
    err instanceof RegistrationNotFoundError
  ) {
    return new NotFoundError(err.message);
  }

  if (err instanceof AlreadyRegisteredError) {
    return new ConflictError(err.message);
  }

  if (err instanceof CompetitionClosedError) {
    return new ForbiddenError(err.message);
  }

  return new InternalError(err.message);
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // ── Mongoose CastError — invalid ObjectId format ───────────────────────────
  if (err instanceof MongooseError.CastError) {
    const httpErr = new ValidationError(`Invalid ID format: "${err.value}"`);
    res.status(httpErr.statusCode).json(httpErr.toResponse());
    return;
  }

  // ── Mongoose ValidationError ───────────────────────────────────────────────
  if (err instanceof MongooseError.ValidationError) {
    const messages = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    const httpErr = new ValidationError(messages);
    res.status(httpErr.statusCode).json(httpErr.toResponse());
    return;
  }

  // ── Domain errors ──────────────────────────────────────────────────────────
  if (err instanceof DomainError) {
    const httpErr = mapDomainError(err);
    res.status(httpErr.statusCode).json(httpErr.toResponse());
    return;
  }

  // ── Known HTTP errors ──────────────────────────────────────────────────────
  if (err instanceof BaseError) {
    if (err.statusCode >= 500) {
      logger.error(err.message, "ErrorHandler", err.stack);
    } else {
      logger.warn(err.message, "ErrorHandler");
    }
    res.status(err.statusCode).json(err.toResponse());
    return;
  }

  // ── Unknown — never leak internals ─────────────────────────────────────────
  logger.error(err.message, "ErrorHandler", err.stack);
  const fallback = new InternalError();
  res.status(fallback.statusCode).json(fallback.toResponse());
}
