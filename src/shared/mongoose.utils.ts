import { Types } from "mongoose";
import { ValidationError } from "./errors";

export function validateObjectId(id: string, field = "id"): void {
  if (!Types.ObjectId.isValid(id)) {
    throw new ValidationError(`Invalid ${field} format: "${id}"`);
  }
}
