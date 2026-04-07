import { model, Schema, Document } from "mongoose";
import { Gender, MemberStatus } from "../../../../domain/value-objects";

export interface IMemberDocument extends Document {
  licenseNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: Gender;
  email: string;
  phone?: string;
  photoUrl?: string;
  height?: number;
  armSpan?: number;
  weight?: number;
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
    dateOfBirth: { type: Date, required: true },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: { type: String, trim: true },
    photoUrl: { type: String },
    cin: { type: String, unique: true, trim: true },
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
