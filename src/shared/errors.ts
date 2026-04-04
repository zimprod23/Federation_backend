import { ApiResponse, ApiResponseBuilder } from "./api-response";
import { HTTP_STATUS } from "./constants";

export abstract class BaseError extends Error {
  abstract readonly statusCode: number;

  constructor(
    public override readonly name: string,
    public override readonly message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  toResponse(): ApiResponse<never> {
    return ApiResponseBuilder.error(this.message, this.details);
  }
}

export class InternalError extends BaseError {
  readonly statusCode = HTTP_STATUS.INTERNAL_ERROR;
  constructor(message = "Internal server error", details?: unknown) {
    super("InternalError", message, details);
  }
}

export class ValidationError extends BaseError {
  readonly statusCode = HTTP_STATUS.BAD_REQUEST;
  constructor(message = "Validation error", details?: unknown) {
    super("ValidationError", message, details);
  }
}

export class AuthenticationError extends BaseError {
  readonly statusCode = HTTP_STATUS.UNAUTHORIZED;
  constructor(message = "Unauthorized", details?: unknown) {
    super("AuthenticationError", message, details);
  }
}

export class ForbiddenError extends BaseError {
  readonly statusCode = HTTP_STATUS.FORBIDDEN;
  constructor(message = "Forbidden", details?: unknown) {
    super("ForbiddenError", message, details);
  }
}

export class NotFoundError extends BaseError {
  readonly statusCode = HTTP_STATUS.NOT_FOUND;
  constructor(message = "Resource not found", details?: unknown) {
    super("NotFoundError", message, details);
  }
}

export class ConflictError extends BaseError {
  readonly statusCode = HTTP_STATUS.CONFLICT;
  constructor(message = "Conflict", details?: unknown) {
    super("ConflictError", message, details);
  }
}
