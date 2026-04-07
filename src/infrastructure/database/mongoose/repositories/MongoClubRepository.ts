import {
  IClubRepository,
  PaginatedResult,
  PaginationParams,
} from "../../../../domain/interfaces";
import { Club } from "../../../../domain/entities/Club";
import { ClubStatus, Discipline } from "../../../../domain/value-objects";
import { ClubModel, IClubDocument } from "../models/ClubModel";

export class MongoClubRepository implements IClubRepository {
  private toDomain(doc: IClubDocument): Club {
    return new Club({
      id: doc._id.toString(),
      name: doc.name,
      code: doc.code,
      clubShort: doc.clubShort ?? "", // ← new
      region: doc.region,
      city: doc.city,
      status: doc.status as ClubStatus,
      disciplines: doc.disciplines as Discipline[],
      presidentName: doc.presidentName,
      presidentEmail: doc.presidentEmail,
      presidentPhone: doc.presidentPhone,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private toPersistence(club: Club): Partial<IClubDocument> {
    return {
      name: club.name,
      code: club.code,
      clubShort: club.clubShort ?? "",
      region: club.region,
      city: club.city,
      status: club.status,
      disciplines: club.disciplines,
      presidentName: club.presidentName,
      presidentEmail: club.presidentEmail,
      presidentPhone: club.presidentPhone,
    };
  }
  async findById(id: string): Promise<Club | null> {
    const doc = await ClubModel.findById(id).lean();
    return doc ? this.toDomain(doc as IClubDocument) : null;
  }

  async findByCode(code: string): Promise<Club | null> {
    const doc = await ClubModel.findOne({ code: code.toUpperCase() }).lean();
    return doc ? this.toDomain(doc as IClubDocument) : null;
  }

  async findAll(pagination: PaginationParams): Promise<PaginatedResult<Club>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      ClubModel.find().skip(skip).limit(limit).lean(),
      ClubModel.countDocuments(),
    ]);

    return {
      data: (docs as IClubDocument[]).map((d) => this.toDomain(d)),
      total,
      page,
      limit,
    };
  }

  async save(club: Club): Promise<Club> {
    const data = this.toPersistence(club);

    if (club.id) {
      const doc = await ClubModel.findByIdAndUpdate(
        club.id,
        { $set: data },
        { new: true, runValidators: true },
      ).lean();
      return this.toDomain(doc as IClubDocument);
    }

    const doc = await ClubModel.create(data);
    return this.toDomain(doc as unknown as IClubDocument);
  }
}
