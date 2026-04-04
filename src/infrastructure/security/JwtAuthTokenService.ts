import jwt from "jsonwebtoken";
import { IAuthTokenService, AuthTokenPayload } from "../../domain/interfaces";
import { AuthenticationError } from "../../shared/errors";

export class JwtAuthTokenService implements IAuthTokenService {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor(secret: string, expiresIn = "24h") {
    this.secret = secret;
    this.expiresIn = expiresIn;
  }

  sign(payload: AuthTokenPayload): string {
    return jwt.sign(payload, this.secret, {
      algorithm: "HS256",
      expiresIn: this.expiresIn,
    } as jwt.SignOptions);
  }

  verify(token: string): AuthTokenPayload {
    try {
      return jwt.verify(token, this.secret) as AuthTokenPayload;
    } catch {
      throw new AuthenticationError("Invalid or expired token");
    }
  }
}
