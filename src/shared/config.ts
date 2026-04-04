import dotenv from "dotenv";
import { z, ZodIssue } from "zod";
dotenv.config();
const configSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  PORT: z.coerce.number().int().min(1).max(65535).default(3000),

  MONGO_URI: z.string().min(1, "MONGO_URI is required"),

  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),

  JWT_AUTH_SECRET: z
    .string()
    .min(32, "JWT_AUTH_SECRET must be at least 32 characters"),

  STORAGE_DRIVER: z.enum(["local", "s3"]).default("local"),

  LOCAL_UPLOAD_DIR: z.string().default("./uploads"),
  LOCAL_BASE_URL: z.string().url().default("http://localhost:3000/uploads"),

  AWS_REGION: z.string().optional(),
  AWS_BUCKET: z.string().optional(),
  AWS_PUBLIC_URL: z.string().url().optional(),
});

export type Config = z.infer<typeof configSchema>;

let _config: Config | undefined;

export function initConfig(): Config {
  const result = configSchema.safeParse(process.env);

  if (!result.success) {
    console.error("\n[Config] ❌  Invalid environment variables:\n");
    result.error.issues.forEach((issue: ZodIssue) => {
      console.error(`  • ${issue.path.join(".")}: ${issue.message}`);
    });
    console.error(
      "\nCopy .env.example → .env and fill in the missing values.\n",
    );
    process.exit(1);
  }

  const cfg = result.data;

  if (cfg.STORAGE_DRIVER === "s3") {
    const missing = (
      ["AWS_REGION", "AWS_BUCKET", "AWS_PUBLIC_URL"] as const
    ).filter((k) => !cfg[k]);

    if (missing.length > 0) {
      console.error(
        `[Config] ❌  STORAGE_DRIVER=s3 but missing: ${missing.join(", ")}\n`,
      );
      process.exit(1);
    }
  }

  _config = cfg;
  return _config;
}

export function getConfig(): Config {
  if (!_config) {
    throw new Error("Config not loaded — call initConfig() in index.ts first");
  }
  return _config;
}
