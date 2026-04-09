import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { validate } from "../../../shared/validator";
import { ApiResponseBuilder } from "../../../shared/api-response";
import { createAuthenticate, requireRole } from "../middleware/authenticate";
import { validateObjectId } from "../../../shared/mongoose.utils";
import {
  ICompetitionRepository,
  IEventRepository,
  IRegistrationRepository,
  IResultRepository,
  IMemberRepository,
  IAuthTokenService,
} from "../../../domain/interfaces";
import {
  CompetitionType,
  CompetitionStatus,
  EventDistance,
  MemberCategory,
} from "../../../domain/value-objects";
import { RegistrationStatus } from "../../../domain/entities/Registration";
import {
  CreateCompetitionUseCase,
  GetCompetitionUseCase,
  ListCompetitionsUseCase,
  UpdateCompetitionStatusUseCase,
  CreateEventUseCase,
  RegisterMemberUseCase,
  RecordResultUseCase,
  GetEventResultsUseCase,
} from "../../../application/use-cases/competition";

// ─── Schemas ──────────────────────────────────────────────────────────────────
const createCompetitionSchema = z.object({
  name: z.string().min(1).max(300).trim(),
  type: z.nativeEnum(CompetitionType),
  location: z.string().min(1).trim(),
  city: z.string().min(1).trim(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  season: z.coerce.number().int().min(2000).max(2100),
  description: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.nativeEnum(CompetitionStatus),
});

const listCompetitionsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.nativeEnum(CompetitionStatus).optional(),
  season: z.coerce.number().optional(),
  type: z.nativeEnum(CompetitionType).optional(),
});

const createEventSchema = z.object({
  distance: z.nativeEnum(EventDistance),
  category: z.nativeEnum(MemberCategory),
  gender: z.enum(["male", "female"]),
  scheduledAt: z.string().optional(),
});

const createRegistrationSchema = z.object({
  memberId: z.string().min(1),
});

const updateRegistrationStatusSchema = z.object({
  status: z.nativeEnum(RegistrationStatus),
});

const recordResultSchema = z.object({
  memberId: z.string().min(1),
  registrationId: z.string().min(1),
  rank: z.number().int().min(1).optional(),
  finalTime: z.string().optional(),
  splitTime500: z.string().optional(),
  strokeRate: z.number().min(0).optional(),
  heartRate: z.number().min(0).optional(),
  watts: z.number().min(0).optional(),
  notes: z.string().optional(),
});

