import { model, Schema, Document, Types } from "mongoose";
import {
  EventDistance,
  EventStatus,
  MemberCategory,
  Gender,
} from "../../../../domain/value-objects";

export interface ICompetitionEventDocument extends Document {
  competitionId: Types.ObjectId;
  distance: EventDistance;
  category: MemberCategory;
  gender: Gender;
  status: EventStatus;
  scheduledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const competitionEventSchema = new Schema<ICompetitionEventDocument>(
  {
    competitionId: {
      type: Schema.Types.ObjectId,
      ref: "Competition",
      required: true,
    },
    distance: {
      type: String,
      required: true,
      enum: Object.values(EventDistance),
    },
    category: {
      type: String,
      required: true,
      enum: Object.values(MemberCategory),
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female"],
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(EventStatus),
      default: EventStatus.SCHEDULED,
    },
    scheduledAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

competitionEventSchema.index({ competitionId: 1 });
competitionEventSchema.index({
  competitionId: 1,
  distance: 1,
  category: 1,
  gender: 1,
});

export const CompetitionEventModel = model<ICompetitionEventDocument>(
  "CompetitionEvent",
  competitionEventSchema,
);
