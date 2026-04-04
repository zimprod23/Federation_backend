import { Types, QueryFilter } from "mongoose";
import { IVerificationLogRepository } from "../../../../domain/interfaces";
import { VerificationLog } from "../../../../domain/entities/VerificationLog";
import { VerificationResult } from "../../../../domain/value-objects";
import {
  VerificationLogModel,
  IVerificationLogDocument,
} from "../models/VerificationLogModel";

export class MongoVerificationLogRepository implements IVerificationLogRepository {
  private toDomain(doc: IVerificationLogDocument): VerificationLog {
    return new VerificationLog({
      id: doc._id.toString(),
      memberId: doc.memberId?.toString(),
      scannedBy: doc.scannedBy,
      scannedAt: doc.scannedAt,
      location: doc.location,
      result: doc.result as VerificationResult,
      rawToken: doc.rawToken,
      createdAt: doc.createdAt,
    });
  }

  async save(log: VerificationLog): Promise<VerificationLog> {
    const data: Partial<IVerificationLogDocument> = {
      scannedBy: log.scannedBy,
      scannedAt: log.scannedAt,
      location: log.location,
      result: log.result,
      rawToken: log.rawToken,
      ...(log.memberId && {
        memberId: new Types.ObjectId(log.memberId) as Types.ObjectId,
      }),
    };

    const doc = await VerificationLogModel.create(data);
    return this.toDomain(doc as unknown as IVerificationLogDocument);
  }

  async findByMemberId(memberId: string): Promise<VerificationLog[]> {
    const filter: QueryFilter<IVerificationLogDocument> = {
      memberId: new Types.ObjectId(memberId) as Types.ObjectId,
    };

    const docs = await VerificationLogModel.find(filter)
      .sort({ scannedAt: -1 })
      .lean();

    return (docs as IVerificationLogDocument[]).map((d) => this.toDomain(d));
  }
}
