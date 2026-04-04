import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import { z } from "zod";
import { validate } from "../../../shared/validator";
import { ApiResponseBuilder } from "../../../shared/api-response";
import { createAuthenticate, requireRole } from "../middleware/authenticate";
import {
  IAuthTokenService,
  IMemberRepository,
  IStorageService,
} from "../../../domain/interfaces";
import {
  CreateMemberUseCase,
  GetMemberUseCase,
  ListMembersUseCase,
  UpdateMemberUseCase,
  UploadMemberPhotoUseCase,
  DeleteMemberUseCase,
} from "../../../application/use-cases/member";
import {
  Discipline,
  MemberLevel,
  MemberStatus,
} from "../../../domain/value-objects";
import { validateObjectId } from "../../../shared/mongoose.utils";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG and WEBP images are allowed"));
    }
  },
});

const createMemberSchema = z.object({
  firstName: z.string().min(1).max(100).trim(),
  lastName: z.string().min(1).max(100).trim(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format"),
  gender: z.enum(["male", "female", "other"]),
  email: z.string().email(),
  phone: z.string().optional(),
  disciplines: z.array(z.nativeEnum(Discipline)).min(1),
  level: z.nativeEnum(MemberLevel),
  clubId: z.string().optional(),
});

const updateMemberSchema = z
  .object({
    firstName: z.string().min(1).max(100).trim().optional(),
    lastName: z.string().min(1).max(100).trim().optional(),
    phone: z.string().optional(),
    disciplines: z.array(z.nativeEnum(Discipline)).optional(),
    level: z.nativeEnum(MemberLevel).optional(),
    clubId: z.string().optional(),
    status: z.nativeEnum(MemberStatus).optional(),
  })
  .strict();

const listMembersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.nativeEnum(MemberStatus).optional(),
  discipline: z.nativeEnum(Discipline).optional(),
  clubId: z.string().optional(),
  season: z.coerce.number().optional(),
  search: z.string().optional(),
});

export function memberRouter(
  memberRepo: IMemberRepository,
  storageService: IStorageService,
  authTokenSvc: IAuthTokenService,
): Router {
  const router = Router();
  const authenticate = createAuthenticate(authTokenSvc);

  // POST /members
  router.post(
    "/",
    authenticate,
    requireRole("super_admin", "federation_admin"),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const dto = validate(createMemberSchema, req.body);
        const uc = new CreateMemberUseCase(memberRepo);
        const result = await uc.execute(dto);
        res
          .status(201)
          .json(ApiResponseBuilder.success(result, "Member created"));
      } catch (err) {
        next(err);
      }
    },
  );

  // GET /members
  router.get(
    "/",
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const dto = validate(listMembersSchema, req.query);
        const uc = new ListMembersUseCase(memberRepo);
        const result = await uc.execute(dto);
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

  // GET /members/:id
  router.get(
    "/:id",
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        validateObjectId(String(req.params["id"]));

        const uc = new GetMemberUseCase(memberRepo);
        const result = await uc.execute(String(req.params["id"]));
        res.status(200).json(ApiResponseBuilder.success(result));
      } catch (err) {
        next(err);
      }
    },
  );

  // PATCH /members/:id
  router.patch(
    "/:id",
    authenticate,
    requireRole("super_admin", "federation_admin", "club_manager"),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        validateObjectId(String(req.params["id"]));

        const dto = validate(updateMemberSchema, req.body);
        const uc = new UpdateMemberUseCase(memberRepo);
        const result = await uc.execute(String(req.params["id"]), dto);
        res
          .status(200)
          .json(ApiResponseBuilder.success(result, "Member updated"));
      } catch (err) {
        next(err);
      }
    },
  );

  // POST /members/:id/photo
  router.post(
    "/:id/photo",
    authenticate,
    requireRole("super_admin", "federation_admin"),
    upload.single("photo"),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.file) {
          res
            .status(400)
            .json(ApiResponseBuilder.error("No photo file provided"));
          return;
        }
        const uc = new UploadMemberPhotoUseCase(memberRepo, storageService);
        const result = await uc.execute(
          String(req.params["id"]),
          req.file.buffer,
          req.file.mimetype,
        );
        res
          .status(200)
          .json(ApiResponseBuilder.success(result, "Photo uploaded"));
      } catch (err) {
        next(err);
      }
    },
  );

  // DELETE /members/:id
  router.delete(
    "/:id",
    authenticate,
    requireRole("super_admin"),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        validateObjectId(String(req.params["id"]));

        const uc = new DeleteMemberUseCase(memberRepo);
        await uc.execute(String(req.params["id"]));
        res
          .status(200)
          .json(ApiResponseBuilder.success(null, "Member suspended"));
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
}
