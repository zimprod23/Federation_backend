import { model, Schema, Document, Types } from "mongoose";
import { RegistrationStatus } from "../../../../domain/entities/Registration";

export interface IRegistrationDocument extends Document {
  competitionId: Types.ObjectId;
  eventId: Types.ObjectId;
  memberId: Types.ObjectId;
  clubId?: Types.ObjectId;
  status: RegistrationStatus;
  lane?: number;
  bib?: number;
  registeredBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const registrationSchema = new Schema<IRegistrationDocument>(
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
    clubId: {
      type: Schema.Types.ObjectId,
      ref: "Club",
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(RegistrationStatus),
      default: RegistrationStatus.REGISTERED,
    },
    lane: { type: Number },
    bib: { type: Number },
    registeredBy: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

registrationSchema.index({ eventId: 1 });
registrationSchema.index({ memberId: 1 });
registrationSchema.index({ competitionId: 1 });
// Prevent duplicate registration for same member in same event
registrationSchema.index({ memberId: 1, eventId: 1 }, { unique: true });

export const RegistrationModel = model<IRegistrationDocument>(
  "Registration",
  registrationSchema,
);
