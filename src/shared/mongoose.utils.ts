import { Types } from "mongoose";
import { ValidationError } from "./errors";

// export function validateObjectId(id: string, field = "id"): void {
//   if (!Types.ObjectId.isValid(id)) {
//     throw new ValidationError(`Invalid ${field} format: "${id}"`);
//   }
// }

export function validateObjectId(id: string, field = "id"): void {
  // 1. Check if it's a valid MongoDB ObjectId (24-char hex)
  const isMongoId = Types.ObjectId.isValid(id);

  // 2. Check if it's a valid UUID (v4 format: 8-4-4-4-12 hex chars)
  const isUUID =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  if (!isMongoId && !isUUID) {
    throw new ValidationError(`Invalid ${field} format: "${id}"`);
  }
}
