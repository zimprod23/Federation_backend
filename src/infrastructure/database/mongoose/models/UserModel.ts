import { model, Schema, Document } from "mongoose";
import { UserRole } from "../../../../domain/value-objects";

export interface IUserDocument extends Document {
  email: string;
  password: string;
  role: UserRole;
  memberId?: Schema.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: [
        "super_admin",
        "federation_admin",
        "club_manager",
        "scanner",
        "member",
      ],
    },
    memberId: { type: Schema.Types.ObjectId, ref: "Member" },
    isActive: { type: Boolean, required: true, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.index({ role: 1 });

export const UserModel = model<IUserDocument>("User", userSchema);
