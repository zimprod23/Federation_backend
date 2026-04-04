import { Router, Request, Response, NextFunction } from "express";
import { ApiResponseBuilder } from "../../../shared/api-response";
import { createAuthenticate, requireRole } from "../middleware/authenticate";
import {
  IAuthTokenService,
  IMemberRepository,
  ICardRepository,
  IStorageService,
  ICardRenderer,
  ITokenSigner,
} from "../../../domain/interfaces";
import {
  GenerateCardUseCase,
  GetCardUseCase,
} from "../../../application/use-cases/card";
import { validateObjectId } from "../../../shared/mongoose.utils";
import z from "zod";
import { validate } from "../../../shared/validator";

const generateCardSchema = z.object({
  validFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  validUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
});

export function cardRouter(
  memberRepo: IMemberRepository,
  cardRepo: ICardRepository,
  storageService: IStorageService,
  cardRenderer: ICardRenderer,
  tokenSigner: ITokenSigner,
  authTokenSvc: IAuthTokenService,
): Router {
  const router = Router();
  const authenticate = createAuthenticate(authTokenSvc);

  // POST /cards/:memberId/generate
  router.post(
    "/:memberId/generate",
    authenticate,
    requireRole("super_admin", "federation_admin"),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        validateObjectId(String(req.params["memberId"]));
        const dto = validate(generateCardSchema, req.body);
        const uc = new GenerateCardUseCase(
          memberRepo,
          cardRepo,
          storageService,
          cardRenderer,
          tokenSigner,
        );
        const result = await uc.execute({
          memberId: String(req.params["memberId"]),
          validFrom: new Date(dto.validFrom),
          validUntil: new Date(dto.validUntil),
        });
        res
          .status(201)
          .json(ApiResponseBuilder.success(result, "Card generated"));
      } catch (err) {
        next(err);
      }
    },
  );

  // GET /cards/:memberId
  // GET /cards/:memberId
  router.get(
    "/:memberId",
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        validateObjectId(String(req.params["memberId"]));
        const season = req.query["season"]
          ? Number(req.query["season"])
          : undefined;
        const uc = new GetCardUseCase(cardRepo, memberRepo);
        const result = await uc.execute(String(req.params["memberId"]), season);
        res.status(200).json(ApiResponseBuilder.success(result));
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
}
