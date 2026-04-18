import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import { z } from "zod";
import { validate } from "../../../shared/validator";
import { ApiResponseBuilder } from "../../../shared/api-response";
import { createAuthenticate, requireRole } from "../middleware/authenticate";
import {
  IAuthTokenService,
  IClubRepository,
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
  AdjustLicenseNumberUseCase,
} from "../../../application/use-cases/member";
import {
  Discipline,
  MemberCategory,
  MemberLevel,
  MemberStatus,
  PositionType,
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
  firstNameAr: z.string().min(1).max(100).trim(),
  lastNameAr: z.string().min(1).max(100).trim(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format"),
  gender: z.enum(["male", "female"]),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  height: z.number().min(100).max(250).optional(),
  armSpan: z.number().min(100).max(250).optional(),
  position: z.nativeEnum(PositionType).optional(),
  cin: z.string().min(1).max(20).trim().optional(),
  weight: z.number().min(30).max(200).optional(),
  clubId: z.string().optional(),
});

const updateMemberSchema = z
  .object({
    firstName: z.string().min(1).max(100).trim().optional(),
    lastName: z.string().min(1).max(100).trim().optional(),
    firstNameAr: z.string().min(1).max(100).trim().optional(),
    lastNameAr: z.string().min(1).max(100).trim().optional(),
    dateOfBirth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format")
      .optional(),
    phone: z.string().optional(),
    height: z.number().min(100).max(250).optional(),
    armSpan: z.number().min(100).max(250).optional(),
    weight: z.number().min(30).max(200).optional(),
    cin: z.string().min(1).max(20).trim().optional(),
    clubId: z.string().optional(),
    status: z.nativeEnum(MemberStatus).optional(),
    position: z.nativeEnum(PositionType).optional(),
  })
  .strict();

const listMembersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.nativeEnum(MemberStatus).optional(),
  gender: z.enum(["male", "female"]).optional(),
  category: z.nativeEnum(MemberCategory).optional(),
  cin: z.string().min(1).max(20).trim().optional(),
  clubId: z.string().optional(),
  season: z.coerce.number().optional(),
  search: z.string().optional(),
});

const adjustLicenseNumberSchema = z.object({
  clubId: z.string().optional(),
  season: z.coerce.number().optional(),
});

export function memberRouter(
  memberRepo: IMemberRepository,
  clubRepo: IClubRepository,
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
        const uc = new CreateMemberUseCase(memberRepo, clubRepo);
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

  // POST /members/adjust-license
  router.post(
    "/adjust-license",
    authenticate,
    requireRole("super_admin", "federation_admin"),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const dto = validate(adjustLicenseNumberSchema, req.query);
        const uc = new AdjustLicenseNumberUseCase(memberRepo, clubRepo);
        const result = await uc.execute(dto);
        res
          .status(200)
          .json(
            ApiResponseBuilder.success(
              result,
              `License numbers adjusted for ${result.adjustedCount} members`,
            ),
          );
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
        const uc = new UpdateMemberUseCase(memberRepo, clubRepo);
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
