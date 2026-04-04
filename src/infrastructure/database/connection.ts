import mongoose from "mongoose";
import { logger } from "../../shared/logger";

export async function connectDatabase(uri: string): Promise<void> {
  mongoose.connection.on("connected", () =>
    logger.info("Connected to MongoDB", "DB"),
  );
  mongoose.connection.on("disconnected", () =>
    logger.warn("Disconnected from MongoDB", "DB"),
  );
  mongoose.connection.on("error", (err: unknown) =>
    logger.error("MongoDB error", "DB", err),
  );

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  logger.info("Database disconnected", "DB");
}
