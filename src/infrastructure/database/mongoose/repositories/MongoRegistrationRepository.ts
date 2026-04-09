import { Types, QueryFilter } from "mongoose";
import { IRegistrationRepository } from "../../../../domain/interfaces";
import {
  Registration,
  RegistrationStatus,
} from "../../../../domain/entities/Registration";
import {
  RegistrationModel,
  IRegistrationDocument,
} from "../models/RegistrationModel";

export class MongoRegistrationRepository implements IRegistrationRepository {
  private toDomain(doc: IRegistrationDocument): Registration {
    return new Registration({
      id: doc._id.toString(),
      competitionId: doc.competitionId.toString(),
      eventId: doc.eventId.toString(),
      memberId: doc.memberId.toString(),
      clubId: doc.clubId?.toString(),
      status: doc.status as RegistrationStatus,
      lane: doc.lane,
      bib: doc.bib,
      registeredBy: doc.registeredBy,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private toPersistence(r: Registration): Partial<IRegistrationDocument> {
    return {
      competitionId: new Types.ObjectId(r.competitionId) as Types.ObjectId,
      eventId: new Types.ObjectId(r.eventId) as Types.ObjectId,
      memberId: new Types.ObjectId(r.memberId) as Types.ObjectId,
      clubId: r.clubId
        ? (new Types.ObjectId(r.clubId) as Types.ObjectId)
        : undefined,
      status: r.status,
      lane: r.lane,
      bib: r.bib,
      registeredBy: r.registeredBy,
    };
  }

  async findById(id: string): Promise<Registration | null> {
    const doc = await RegistrationModel.findById(id).lean();
    return doc ? this.toDomain(doc as IRegistrationDocument) : null;
  }

  async findByEventId(eventId: string): Promise<Registration[]> {
    const filter: QueryFilter<IRegistrationDocument> = {
      eventId: new Types.ObjectId(eventId) as Types.ObjectId,
    };
    const docs = await RegistrationModel.find(filter).lean();
    return (docs as IRegistrationDocument[]).map((d) => this.toDomain(d));
  }

  async findByMemberAndEvent(
    memberId: string,
    eventId: string,
  ): Promise<Registration | null> {
    const filter: QueryFilter<IRegistrationDocument> = {
      memberId: new Types.ObjectId(memberId) as Types.ObjectId,
      eventId: new Types.ObjectId(eventId) as Types.ObjectId,
    };
    const doc = await RegistrationModel.findOne(filter).lean();
    return doc ? this.toDomain(doc as IRegistrationDocument) : null;
  }

  async findByMemberAndCompetition(
    memberId: string,
    competitionId: string,
  ): Promise<Registration[]> {
    const filter: QueryFilter<IRegistrationDocument> = {
      memberId: new Types.ObjectId(memberId) as Types.ObjectId,
      competitionId: new Types.ObjectId(competitionId) as Types.ObjectId,
    };
    const docs = await RegistrationModel.find(filter).lean();
    return (docs as IRegistrationDocument[]).map((d) => this.toDomain(d));
  }

  async save(registration: Registration): Promise<Registration> {
    const data = this.toPersistence(registration);

    if (registration.id) {
      const doc = await RegistrationModel.findByIdAndUpdate(
        registration.id,
        { $set: data },
        { new: true, runValidators: true },
      ).lean();
      return this.toDomain(doc as IRegistrationDocument);
    }

    const doc = await RegistrationModel.create(data);
    return this.toDomain(doc as unknown as IRegistrationDocument);
  }
  async deleteByEventId(eventId: string): Promise<void> {
    // Deletes all registered members for that specific event
    await RegistrationModel.deleteMany({ eventId: eventId });
  }
}
