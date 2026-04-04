import { IUserRepository } from "../../../../domain/interfaces";
import { User } from "../../../../domain/entities/User";
import { UserRole } from "../../../../domain/value-objects";
import { UserModel, IUserDocument } from "../models/UserModel";

export class MongoUserRepository implements IUserRepository {
  private toDomain(doc: IUserDocument): User {
    return new User({
      id: doc._id.toString(),
      email: doc.email,
      password: doc.password,
      role: doc.role as UserRole,
      memberId: doc.memberId?.toString(),
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private toPersistence(user: User): Partial<IUserDocument> {
    return {
      email: user.email,
      password: user.password,
      role: user.role,
      isActive: user.isActive,
      ...(user.memberId && {
        memberId: user.memberId as unknown as Schema.Types.ObjectId,
      }),
    };
  }

  async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id).lean();
    return doc ? this.toDomain(doc as IUserDocument) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email: email.toLowerCase() }).lean();
    return doc ? this.toDomain(doc as IUserDocument) : null;
  }

  async save(user: User): Promise<User> {
    const data = this.toPersistence(user);

    if (user.id) {
      const doc = await UserModel.findByIdAndUpdate(
        user.id,
        { $set: data },
        { new: true, runValidators: true },
      ).lean();
      return this.toDomain(doc as IUserDocument);
    }

    const doc = await UserModel.create(data);
    return this.toDomain(doc as unknown as IUserDocument);
  }
}

import { Schema } from "mongoose";
