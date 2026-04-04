import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { validate } from "../../../shared/validator";
import { ApiResponseBuilder } from "../../../shared/api-response";
import { createAuthenticate, requireRole } from "../middleware/authenticate";
import { authLimiter } from "../middleware/rateLimiter";
import {
  IUserRepository,
  IPasswordHasher,
  IAuthTokenService,
} from "../../../domain/interfaces";
import {
  LoginUseCase,
  CreateUserUseCase,
  GetMeUseCase,
} from "../../../application/use-cases/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum([
    "super_admin",
    "federation_admin",
    "club_manager",
    "scanner",
    "member",
  ]),
  memberId: z.string().optional(),
});

export function authRouter(
  userRepo: IUserRepository,
  passwordHasher: IPasswordHasher,
  authTokenSvc: IAuthTokenService,
): Router {
  const router = Router();
  const authenticate = createAuthenticate(authTokenSvc);

  // POST /auth/login
  router.post(
    "/login",
    authLimiter,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const dto = validate(loginSchema, req.body);
        const uc = new LoginUseCase(userRepo, passwordHasher, authTokenSvc);
        const result = await uc.execute(dto.email, dto.password);
        res
          .status(200)
          .json(ApiResponseBuilder.success(result, "Login successful"));
      } catch (err) {
        next(err);
      }
    },
  );

  // POST /auth/users  — admin creates system accounts
  router.post(
    "/users",
    authenticate,
    requireRole("super_admin", "federation_admin"),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const dto = validate(createUserSchema, req.body);
        const uc = new CreateUserUseCase(userRepo, passwordHasher);
        const result = await uc.execute(dto);
        res
          .status(201)
          .json(ApiResponseBuilder.success(result, "User created"));
      } catch (err) {
        next(err);
      }
    },
  );

  // GET /auth/me
  router.get(
    "/me",
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const uc = new GetMeUseCase(userRepo);
        const result = await uc.execute(req.user!.userId);
        res.status(200).json(ApiResponseBuilder.success(result));
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
}
