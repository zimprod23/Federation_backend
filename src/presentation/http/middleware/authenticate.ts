import { Request, Response, NextFunction } from "express";
import {
  IAuthTokenService,
  AuthTokenPayload,
} from "../../../domain/interfaces";
import { AuthenticationError, ForbiddenError } from "../../../shared/errors";
import { UserRole } from "../../../domain/value-objects";

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

export function createAuthenticate(authTokenSvc: IAuthTokenService) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) throw new AuthenticationError("No authorization header");

      const [bearer, token] = authHeader.split(" ");
      if (bearer !== "Bearer" || !token) {
        throw new AuthenticationError("Invalid token format");
      }

      const payload = authTokenSvc.verify(token);
      req.user = payload;
      next();
    } catch (err) {
      if (err instanceof AuthenticationError) return next(err);
      next(new AuthenticationError("Invalid or expired token"));
    }
  };
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AuthenticationError("Not authenticated"));
    }
    if (!roles.includes(req.user.role as UserRole)) {
      return next(new ForbiddenError("Insufficient permissions"));
    }
    next();
  };
}
