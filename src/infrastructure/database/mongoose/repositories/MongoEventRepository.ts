import { Types } from "mongoose";
import { IEventRepository } from "../../../../domain/interfaces";
import { CompetitionEvent } from "../../../../domain/entities/CompetitionEvent";
import {
  EventDistance,
  EventStatus,
  MemberCategory,
  Gender,
} from "../../../../domain/value-objects";
import {
  CompetitionEventModel,
  ICompetitionEventDocument,
} from "../models/CompetitionEventModel";

export class MongoEventRepository implements IEventRepository {
  private toDomain(doc: ICompetitionEventDocument): CompetitionEvent {
    return new CompetitionEvent({
      id: doc._id.toString(),
      competitionId: doc.competitionId.toString(),
      distance: doc.distance as EventDistance,
      category: doc.category as MemberCategory,
      gender: doc.gender as Gender,
      status: doc.status as EventStatus,
      scheduledAt: doc.scheduledAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private toPersistence(
    event: CompetitionEvent,
  ): Partial<ICompetitionEventDocument> {
    return {
      competitionId: new Types.ObjectId(event.competitionId) as Types.ObjectId,
      distance: event.distance,
      category: event.category,
      gender: event.gender,
      status: event.status,
      scheduledAt: event.scheduledAt,
    };
  }

  async findById(id: string): Promise<CompetitionEvent | null> {
    const doc = await CompetitionEventModel.findById(id).lean();
    return doc ? this.toDomain(doc as ICompetitionEventDocument) : null;
  }

  async findByCompetitionId(
    competitionId: string,
  ): Promise<CompetitionEvent[]> {
    const docs = await CompetitionEventModel.find({
      competitionId: new Types.ObjectId(competitionId),
    })
      .sort({ distance: 1, category: 1 })
      .lean();
    return (docs as ICompetitionEventDocument[]).map((d) => this.toDomain(d));
  }

  async findByCompetitionAndFilter(
    competitionId: string,
    distance?: EventDistance,
    category?: MemberCategory,
    gender?: Gender,
  ): Promise<CompetitionEvent[]> {
    const query: Record<string, unknown> = {
      competitionId: new Types.ObjectId(competitionId),
    };
    if (distance) query["distance"] = distance;
    if (category) query["category"] = category;
    if (gender) query["gender"] = gender;

    const docs = await CompetitionEventModel.find(query).lean();
    return (docs as ICompetitionEventDocument[]).map((d) => this.toDomain(d));
  }

  async save(event: CompetitionEvent): Promise<CompetitionEvent> {
    const data = this.toPersistence(event);

    if (event.id) {
      const doc = await CompetitionEventModel.findByIdAndUpdate(
        event.id,
        { $set: data },
        { new: true, runValidators: true },
      ).lean();
      return this.toDomain(doc as ICompetitionEventDocument);
    }

    const doc = await CompetitionEventModel.create(data);
    return this.toDomain(doc as unknown as ICompetitionEventDocument);
  }

  async delete(id: string): Promise<void> {
    await CompetitionEventModel.findByIdAndDelete(id);
  }
}
