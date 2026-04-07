import { model, Schema, Document } from "mongoose";
import { ClubStatus, Discipline } from "../../../../domain/value-objects";

export interface IClubDocument extends Document {
  name: string;
  code: string;
  clubShort: string;
  region: string;
  city: string;
  status: ClubStatus;
  disciplines: Discipline[];
  presidentName?: string;
  presidentEmail?: string;
  presidentPhone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const clubSchema = new Schema<IClubDocument>(
  {
    name: { type: String, required: true, trim: true },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    clubShort: { type: String, required: true, trim: true, uppercase: true },
    region: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    status: {
      type: String,
      required: true,
      enum: Object.values(ClubStatus),
      default: ClubStatus.PENDING,
    },
    disciplines: [
      {
        type: String,
        enum: Object.values(Discipline),
      },
    ],
    presidentName: { type: String, trim: true },
    presidentEmail: { type: String, trim: true, lowercase: true },
    presidentPhone: { type: String, trim: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

clubSchema.index({ status: 1 });
clubSchema.index({ region: 1 });

export const ClubModel = model<IClubDocument>("Club", clubSchema);
