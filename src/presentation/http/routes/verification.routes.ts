import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { validate } from "../../../shared/validator";
import { ApiResponseBuilder } from "../../../shared/api-response";
import { createAuthenticate, requireRole } from "../middleware/authenticate";
import { verifyLimiter } from "../middleware/rateLimiter";
import {
  IAuthTokenService,
  IMemberRepository,
  ICardRepository,
  IVerificationLogRepository,
  ITokenSigner,
} from "../../../domain/interfaces";
import {
  VerifyTokenUseCase,
  LogScanUseCase,
} from "../../../application/use-cases/verification";

const logScanSchema = z.object({
  token: z.string().min(1),
  location: z.string().optional(),
});

export function verificationRouter(
  memberRepo: IMemberRepository,
  cardRepo: ICardRepository,
  verificationRepo: IVerificationLogRepository,
  tokenSigner: ITokenSigner,
  authTokenSvc: IAuthTokenService,
): Router {
  const router = Router();
  const authenticate = createAuthenticate(authTokenSvc);

  // GET /verify/:token  — public, no auth required
  router.get(
    "/:token",
    verifyLimiter,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const uc = new VerifyTokenUseCase(memberRepo, cardRepo, tokenSigner);
        const result = await uc.execute(String(req.params["token"]));
        res.status(200).json(ApiResponseBuilder.success(result));
      } catch (err) {
        next(err);
      }
    },
  );

  // POST /verify/scan  — authenticated scanners only
  router.post(
    "/scan",
    authenticate,
    requireRole("super_admin", "federation_admin", "scanner"),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const dto = validate(logScanSchema, req.body);
        const uc = new LogScanUseCase(
          memberRepo,
          cardRepo,
          verificationRepo,
          tokenSigner,
        );
        const result = await uc.execute({
          token: dto.token,
          location: dto.location,
          scannedBy: req.user!.userId,
        });
        res.status(200).json(ApiResponseBuilder.success(result));
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
}
