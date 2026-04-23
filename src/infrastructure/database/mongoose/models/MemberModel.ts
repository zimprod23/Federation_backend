import { model, Schema, Document } from "mongoose";
import {
  Gender,
  MemberStatus,
  PositionType,
} from "../../../../domain/value-objects";

export interface IMemberDocument extends Document {
  licenseNumber: string;
  firstName: string;
  lastName: string;
  firstNameAr: string;
  lastNameAr: string;
  dateOfBirth: Date;
  gender: Gender;
  email?: string;
  phone?: string;
  photoUrl?: string;
  height?: number;
  armSpan?: number;
  weight?: number;
  position?: PositionType;
  cin?: string;
  status: MemberStatus;
  clubId?: Schema.Types.ObjectId;
  season: number;
  qrToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const memberSchema = new Schema<IMemberDocument>(
  {
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    firstNameAr: { type: String, required: true, trim: true },
    lastNameAr: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female"],
    },
    position: {
      type: String,
      required: false,
      enum: Object.values(PositionType),
      default: PositionType.Athlete,
    },

    email: {
      type: String,
      required: false, // Changed to false
      trim: true,
      lowercase: true,
      // Remove unique: true from here, we handle it via index below
    },
    phone: { type: String, required: false, trim: true },
    photoUrl: { type: String },
    cin: { type: String, required: false, /*unique: true,*/ trim: true },
    // Physical stats
    height: { type: Number, min: 100, max: 250 }, // cm
    armSpan: { type: Number, min: 100, max: 250 }, // cm
    weight: { type: Number, min: 30, max: 200 }, // kg

    status: {
      type: String,
      required: true,
      enum: Object.values(MemberStatus),
      default: MemberStatus.PENDING,
    },
    clubId: { type: Schema.Types.ObjectId, ref: "Club" },
    season: { type: Number, required: true },
    qrToken: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
memberSchema.index(
  { cin: 1 },
  {
    unique: true,
    partialFilterExpression: { cin: { $exists: true, $ne: null } },
  },
);
memberSchema.index(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: { email: { $type: "string" } },
  },
);
memberSchema.index({ status: 1 });
memberSchema.index({ season: 1 });
memberSchema.index({ clubId: 1 });
memberSchema.index({ gender: 1 });
memberSchema.index({
  firstName: "text",
  lastName: "text",
  licenseNumber: "text",
});

export const MemberModel = model<IMemberDocument>("Member", memberSchema);
