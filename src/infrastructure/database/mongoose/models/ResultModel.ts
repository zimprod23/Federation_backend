import { model, Schema, Document, Types } from "mongoose";

export interface IResultDocument extends Document {
  competitionId: Types.ObjectId;
  eventId: Types.ObjectId;
  memberId: Types.ObjectId;
  registrationId: Types.ObjectId;
  rank?: number;
  finalTime?: string;
  splitTime500?: string;
  strokeRate?: number;
  heartRate?: number;
  watts?: number;
  notes?: string;
  recordedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const resultSchema = new Schema<IResultDocument>(
  {
    competitionId: {
      type: Schema.Types.ObjectId,
      ref: "Competition",
      required: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "CompetitionEvent",
      required: true,
    },
    memberId: {
      type: Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    registrationId: {
      type: Schema.Types.ObjectId,
      ref: "Registration",
      required: true,
    },
    rank: { type: Number },
    finalTime: { type: String, trim: true },
    splitTime500: { type: String, trim: true },
    strokeRate: { type: Number },
    heartRate: { type: Number },
    watts: { type: Number },
    notes: { type: String, trim: true },
    recordedBy: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

resultSchema.index({ eventId: 1, rank: 1 });
resultSchema.index({ memberId: 1 });
resultSchema.index({ competitionId: 1 });
resultSchema.index({ memberId: 1, eventId: 1 }, { unique: true });

export const ResultModel = model<IResultDocument>("Result", resultSchema);
