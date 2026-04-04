import { model, Schema, Document, Types } from "mongoose";

export interface IMembershipCardDocument extends Document {
  memberId: Types.ObjectId;
  licenseNumber: string;
  season: number;
  cardNumber: string;
  pdfUrl?: string;
  qrPayload: string;
  isValid: boolean;
  validFrom: Date;
  validUntil: Date;
  generatedAt: Date;
  downloadedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const membershipCardSchema = new Schema<IMembershipCardDocument>(
  {
    memberId: {
      type: Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    licenseNumber: { type: String, required: true, trim: true },
    season: { type: Number, required: true },
    cardNumber: { type: String, required: true, unique: true },
    pdfUrl: { type: String },
    qrPayload: { type: String, required: true, unique: true },
    isValid: { type: Boolean, required: true, default: true },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    generatedAt: { type: Date, default: Date.now },
    downloadedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

membershipCardSchema.index({ memberId: 1, season: 1 });
membershipCardSchema.index({ qrPayload: 1 });
membershipCardSchema.index({ validUntil: 1 });

export const MembershipCardModel = model<IMembershipCardDocument>(
  "MembershipCard",
  membershipCardSchema,
);