// ─── Router ───────────────────────────────────────────────────────────────────
export function competitionRouter(
  competitionRepo: ICompetitionRepository,
  eventRepo: IEventRepository,
  registrationRepo: IRegistrationRepository,
  resultRepo: IResultRepository,
  memberRepo: IMemberRepository,
  authTokenSvc: IAuthTokenService,
): Router {
  const router = Router();
  const authenticate = createAuthenticate(authTokenSvc);

  // ── Competitions ─────────────────────────────────────────────────────────────

  // POST /competitions
  router.post(
    "/",
    authenticate,
    requireRole("super_admin", "federation_admin"),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const dto = validate(createCompetitionSchema, req.body);
        const uc = new CreateCompetitionUseCase(competitionRepo);
        const result = await uc.execute(dto, req.user!.userId);
        res
          .status(201)
          .json(ApiResponseBuilder.success(result, "Competition created"));
      } catch (err) {
        next(err);
      }
    },
  );

  // GET /competitions
  router.get(
    "/",
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const dto = validate(listCompetitionsSchema, req.query);
        const uc = new ListCompetitionsUseCase(competitionRepo);
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

  // GET /competitions/:id
  router.get(
    "/:id",
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        validateObjectId(String(req.params["id"]));
        const uc = new GetCompetitionUseCase(competitionRepo, eventRepo);
        const result = await uc.execute(String(req.params["id"]));
        res.status(200).json(ApiResponseBuilder.success(result));
      } catch (err) {
        next(err);
      }
    },
  );

  // PATCH /competitions/:id/status
  router.patch(
    "/:id/status",
    authenticate,
    requireRole("super_admin", "federation_admin"),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        validateObjectId(String(req.params["id"]));
        const { status } = validate(updateStatusSchema, req.body);
        const uc = new UpdateCompetitionStatusUseCase(competitionRepo);
        const result = await uc.execute(String(req.params["id"]), status);
        res
          .status(200)
          .json(ApiResponseBuilder.success(result, "Status updated"));
      } catch (err) {
        next(err);
      }
    },
  );

  // ── Events ────────────────────────────────────────────────────────────────────

  // POST /competitions/:id/events
  router.post(
    "/:id/events",
    authenticate,
    requireRole("super_admin", "federation_admin"),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        validateObjectId(String(req.params["id"]));
        const dto = validate(createEventSchema, req.body);
        const uc = new CreateEventUseCase(competitionRepo, eventRepo);
        const result = await uc.execute({
          competitionId: String(req.params["id"]),
          ...dto,
        });
        res
          .status(201)
          .json(ApiResponseBuilder.success(result, "Event created"));
      } catch (err) {
        next(err);
      }
    },
  );

  // ── Registrations ─────────────────────────────────────────────────────────────

  // POST /competitions/:id/events/:eventId/registrations
  router.post(
    "/:id/events/:eventId/registrations",
    authenticate,
    requireRole("super_admin", "federation_admin", "club_manager"),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        validateObjectId(String(req.params["id"]));
        validateObjectId(String(req.params["eventId"]));
        const dto = validate(createRegistrationSchema, req.body);
        const uc = new RegisterMemberUseCase(
          competitionRepo,
          eventRepo,
          registrationRepo,
          memberRepo,
        );
        const result = await uc.execute(
          {
            competitionId: String(req.params["id"]),
            eventId: String(req.params["eventId"]),
            memberId: dto.memberId,
          },
          req.user!.userId,
        );
        res
          .status(201)
          .json(ApiResponseBuilder.success(result, "Member registered"));
      } catch (err) {
        next(err);
      }
    },
  );

  // GET /competitions/:id/events/:eventId/registrations
  router.get(
    "/:id/events/:eventId/registrations",
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        validateObjectId(String(req.params["eventId"]));
        const registrations = await registrationRepo.findByEventId(
          String(req.params["eventId"]),
        );
        res.status(200).json(ApiResponseBuilder.success(registrations));
      } catch (err) {
        next(err);
      }
    },
  );

  // PATCH /competitions/:id/events/:eventId/registrations/:regId/status
  router.patch(
    "/:id/events/:eventId/registrations/:regId/status",
    authenticate,
    requireRole("super_admin", "federation_admin"),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        validateObjectId(String(req.params["regId"]));
        const { status } = validate(updateRegistrationStatusSchema, req.body);
        const registration = await registrationRepo.findById(
          String(req.params["regId"]),
        );
        if (!registration) {
          res
            .status(404)
            .json(ApiResponseBuilder.error("Registration not found"));
          return;
        }
        const updated = registration.withStatus(status);
        const saved = await registrationRepo.save(updated);
        res
          .status(200)
          .json(ApiResponseBuilder.success(saved, "Status updated"));
      } catch (err) {
        next(err);
      }
    },
  );

  // ── Results ───────────────────────────────────────────────────────────────────

  // POST /competitions/:id/events/:eventId/results
  router.post(
    "/:id/events/:eventId/results",
    authenticate,
    requireRole("super_admin", "federation_admin"),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        validateObjectId(String(req.params["id"]));
        validateObjectId(String(req.params["eventId"]));
        const dto = validate(recordResultSchema, req.body);
        const uc = new RecordResultUseCase(
          competitionRepo,
          eventRepo,
          registrationRepo,
          resultRepo,
        );
        const result = await uc.execute(
          {
            competitionId: String(req.params["id"]),
            eventId: String(req.params["eventId"]),
            memberId: dto.memberId,
            registrationId: dto.registrationId,
            rank: dto.rank,
            finalTime: dto.finalTime,
            splitTime500: dto.splitTime500,
            strokeRate: dto.strokeRate,
            heartRate: dto.heartRate,
            watts: dto.watts,
            notes: dto.notes,
          },
          req.user!.userId,
        );
        res
          .status(201)
          .json(ApiResponseBuilder.success(result, "Result recorded"));
      } catch (err) {
        next(err);
      }
    },
  );

  // GET /competitions/:id/events/:eventId/results
  router.get(
    "/:id/events/:eventId/results",
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        validateObjectId(String(req.params["eventId"]));
        const uc = new GetEventResultsUseCase(
          eventRepo,
          resultRepo,
          memberRepo,
        );
        const result = await uc.execute(String(req.params["eventId"]));
        res.status(200).json(ApiResponseBuilder.success(result));
      } catch (err) {
        next(err);
      }
    },
  );
  // DELETE /competitions/:id/events/:eventId
  router.delete(
    "/:id/events/:eventId",
    authenticate,
    requireRole("super_admin", "federation_admin"),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { id, eventId } = req.params;
        validateObjectId(String(id));
        validateObjectId(String(eventId));

        // 1. Basic check: Ensure competition exists and isn't completed
        const competition = await competitionRepo.findById(String(id));
        if (!competition)
          return res
            .status(404)
            .json(ApiResponseBuilder.error("Competition not found"));
        if (competition.status === CompetitionStatus.COMPLETED) {
          return res
            .status(400)
            .json(
              ApiResponseBuilder.error(
                "Cannot delete events of a completed competition",
              ),
            );
        }

        // 2. Direct Repo Calls to clean up children
        await resultRepo.deleteByEventId(String(eventId));
        await registrationRepo.deleteByEventId(String(eventId));

        // 3. Delete the event itself
        await eventRepo.delete(String(eventId));

        res
          .status(200)
          .json(
            ApiResponseBuilder.success(
              null,
              "Event and associated data deleted",
            ),
          );
      } catch (err) {
        next(err);
      }
    },
  );
  // DELETE /competitions/:id/events/:eventId/results
  router.delete(
    "/:id/events/:eventId/results",
    authenticate,
    requireRole("super_admin", "federation_admin"),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { eventId } = req.params;
        validateObjectId(String(eventId));

        // Direct call to repository to wipe results for this event
        // Note: Ensure your IResultRepository has a deleteByEventId method
        await resultRepo.deleteByEventId(String(eventId));

        res
          .status(200)
          .json(
            ApiResponseBuilder.success(null, "Results cleared for this event"),
          );
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
}
