import { Types, QueryFilter } from "mongoose";
import { IResultRepository } from "../../../../domain/interfaces";
import { Result } from "../../../../domain/entities/Result";
import { ResultModel, IResultDocument } from "../models/ResultModel";

export class MongoResultRepository implements IResultRepository {
  private toDomain(doc: IResultDocument): Result {
    return new Result({
      id: doc._id.toString(),
      competitionId: doc.competitionId.toString(),
      eventId: doc.eventId.toString(),
      memberId: doc.memberId.toString(),
      registrationId: doc.registrationId.toString(),
      rank: doc.rank,
      finalTime: doc.finalTime,
      splitTime500: doc.splitTime500,
      strokeRate: doc.strokeRate,
      heartRate: doc.heartRate,
      watts: doc.watts,
      notes: doc.notes,
      recordedBy: doc.recordedBy,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private toPersistence(result: Result): Partial<IResultDocument> {
    return {
      competitionId: new Types.ObjectId(result.competitionId) as Types.ObjectId,
      eventId: new Types.ObjectId(result.eventId) as Types.ObjectId,
      memberId: new Types.ObjectId(result.memberId) as Types.ObjectId,
      registrationId: new Types.ObjectId(
        result.registrationId,
      ) as Types.ObjectId,
      rank: result.rank,
      finalTime: result.finalTime,
      splitTime500: result.splitTime500,
      strokeRate: result.strokeRate,
      heartRate: result.heartRate,
      watts: result.watts,
      notes: result.notes,
      recordedBy: result.recordedBy,
    };
  }

  async findByEventId(eventId: string): Promise<Result[]> {
    const filter: QueryFilter<IResultDocument> = {
      eventId: new Types.ObjectId(eventId) as Types.ObjectId,
    };
    const docs = await ResultModel.find(filter).sort({ rank: 1 }).lean();
    return (docs as IResultDocument[]).map((d) => this.toDomain(d));
  }

  async findByMemberAndEvent(
    memberId: string,
    eventId: string,
  ): Promise<Result | null> {
    const filter: QueryFilter<IResultDocument> = {
      memberId: new Types.ObjectId(memberId) as Types.ObjectId,
      eventId: new Types.ObjectId(eventId) as Types.ObjectId,
    };
    const doc = await ResultModel.findOne(filter).lean();
    return doc ? this.toDomain(doc as IResultDocument) : null;
  }

  async findByCompetitionId(competitionId: string): Promise<Result[]> {
    const filter: QueryFilter<IResultDocument> = {
      competitionId: new Types.ObjectId(competitionId) as Types.ObjectId,
    };
    const docs = await ResultModel.find(filter)
      .sort({ eventId: 1, rank: 1 })
      .lean();
    return (docs as IResultDocument[]).map((d) => this.toDomain(d));
  }

  async save(result: Result): Promise<Result> {
    const data = this.toPersistence(result);

    if (result.id) {
      const doc = await ResultModel.findByIdAndUpdate(
        result.id,
        { $set: data },
        { new: true, runValidators: true },
      ).lean();
      return this.toDomain(doc as IResultDocument);
    }

    const doc = await ResultModel.create(data);
    return this.toDomain(doc as unknown as IResultDocument);
  }
  async deleteByEventId(eventId: string): Promise<void> {
    // Deletes all results associated with the specific event
    await ResultModel.deleteMany({ eventId: eventId });
  }
}
