// import mongoose from "mongoose";
// import { logger } from "../../shared/logger";

// export async function connectDatabase(uri: string): Promise<void> {
//   mongoose.connection.on("connected", () =>
//     logger.info("Connected to MongoDB", "DB"),
//   );
//   mongoose.connection.on("disconnected", () =>
//     logger.warn("Disconnected from MongoDB", "DB"),
//   );
//   mongoose.connection.on("error", (err: unknown) =>
//     logger.error("MongoDB error", "DB", err),
//   );

//   await mongoose.connect(uri, {
//     serverSelectionTimeoutMS: 5000,
//     socketTimeoutMS: 45000,
//   });
// }

// export async function disconnectDatabase(): Promise<void> {
//   await mongoose.disconnect();
//   logger.info("Database disconnected", "DB");
// }

import Database from "better-sqlite3";
import { logger } from "../../shared/logger";
import fs from "fs";
import path from "path";

let instance: Database.Database | null = null;

/**
 * Initializes the SQLite database (singleton)
 */
// export async function connectDatabase(
//   path: string,
// ): Promise<Database.Database> {
//   try {
//     if (instance) {
//       return instance; // already initialized
//     }

//     instance = new Database(path, {
//       verbose: (msg) => logger.debug(String(msg), "SQL"),
//     });

//     // Performance & integrity pragmas
//     instance.pragma("journal_mode = WAL");
//     instance.pragma("synchronous = NORMAL");
//     instance.pragma("foreign_keys = ON");

//     logger.info(`Connected to SQLite database at: ${path}`, "DB");

//     return instance;
//   } catch (err) {
//     logger.error("Failed to connect to SQLite", "DB", err);
//     throw err;
//   }
// }

export async function connectDatabase(
  dbPath: string,
): Promise<Database.Database> {
  try {
    if (instance) return instance;

    instance = new Database(dbPath, {
      verbose: (msg) => logger.debug(String(msg), "SQL"),
    });

    // 1. Performance & Integrity Pragmas
    instance.pragma("journal_mode = WAL");
    instance.pragma("synchronous = NORMAL");
    instance.pragma("foreign_keys = ON");

    // 2. Load and Execute Schema
    // Path: src/infrastructure/database/sqlite/schema.sql
    const schemaFile = path.join(__dirname, "sqlite/schema.sql");

    if (fs.existsSync(schemaFile)) {
      const schema = fs.readFileSync(schemaFile, "utf8");
      instance.exec(schema);
      logger.info("Database schema initialized/verified", "DB");
    } else {
      logger.warn("Schema file not found, skipping initialization", "DB");
    }

    logger.info(`Connected to SQLite database at: ${dbPath}`, "DB");
    return instance;
  } catch (err) {
    logger.error("Failed to connect to SQLite", "DB", err);
    throw err;
  }
}

/**
 * Gracefully close the database connection
 */
export async function disconnectDatabase(): Promise<void> {
  if (!instance) {
    logger.warn("Attempted to close DB but no connection exists", "DB");
    return;
  }

  try {
    instance.close();
    instance = null;
    logger.info("SQLite database connection closed", "DB");
  } catch (err) {
    logger.error("Error while closing SQLite database", "DB", err);
    throw err;
  }
}

/**
 * Get the active DB connection
 */
export function getDb(): Database.Database {
  if (!instance) {
    throw new Error("Database not initialized. Call connectDatabase first.");
  }
  return instance;
}

/**
 * Optional global accessor (kept for compatibility)
 */
export const DB = {
  get conn(): Database.Database {
    if (!instance) {
      throw new Error("Database not initialized. Call connectDatabase first.");
    }
    return instance;
  },

  close(): void {
    if (instance) {
      instance.close();
      instance = null;
      logger.info("SQLite connection closed", "DB");
    }
  },
};
