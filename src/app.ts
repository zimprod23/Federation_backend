import express from "express";
import cors from "cors";
import helmet from "helmet";
import { getConfig } from "./shared/config";
import { connectDatabase } from "./infrastructure/database/connection";
import { errorHandler } from "./presentation/http/middleware/errorHandler";
import { apiLimiter } from "./presentation/http/middleware/rateLimiter";

// ── Repositories ──────────────────────────────────────────────────────────────
import { MongoMemberRepository } from "./infrastructure/database/mongoose/repositories/MongoMemberRepository";
import { MongoClubRepository } from "./infrastructure/database/mongoose/repositories/MongoClubRepository";
import { MongoUserRepository } from "./infrastructure/database/mongoose/repositories/MongoUserRepository";
import { MongoCardRepository } from "./infrastructure/database/mongoose/repositories/MongoCardRepository";

// ── Services ──────────────────────────────────────────────────────────────────
import { BcryptPasswordHasher } from "./infrastructure/security/BcryptPasswordHasher";
import { JwtAuthTokenService } from "./infrastructure/security/JwtAuthTokenService";
import { JwtTokenSigner } from "./infrastructure/security/JwtTokenSigner";
// import { S3StorageService } from "./infrastructure/storage/S3StorageService";
// import { CardRenderer } from "./infrastructure/pdf/CardRenderer";

// ── Routes ────────────────────────────────────────────────────────────────────
import { authRouter } from "./presentation/http/routes/auth.routes";
import { memberRouter } from "./presentation/http/routes/member.routes";
import { clubRouter } from "./presentation/http/routes/club.routes";
import { cardRouter } from "./presentation/http/routes/card.routes";
import { verificationRouter } from "./presentation/http/routes/verification.routes";
import { LocalStorageService } from "./infrastructure/security/LocalStorageService";
import { MongoVerificationLogRepository } from "./infrastructure/database/mongoose/repositories/MongoVerificationLogRepository";
import { MongoCompetitionRepository } from "./infrastructure/database/mongoose/repositories/MongoCompetitionRepository";
import { MongoEventRepository } from "./infrastructure/database/mongoose/repositories/MongoEventRepository";
import { MongoRegistrationRepository } from "./infrastructure/database/mongoose/repositories/MongoRegistrationRepository";
import { MongoResultRepository } from "./infrastructure/database/mongoose/repositories/MongoResultRepository";
import { competitionRouter } from "./presentation/http/routes/competition.route";
import { statsRouter } from "./presentation/http/routes/stats.routes";

export async function createApp() {
  const cfg = getConfig();

  // ── Database ─────────────────────────────────────────────────────────────────
  await connectDatabase(cfg.MONGO_URI);

  // ── Repositories ─────────────────────────────────────────────────────────────
  const memberRepo = new MongoMemberRepository();
  const clubRepo = new MongoClubRepository();
  const userRepo = new MongoUserRepository();
  const cardRepo = new MongoCardRepository();
  const verificationRepo = new MongoVerificationLogRepository();

  const competitionRepo = new MongoCompetitionRepository();
  const eventRepo = new MongoEventRepository();
  const registrationRepo = new MongoRegistrationRepository();
  const resultRepo = new MongoResultRepository();

  // ── Services ─────────────────────────────────────────────────────────────────
  const passwordHasher = new BcryptPasswordHasher();
  const authTokenSvc = new JwtAuthTokenService(cfg.JWT_AUTH_SECRET);
  const tokenSigner = new JwtTokenSigner(cfg.JWT_SECRET);

  const storageService =
    // cfg.STORAGE_DRIVER === "s3"
    //   ? new S3StorageService(
    //       cfg.AWS_REGION!,
    //       cfg.AWS_BUCKET!,
    //       cfg.AWS_PUBLIC_URL!,
    //     )
    //   :
    new LocalStorageService(cfg.LOCAL_UPLOAD_DIR, cfg.LOCAL_BASE_URL);

  // ── Express ───────────────────────────────────────────────────────────────────
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(apiLimiter);

  if (cfg.STORAGE_DRIVER === "local") {
    app.use(
      "/uploads",
      cors(), // ← allow cross-origin requests for images
      express.static(cfg.LOCAL_UPLOAD_DIR),
    );
  }

  // Serve uploaded files locally in dev
  if (cfg.STORAGE_DRIVER === "local") {
    app.use("/uploads", express.static(cfg.LOCAL_UPLOAD_DIR));
  }

  // ── Routes ───────────────────────────────────────────────────────────────────
  app.use("/api/v1/auth", authRouter(userRepo, passwordHasher, authTokenSvc));
  app.use(
    "/api/v1/members",
    memberRouter(memberRepo, clubRepo, storageService, authTokenSvc),
  );
  app.use("/api/v1/clubs", clubRouter(clubRepo, authTokenSvc));
  app.use(
    "/api/v1/cards",
    cardRouter(memberRepo, cardRepo, storageService, tokenSigner, authTokenSvc),
  );
  app.use("/api/v1/stats", statsRouter(authTokenSvc));
  app.use(
    "/api/v1/verify",
    verificationRouter(
      memberRepo,
      cardRepo,
      verificationRepo,
      tokenSigner,
      authTokenSvc,
    ),
  );

  app.use(
    "/api/v1/competitions",
    competitionRouter(
      competitionRepo,
      eventRepo,
      registrationRepo,
      resultRepo,
      memberRepo,
      authTokenSvc,
    ),
  );

  // ── Health check ──────────────────────────────────────────────────────────────
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ── 404 ───────────────────────────────────────────────────────────────────────
  app.use((_req, res) => {
    res.status(404).json({ success: false, error: "Route not found" });
  });

  // ── Error handler — must be last ──────────────────────────────────────────────
  app.use(errorHandler);

  return app;
}
