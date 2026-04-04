import jwt from "jsonwebtoken";
import { ITokenSigner, QrTokenPayload } from "../../domain/interfaces";
import { InvalidTokenError } from "../../domain/errors";

export class JwtTokenSigner implements ITokenSigner {
  private readonly secret: string;

  constructor(secret: string) {
    this.secret = secret;
  }

  sign(payload: QrTokenPayload): string {
    // No expiry — validity is always checked live against the DB
    return jwt.sign(payload, this.secret, { algorithm: "HS256" });
  }

  verify(token: string): QrTokenPayload {
    try {
      const decoded = jwt.verify(token, this.secret) as QrTokenPayload;
      return {
        memberId: decoded.memberId,
        licenseNumber: decoded.licenseNumber,
        season: decoded.season,
      };
    } catch {
      throw new InvalidTokenError();
    }
  }
}
