import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { validate } from "../../../shared/validator";
import { ApiResponseBuilder } from "../../../shared/api-response";
import { createAuthenticate, requireRole } from "../middleware/authenticate";
import { IClubRepository, IAuthTokenService } from "../../../domain/interfaces";
import {
  CreateClubUseCase,
  GetClubUseCase,
  ListClubsUseCase,
  UpdateClubStatusUseCase,
} from "../../../application/use-cases/club";
import { ClubStatus, Discipline } from "../../../domain/value-objects";
import { validateObjectId } from "../../../shared/mongoose.utils";
import { DeleteClubUseCase } from "../../../application/use-cases/club/DeleteClubUseCase";

const createClubSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  code: z.string().min(2).max(20).trim(),
  clubShort: z.string().min(1).max(10).trim(), // ← new
  region: z.string().min(1).trim(),
  city: z.string().min(1).trim(),
  disciplines: z.array(z.nativeEnum(Discipline)).min(1),
  presidentName: z.string().optional(),
  presidentEmail: z.string().email().optional(),
  presidentPhone: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.nativeEnum(ClubStatus),
});

const listClubsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export function clubRouter(
  clubRepo: IClubRepository,
  authTokenSvc: IAuthTokenService,
): Router {
  const router = Router();
  const authenticate = createAuthenticate(authTokenSvc);

  // POST /clubs
  router.post(
    "/",
    authenticate,
    requireRole("super_admin", "federation_admin"),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const dto = validate(createClubSchema, req.body);
        const uc = new CreateClubUseCase(clubRepo);
        const result = await uc.execute(dto);
        res
          .status(201)
          .json(ApiResponseBuilder.success(result, "Club created"));
      } catch (err) {
        next(err);
      }
    },
  );

  // GET /clubs
  router.get(
    "/",
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { page, limit } = validate(listClubsSchema, req.query);
        const uc = new ListClubsUseCase(clubRepo);
        const result = await uc.execute(page, limit);
        res
          .status(200)
          .json(
            ApiResponseBuilder.paginated(
              result.data,
              result.total,
              result.page,
              result.limit,
            ),
          );
      } catch (err) {
        next(err);
      }
    },
  );

  // GET /clubs/:id
  router.get(
    "/:id",
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        validateObjectId(String(req.params["id"]));
        const uc = new GetClubUseCase(clubRepo);
        const result = await uc.execute(String(req.params["id"]));
        res.status(200).json(ApiResponseBuilder.success(result));
      } catch (err) {
        next(err);
      }
    },
  );
  router.delete(
    "/:id",
    authenticate,
    requireRole("super_admin", "federation_admin"),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        validateObjectId(String(req.params["id"]));
        const uc = new DeleteClubUseCase(clubRepo);
        await uc.execute(String(req.params["id"]));
        res.status(204).send();
      } catch (err) {
        next(err);
      }
    },
  );
  // PATCH /clubs/:id/status
  router.patch(
    "/:id/status",
    authenticate,
    requireRole("super_admin", "federation_admin"),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        validateObjectId(String(req.params["id"]));
        const { status } = validate(updateStatusSchema, req.body);
        const uc = new UpdateClubStatusUseCase(clubRepo);
        const result = await uc.execute(String(req.params["id"]), status);
        res
          .status(200)
          .json(ApiResponseBuilder.success(result, "Club status updated"));
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
}
