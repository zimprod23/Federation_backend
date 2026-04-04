import "reflect-metadata";
import dotenv from "dotenv";
import { initConfig, getConfig } from "./shared/config";
import { createApp } from "./app";
import { logger } from "./shared/logger";
import { disconnectDatabase } from "./infrastructure/database/connection";

dotenv.config();

async function main(): Promise<void> {
  // Validate all env vars — exits with clear message if anything is missing
  initConfig();

  const cfg = getConfig();
  const app = await createApp();

  const server = app.listen(cfg.PORT, () => {
    logger.info(`Server running on port ${cfg.PORT}`, "Bootstrap");
    logger.info(`Environment: ${cfg.NODE_ENV}`, "Bootstrap");
  });

  // ── Graceful shutdown ─────────────────────────────────────────────────────────
  const shutdown = (signal: string) => {
    logger.info(`${signal} received — shutting down`, "Bootstrap");
    server.close(async () => {
      await disconnectDatabase();
      logger.info("Shutdown complete", "Bootstrap");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled rejection", "Bootstrap", reason);
    process.exit(1);
  });

  process.on("uncaughtException", (err) => {
    logger.error("Uncaught exception", "Bootstrap", err);
    process.exit(1);
  });
}

main().catch((err: unknown) => {
  console.error("Fatal error during startup:", err);
  process.exit(1);
});
