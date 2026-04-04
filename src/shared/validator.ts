import { z, ZodSchema, ZodIssue } from "zod";
import { ValidationError } from "./errors";

export function validate<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ValidationError(formatZodError(result.error.issues));
  }

  return result.data;
}

function formatZodError(issues: ZodIssue[]): string {
  return issues
    .map((issue: ZodIssue) => {
      const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
      return `${path}${issue.message}`;
    })
    .join("; ");
}
