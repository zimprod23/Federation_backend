import { model, Schema, Document } from "mongoose";
import {
  CompetitionType,
  CompetitionStatus,
} from "../../../../domain/value-objects";

export interface ICompetitionDocument extends Document {
  name: string;
  type: CompetitionType;
  status: CompetitionStatus;
  location: string;
  city: string;
  startDate: Date;
  endDate: Date;
  season: number;
  description?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const competitionSchema = new Schema<ICompetitionDocument>(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: Object.values(CompetitionType),
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(CompetitionStatus),
      default: CompetitionStatus.DRAFT,
    },
    location: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    season: { type: Number, required: true },
    description: { type: String, trim: true },
    createdBy: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

competitionSchema.index({ status: 1 });
competitionSchema.index({ season: 1 });
competitionSchema.index({ type: 1 });
competitionSchema.index({ startDate: -1 });

export const CompetitionModel = model<ICompetitionDocument>(
  "Competition",
  competitionSchema,
);
