import dotenv from "dotenv";
import { initConfig, getConfig } from "../shared/config";
import {
  connectDatabase,
  DB,
  disconnectDatabase,
} from "../infrastructure/database/connection";
import { MongoUserRepository } from "../infrastructure/database/mongoose/repositories/MongoUserRepository";

import { BcryptPasswordHasher } from "../infrastructure/security/BcryptPasswordHasher";
import { User } from "../domain/entities/User";
import { logger } from "../shared/logger";
import { SqliteUserRepository } from "../infrastructure/database/sqlite/repositories/SqliteUserRepository";

dotenv.config();
async function seed(): Promise<void> {
  initConfig();
  const cfg = getConfig();

  await connectDatabase(cfg.SQLITE_PATH);

  const userRepo = new SqliteUserRepository(DB.conn);
  const passwordHasher = new BcryptPasswordHasher();

  const email = process.env["SEED_ADMIN_EMAIL"] ?? "admin@federation.ma";
  const password = process.env["SEED_ADMIN_PASSWORD"] ?? "ChangeMe123!";

  const existing = await userRepo.findByEmail(email);
  if (existing) {
    logger.info(`super_admin already exists: ${email} — skipping`, "Seed");
    await disconnectDatabase();
    return;
  }

  const hashed = await passwordHasher.hash(password);

  const admin = new User({
    email,
    password: hashed,
    role: "super_admin",
    isActive: true,
  });

  await userRepo.save(admin);

  logger.info("─────────────────────────────────────", "Seed");
  logger.info("super_admin created successfully", "Seed");
  logger.info(`Email:    ${email}`, "Seed");
  logger.info(`Password: ${password}`, "Seed");
  logger.info("⚠️  Change this password after login", "Seed");
  logger.info("─────────────────────────────────────", "Seed");

  await disconnectDatabase();
}

seed().catch((err: unknown) => {
  console.error("[Seed] Failed:", err);
  process.exit(1);
});

/**
 * import dotenv from "dotenv";
dotenv.config();

import { initConfig, getConfig } from "../shared/config";
import { connectDatabase, disconnectDatabase } from "../infrastructure/database/connection";
import { MongoUserRepository } from "../infrastructure/database/mongoose/repositories/MongoUserRepository";
import { BcryptPasswordHasher } from "../infrastructure/security/BcryptPasswordHasher";
import { User } from "../domain/entities/User";
import { logger } from "../shared/logger";

async function seed(): Promise<void> {
  initConfig();
  const cfg = getConfig();

  await connectDatabase(cfg.MONGO_URI);

  const userRepo       = new MongoUserRepository();
  const passwordHasher = new BcryptPasswordHasher();

  const email    = process.env["SEED_ADMIN_EMAIL"]    ?? "admin@federation.ma";
  const password = process.env["SEED_ADMIN_PASSWORD"] ?? "ChangeMe123!";

  // ── Check if super_admin already exists ───────────────────────────────────
  const existing = await userRepo.findByEmail(email);
  if (existing) {
    logger.info(`super_admin already exists: ${email} — skipping`, "Seed");
    await disconnectDatabase();
    return;
  }

  // ── Create super_admin ────────────────────────────────────────────────────
  const hashed = await passwordHasher.hash(password);

  const admin = new User({
    email,
    password: hashed,
    role:     "super_admin",
    isActive: true,
  });

  await userRepo.save(admin);

  logger.info("─────────────────────────────────────────", "Seed");
  logger.info("✅  super_admin created successfully",      "Seed");
  logger.info(`    Email:    ${email}`,                    "Seed");
  logger.info(`    Password: ${password}`,                 "Seed");
  logger.info("⚠️   Change this password after first login", "Seed");
  logger.info("─────────────────────────────────────────", "Seed");

  await disconnectDatabase();
}

seed().catch((err: unknown) => {
  logger.error("Seed failed", "Seed", err);
  process.exit(1);
});
 */
