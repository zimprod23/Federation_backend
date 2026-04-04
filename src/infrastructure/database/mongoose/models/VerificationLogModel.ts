import { model, Schema, Document, Types } from "mongoose";
import { VerificationResult } from "../../../../domain/value-objects";

export interface IVerificationLogDocument extends Document {
  memberId?: Types.ObjectId;
  scannedBy: string;
  scannedAt: Date;
  location?: string;
  result: VerificationResult;
  rawToken: string;
  createdAt: Date;
  updatedAt: Date;
}

const verificationLogSchema = new Schema<IVerificationLogDocument>(
  {
    memberId: { type: Schema.Types.ObjectId, ref: "Member" },
    scannedBy: { type: String, required: true },
    scannedAt: { type: Date, required: true, default: Date.now },
    location: { type: String },
    result: {
      type: String,
      required: true,
      enum: ["valid", "suspended", "expired", "not_found"],
    },
    rawToken: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

verificationLogSchema.index({ memberId: 1 });
verificationLogSchema.index({ scannedAt: -1 });

export const VerificationLogModel = model<IVerificationLogDocument>(
  "VerificationLog",
  verificationLogSchema,
);
